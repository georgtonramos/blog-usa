// src/app/posts/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getPostBySlug, getAllSlugs, type Post } from "@/lib/posts";
import MDXRenderer from "@/components/MDXRenderer";

type Props = { params: { slug: string } }; // ✅ params não é Promise

const SITE = "https://blog.naturaleatinghub.online";

// Converte URL relativa em absoluta para JSON-LD/OG
function toAbsolute(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Gera páginas estáticas em build
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// SEO por post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const post = (await getPostBySlug(slug)) as Post | null;
  if (!post) return {};

  const canonical =
    post.canonical ??
    `${SITE}/posts/${(post.slug || slug).replace(/^\/+/, "")}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description ?? undefined,
      url: canonical,
      images: post.ogImage ? [toAbsolute(post.ogImage)!] : [toAbsolute("/images/slimming-tea-og.webp")!],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description ?? undefined,
      images: post.ogImage ? [toAbsolute(post.ogImage)!] : [toAbsolute("/images/slimming-tea-og.webp")!],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = params;
  const post = (await getPostBySlug(slug)) as Post | null;
  if (!post) return notFound();

  // ---------- JSON-LD ----------
  const buildArticleSchema = (p: Post) => {
    const url =
      p.canonical ??
      `${SITE}/posts/${(p.slug || slug).replace(/^\/+/, "")}`;

    const images = [p.ogImage, p.coverImage]
      .filter(Boolean)
      .map((u) => toAbsolute(u as string)) as string[];

    const datePublished = p.date ? new Date(p.date as any).toISOString() : undefined;
    const dateModified = p.updated
      ? new Date(p.updated as any).toISOString()
      : datePublished;

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: p.title,
      description: p.description,
      image: images.length ? images : undefined,
      author: p.author ? { "@type": "Person", name: p.author } : undefined,
      publisher: {
        "@type": "Organization",
        name: "Natural Eating Hub",
        logo: {
          "@type": "ImageObject",
          url: toAbsolute("/logo.png") || `${SITE}/logo.png`,
        },
      },
      datePublished,
      dateModified,
      keywords: p.keywords?.join(", "),
    };
  };

  const articleSchema = buildArticleSchema(post);

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
      <article className="prose lg:prose-lg mx-auto py-8">
        <h1>{post.title}</h1>
        <MDXRenderer source={post.content} />
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