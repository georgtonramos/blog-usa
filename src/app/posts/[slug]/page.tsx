// src/app/posts/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getPostBySlug, getAllSlugs, type Post } from "@/lib/posts";
import MDXRenderer from "@/components/MDXRenderer";

type Props = { params: { slug: string } };

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.naturaleatinghub.online";

function toAbsolute(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function createJsonLdScript(id: string, schema: object) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};

  const canonical = post.canonical ?? `${SITE}/posts/${post.slug}`;
  const ogImage = toAbsolute(post.ogImage) ?? toAbsolute(post.coverImage) ?? toAbsolute("/images/cover.jpg");

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: canonical,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();

  const datePublished = post.date ? new Date(String(post.date)).toISOString() : undefined;
  const dateModified = post.updated ? new Date(String(post.updated)).toISOString() : datePublished;
  const url = post.canonical ?? `${SITE}/posts/${post.slug}`;
  const images = [post.ogImage, post.coverImage].filter(Boolean).map((u) => toAbsolute(String(u)!)!).filter(Boolean) as string[];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.description,
    image: images.length ? images : undefined,
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    publisher: {
      "@type": "Organization",
      name: "Natural Eating Hub",
      logo: { "@type": "ImageObject", url: toAbsolute("/logo.png")! },
    },
    datePublished,
    dateModified,
    keywords: Array.isArray(post.keywords) ? post.keywords.join(", ") : post.keywords,
  };

  const faqSchema = post?.schema?.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.schema.faq.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: { "@type": "Answer", text: q.answer },
        })),
      }
    : null;

  const howToSchema = post?.schema?.howto
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: post.schema.howto.name,
        totalTime: post.schema.howto.totalTime,
        supply: post.schema.howto.supplies?.map((s) => ({ "@type": "HowToSupply", name: s })),
        tool: post.schema.howto.tools?.map((t) => ({ "@type": "HowToTool", name: t })),
        step: post.schema.howto.steps.map((t) => ({ "@type": "HowToStep", text: t })),
      }
    : null;

  return (
    <>
      <article className="prose lg:prose-lg mx-auto max-w-3xl px-4 py-8">
        <h1>{post.title}</h1>
        <MDXRenderer source={post.content} />
      </article>

      {createJsonLdScript("schema-article", articleSchema)}
      {faqSchema && createJsonLdScript("schema-faq", faqSchema)}
      {howToSchema && createJsonLdScript("schema-howto", howToSchema)}
    </>
  );
}