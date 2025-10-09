// src/app/sitemap.ts
import { getAllSlugs, getPostBySlug } from "@/lib/posts";

export default async function sitemap() {
  const siteUrl = "https://blog.naturaleatinghub.online";
  const slugs = await getAllSlugs();

  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const post = await getPostBySlug(slug);
      const lastModified = post?.updated || post?.date || new Date();
      
      return {
        url: `${siteUrl}/posts/${slug}`,
        lastModified: new Date(lastModified).toISOString(),
      };
    })
  );

  // Apenas a página inicial será incluída, além dos posts.
  const routes = [
    { url: siteUrl, lastModified: new Date().toISOString() },
  ];

  return [...routes, ...posts];
}