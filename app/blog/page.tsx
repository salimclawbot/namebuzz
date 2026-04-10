import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "NameBuzz Blog",
  description: "Latest analysis and data-backed guides on the .ai domain market.",
};

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:px-6">
      <h1 className="text-3xl font-bold text-white md:text-5xl">NameBuzz Articles</h1>
      <p className="mt-3 text-zinc-300">Data-backed guides, sales breakdowns, and investor insights for .ai domains.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-xl font-semibold text-white">{post.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-zinc-300">{post.description}</p>
            <div className="mt-4 text-xs text-zinc-400">{post.date} • {post.readTime}</div>
            <Link href={`/blog/${post.slug}`} className="mt-4 inline-block text-sm font-medium text-[#00FF88] hover:underline">
              Read article →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
