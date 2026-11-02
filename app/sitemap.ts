import type { MetadataRoute } from "next";
import { query } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wafflecastle.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/our-journey`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/royal-products`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/castle-locator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/royal-events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/franchise`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/achievements`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  try {
    const res = await query<{ slug: string; updated_at: string; created_at: string }>(
      "SELECT slug, updated_at, created_at FROM public.blog_posts WHERE is_published = true;"
    );
    const posts = res.rows;

    if (posts && posts.length > 0) {
      posts.forEach((post) => {
        routes.push({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : (post.created_at ? new Date(post.created_at) : new Date()),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  return routes;
}
