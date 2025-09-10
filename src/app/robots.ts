import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://blog.naturaleatinghub.online";

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/admin", "/drafts"], // ajuste se tiver áreas privadas
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}