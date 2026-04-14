import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: ".ai Domain Investment Blog | NameBuzz",
  description:
    "Market reports, investment guides, and sale breakdowns for .ai domain investors.",
  openGraph: {
    title: ".ai Domain Investment Blog | NameBuzz",
    description:
      "Market reports, investment guides, and sale breakdowns for .ai domain investors.",
  },
};

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">.ai Domain Blog</h1>
        <p className="mb-10 text-[#888]">
          Market reports, investment guides, and sale breakdowns.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border border-[#1F1F1F] bg-[#111] p-6 transition-colors hover:border-[#00FF88]/30"
            >
              <p className="mb-2 text-xs text-[#888]">
                {post.date} &middot; {post.readTime}
              </p>
              <h2 className="mb-3 text-lg font-bold group-hover:text-[#00FF88]">
                {post.title}
              </h2>
              <p className="mb-4 text-sm text-[#888] line-clamp-3">
                {post.description}
              </p>
              <span className="text-sm font-medium text-[#00D4FF]">
                Read Article &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
