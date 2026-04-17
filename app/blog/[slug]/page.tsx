import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";
import { seedSales, domainToSlug } from "@/lib/seed-sales";

// Mapping: blog slug → { saleSlug, relatedPosts[] }
const BLOG_SALE_MAP: Record<string, { saleSlug: string; relatedPosts: string[] }> = {
  "ai-com-sold-70-million": {
    saleSlug: "ai-com",
    relatedPosts: ["x-ai-sold-5-million", "data-ai-sold-1-8-million", "voice-ai-sold-1-5-million"],
  },
  "x-ai-sold-5-million": {
    saleSlug: "x-ai",
    relatedPosts: ["ai-com-sold-70-million", "data-ai-sold-1-8-million", "voice-ai-sold-1-5-million"],
  },
  "data-ai-sold-1-8-million": {
    saleSlug: "data-ai",
    relatedPosts: ["ai-com-sold-70-million", "voice-ai-sold-1-5-million", "cloud-ai-sold-600000"],
  },
  "voice-ai-sold-1-5-million": {
    saleSlug: "voice-ai",
    relatedPosts: ["data-ai-sold-1-8-million", "x-ai-sold-5-million", "cloud-ai-sold-600000"],
  },
  "cloud-ai-sold-600000": {
    saleSlug: "cloud-ai",
    relatedPosts: ["wisdom-ai-sold-750000", "genesis-ai-sold-400000", "lotus-ai-sold-400000"],
  },
  "genesis-ai-sold-400000": {
    saleSlug: "genesis-ai",
    relatedPosts: ["cloud-ai-sold-600000", "wisdom-ai-sold-750000", "lotus-ai-sold-400000"],
  },
  "wisdom-ai-sold-750000": {
    saleSlug: "wisdom-ai",
    relatedPosts: ["cloud-ai-sold-600000", "genesis-ai-sold-400000", "lotus-ai-sold-400000"],
  },
  "lotus-ai-sold-400000": {
    saleSlug: "lotus-ai",
    relatedPosts: ["genesis-ai-sold-400000", "cloud-ai-sold-600000", "wisdom-ai-sold-750000"],
  },
};

// Second individual sale link per blog article
const SECOND_SALE_SLUGS: Record<string, string> = {
  "ai-com-sold-70-million": "x-ai",
  "x-ai-sold-5-million": "data-ai",
  "data-ai-sold-1-8-million": "voice-ai",
  "voice-ai-sold-1-5-million": "x-ai",
  "cloud-ai-sold-600000": "lotus-ai",
  "genesis-ai-sold-400000": "lotus-ai",
  "wisdom-ai-sold-750000": "cloud-ai",
  "lotus-ai-sold-400000": "genesis-ai",
};

// GithubSlugger-compatible: strips non-alphanumeric except spaces/hyphens, then converts spaces to hyphens
function toSlug(text: string) {
  return text
    .replace("—", "-")  // em-dash → single hyphen (matches GithubSlugger behavior)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // remove everything except alphanumeric, space, hyphen
    .replace(/\s+/g, "-")           // spaces → hyphens
    .replace(/-+/g, "-")             // collapse multiple hyphens
    .replace(/^-|-$/g, "");          // trim leading/trailing hyphens
}

function getH2Toc(markdown: string) {
  const matches = markdown.match(/^##\s+(.+)$/gm) ?? [];
  return matches.map((line) => {
    const text = line.replace(/^##\s+/, "").trim();
    return { text, id: toSlug(text) };
  });
}

function tryParseSchema(value: unknown) {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {};
  }

  const url = `https://namebuzz.co/blog/${post.slug}`;

  return {
    title: `${post.title} | NameBuzz`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: "NameBuzz",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const toc = getH2Toc(post.content);
  const faqSchema = tryParseSchema(post.schema_faq);
  const articleSchema =
    tryParseSchema(post.schema_article) ??
    ({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Person", name: post.author },
      mainEntityOfPage: `https://namebuzz.co/blog/${post.slug}`,
      publisher: {
        "@type": "Organization",
        name: "NameBuzz",
        url: "https://namebuzz.co",
      },
    } as const);

  const mapping = BLOG_SALE_MAP[slug];
  const secondSaleSlug = SECOND_SALE_SLUGS[slug];
  const relatedBlogPosts = mapping
    ? blogPosts.filter((p) => mapping.relatedPosts.includes(p.slug))
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:px-6">
      <div className="mb-6 text-sm text-zinc-400">
        <Link href="/blog" className="hover:text-[#00FF88]">Blog</Link>
        <span className="mx-2">/</span>
        <span>{post.title}</span>
      </div>

      <header className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-zinc-300">{post.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <span>By {post.author}</span>
          <span>•</span>
          <span>{post.readTime}</span>
          <span>•</span>
          <span>Published {post.date}</span>
          <span>•</span>
          <span>Last updated {post.date}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
        <article className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-[#00FF88]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeRaw,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "append" }],
            ]}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Table of contents</p>
            <ul className="space-y-2 text-sm text-zinc-300">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="hover:text-[#00FF88]">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Internal links: two individual sale cards + browse all */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {mapping && (
          <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Featured sale</p>
            <Link
              href={`/sales/${mapping.saleSlug}`}
              className="text-lg font-semibold text-[#00FF88] hover:underline"
            >
              View this .ai domain sale →
            </Link>
            <p className="mt-1 text-sm text-zinc-400">See full price details, comparables, and market context.</p>
          </div>
        )}
        {secondSaleSlug && (
          <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Another notable sale</p>
            <Link
              href={`/sales/${secondSaleSlug}`}
              className="text-lg font-semibold text-[#FFD700] hover:underline"
            >
              See another top .ai sale →
            </Link>
            <p className="mt-1 text-sm text-zinc-400">Compare prices across the NameBuzz database.</p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-[#1F1F1F] bg-[#111] p-4 text-center">
        <Link
          href="/sales"
          className="text-sm font-semibold text-[#00D4FF] hover:underline"
        >
          Browse all {seedSales.length.toLocaleString()} verified .ai domain sales →
        </Link>
      </div>

      {relatedBlogPosts.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#1F1F1F] bg-[#111] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Related articles</p>
          <div className="flex flex-col gap-2">
            {relatedBlogPosts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="text-sm text-[#00FF88] hover:underline"
              >
                → {rp.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </main>
  );
}
