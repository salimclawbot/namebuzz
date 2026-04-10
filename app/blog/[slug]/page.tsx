import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()_=+[{]}\\|;:'\",<.>/?]/g, "")
    .replace(/\s+/g, "-");
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

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPost(params.slug);

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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
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
