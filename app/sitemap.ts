import type { MetadataRoute } from "next";
import { seedSales, domainToSlug } from "@/lib/seed-sales";
import { blogPosts } from "@/lib/blog-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const salePages = seedSales.map((sale) => ({
    url: `https://namebuzz.co/sales/${domainToSlug(sale.domain)}`,
    lastModified: new Date(),
  }));

  const blogPages = blogPosts.map((post) => ({
    url: `https://namebuzz.co/blog/${post.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: "https://namebuzz.co", lastModified: new Date() },
    { url: "https://namebuzz.co/value", lastModified: new Date() },
    { url: "https://namebuzz.co/blog", lastModified: new Date() },
    { url: "https://namebuzz.co/domains/short", lastModified: new Date() },
    { url: "https://namebuzz.co/domains/single-word", lastModified: new Date() },
    { url: "https://namebuzz.co/domains/premium", lastModified: new Date() },
    ...salePages,
    ...blogPages,
  ];
}
