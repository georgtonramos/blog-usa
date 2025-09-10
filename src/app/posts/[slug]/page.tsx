// src/app/posts/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getPostBySlug, getAllSlugs, type Post } from "@/lib/posts";
import MDXRenderer from "@/components/MDXRenderer";

type Props = { params: { slug: string } };

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.naturaleatinghub.online";

// Converte URL relativa em absoluta para JSON-LD/OG
function toAbsolute(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ---------- Build-time params ----------
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ---------- SEO / Metadata ----------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const post = (await getPostBySlug(slug)) as Post | null;
  if (!post) return {};

  const slugOrFrontmatter = (post.slug || slug).replace(/^\/+/, "");
  const canonical = post.canonical ?? `${SITE}/posts/${slugOrFrontmatter}`;

  const ogImage =
    toAbsolute(post.ogImage) ??
    toAbsolute(post.coverImage) ??
    toAbsolute("/images/cover.jpg");

  return {
    title: post.title,
    description: post.description ?? undefined,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description ?? undefined,
      url: canonical,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description ?? undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

// ---------- Page ----------
export default async function PostPage({ params }: Props) {
  const { slug } = params;
  const post = (await getPostBySlug(slug)) as Post | null;
  if (!post) return notFound();

  // Datas seguras em ISO (evita "Invalid Date")
  const datePublished =
    post.date ? new Date(String(post.date)).toISOString() : undefined;
  const dateModified = post.updated
    ? new Date(String(post.updated)).toISOString()
    : datePublished;

  const url =
    post.canonical ??
    `${SITE}/posts/${(post.slug || slug).replace(/^\/+/, "")}`;

  const images = [post.ogImage, post.coverImage]
    .filter(Boolean)
    .map((u) => toAbsolute(String(u)!))
    .filter(Boolean) as string[];

  // ---------- JSON-LD ----------
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
      logo: {
        "@type": "ImageObject",
        url: toAbsolute("/logo.png")!,
      },
    },
    datePublished,
    dateModified,
    keywords: Array.isArray(post.keywords)
      ? post.keywords.join(", ")
      : post.keywords,
  };

  const faqSchema =
    post?.schema?.faq?.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.schema!.faq!.map((q) => ({
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
        name: post.schema!.howto!.name,
        totalTime: post.schema!.howto!.totalTime,
        supply: post.schema!.howto!.supplies?.map((s) => ({
          "@type": "HowToSupply",
          name: s,
        })),
        tool: post.schema!.howto!.tools?.map((t) => ({
          "@type": "HowToTool",
          name: t,
        })),
        step: post.schema!.howto!.steps.map((t) => ({
          "@type": "HowToStep",
          text: t,
        })),
      }
    : null;

  return (
    <>
      <article className="prose lg:prose-lg mx-auto max-w-3xl px-4 py-8">
        <h1>{post.title}</h1>

        {/* ⬇️ Use a prop de acordo com seu MDXRenderer */}
        {/* Se o seu componente espera `source`: */}
        <MDXRenderer source={post.content} />
        {/* Se ele espera `code`, troque a linha acima por:
            <MDXRenderer code={post.content} />
        */}
      </article>

      <Script
        id="schema-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <Script
          id="schema-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {howToSchema && (
        <Script
          id="schema-howto"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
    </>
  );
}