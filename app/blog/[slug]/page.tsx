import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | NameBuzz`,
    description: post.description,
    alternates: { canonical: `https://namebuzz.co/blog/${slug}` },
    openGraph: {
      title: `${post.title} | NameBuzz`,
      description: post.description,
      url: `https://namebuzz.co/blog/${slug}`,
      type: "article",
    },
  };
}

/** Convert a heading string to a slug id e.g. "Hello World!" → "hello-world" */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/_/g, "-")
    .replace(/ /g, "-");
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  function inlineFormat(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let k = 0;
    const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      if (match[1]) {
        parts.push(<strong key={k++} className="text-white font-semibold">{match[1]}</strong>);
      } else if (match[2] && match[3]) {
        parts.push(<a key={k++} href={match[3]} className="text-[#00D4FF] hover:underline">{match[2]}</a>);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length === 1 ? parts[0] : parts;
  }

  function isTableStart(idx: number): boolean {
    return (
      idx + 1 < lines.length &&
      lines[idx].startsWith("|") &&
      lines[idx + 1].startsWith("|") &&
      lines[idx + 1].includes("---")
    );
  }

  while (i < lines.length) {
    const line = lines[i];

    // Skip top-level H1 (rendered separately as post title)
    if (line.startsWith("# ") && i < 3) { i++; continue; }

    // ── IMAGE comment → real <img> if src="..." present, else placeholder ──
    if (line.trim().startsWith("<!-- IMAGE:")) {
      const commentMatch = line.match(/<!--\s*IMAGE:\s*(.*?)(?:,\s*alt="([^"]*)")?\s*-->/);
      const srcMatch = line.match(/src="([^"]+)"/);
      const caption = commentMatch?.[2] || commentMatch?.[1]?.replace(/,\s*(alt|src)=.*$/g, "").trim() || "Article image";
      if (srcMatch) {
        elements.push(
          <figure key={key++} className="my-6">
            <img src={srcMatch[1]} alt={caption} className="w-full rounded-lg" />
            <figcaption className="mt-2 text-xs text-[#555] italic">{caption}</figcaption>
          </figure>
        );
      } else {
        elements.push(
          <figure key={key++} className="my-6 rounded-lg border border-[#1F1F1F] bg-[#111] p-4 text-center">
            <div className="flex h-40 items-center justify-center rounded bg-[#1A1A1A] text-[#444] text-sm">
              📷 {caption}
            </div>
            <figcaption className="mt-2 text-xs text-[#555] italic">{caption}</figcaption>
          </figure>
        );
      }
      i++;
      continue;
    }

    // ── Raw HTML passthrough (video, div, style blocks) ──
    if (line.trim().startsWith("<video") || line.trim().startsWith("<div") || line.trim().startsWith("<style")) {
      const htmlLines: string[] = [];
      // collect until we hit a blank line or a closing tag
      while (i < lines.length && lines[i].trim() !== "") {
        htmlLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div
          key={key++}
          className="my-6"
          dangerouslySetInnerHTML={{ __html: htmlLines.join("\n") }}
        />
      );
      continue;
    }

    // ── Table ──
    if (isTableStart(i)) {
      const headers = line.split("|").filter(Boolean).map((h) => h.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i].split("|").filter(Boolean).map((c) => c.trim()));
        i++;
      }
      elements.push(
        <div key={key++} className="my-6 overflow-x-auto rounded-lg border border-[#1F1F1F]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#1F1F1F] bg-[#1A1A1A]">
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} className="px-4 py-2 font-medium text-[#888]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-[#1F1F1F]">
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-2 ${ci === 1 ? "text-[#00FF88]" : ""}`}>
                      {inlineFormat(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ── H2 — with id for TOC anchors ──
    if (line.startsWith("## ")) {
      const text = line.slice(3);
      const id = slugify(text);
      elements.push(
        <h2 key={key++} id={id} className="mt-10 mb-4 text-2xl font-bold text-white scroll-mt-20">
          <a href={`#${id}`} className="hover:text-[#00D4FF] transition-colors">{text}</a>
        </h2>
      );
      i++; continue;
    }

    // ── H3 — with id for TOC anchors ──
    if (line.startsWith("### ")) {
      const text = line.slice(4);
      const id = slugify(text);
      elements.push(
        <h3 key={key++} id={id} className="mt-8 mb-3 text-xl font-bold text-white scroll-mt-20">
          <a href={`#${id}`} className="hover:text-[#00D4FF] transition-colors">{text}</a>
        </h3>
      );
      i++; continue;
    }

    // ── Unordered list ──
    if (line.startsWith("- ")) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(<li key={items.length} className="ml-4">{inlineFormat(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={key++} className="my-4 list-disc pl-6 space-y-2">{items}</ul>);
      continue;
    }

    // ── Horizontal rule ──
    if (line.trim() === "---") {
      elements.push(<hr key={key++} className="my-8 border-[#1F1F1F]" />);
      i++; continue;
    }

    // ── Empty line ──
    if (line.trim() === "") { i++; continue; }

    // ── Paragraph ──
    elements.push(<p key={key++} className="my-4 leading-relaxed">{inlineFormat(line)}</p>);
    i++;
  }

  return elements;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#D0D0D0]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/blog" className="mb-8 inline-block text-sm text-[#00D4FF] hover:underline">
          &larr; Back to Blog
        </Link>

        <article>
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">{post.title}</h1>
          <div className="mb-8 flex items-center gap-3 text-sm text-[#888]">
            <span>{post.date}</span>
            <span>&middot;</span>
            <span>{post.readTime}</span>
            <span>&middot;</span>
            <span>{post.author}</span>
          </div>

          <div className="prose-dark">{renderMarkdown(post.content)}</div>
        </article>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-[#00FF88]/20 bg-[#111] p-6 text-center">
          <h3 className="mb-2 text-lg font-bold text-white">Estimate your .ai domain value</h3>
          <Link
            href="/value"
            className="mt-3 inline-block rounded-lg bg-[#00FF88] px-6 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#00CC6A]"
          >
            Estimate your .ai domain value &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
