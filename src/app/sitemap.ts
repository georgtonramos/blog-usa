import { getAllSlugs, getPostBySlug } from "@/lib/posts";

export default async function sitemap() {
  const slugs = await getAllSlugs();

  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const post = await getPostBySlug(slug);
      return {
        url: `https://blog.naturaleatinghub.online/${slug}`,
        lastModified: post?.updated || post?.date || new Date().toISOString(),
      };
    })
  );

  return [
    {
      url: "https://blog.naturaleatinghub.online/",
      lastModified: new Date(),
    },
    {
      url: "https://blog.naturaleatinghub.online/posts",
      lastModified: new Date(),
    },
    ...posts,
  ];
}