// src/app/posts/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getPostBySlug, getAllSlugs, type Post } from "@/lib/posts";
import MDXRenderer from "@/components/MDXRenderer";
import BreadcrumbSchema from "@/components/BreadcrumbSchema"; // Supondo que você criou este componente

type Props = { params: { slug: string } };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.naturaleatinghub.online";

/**
 * Converte uma URL relativa em absoluta. Essencial para metadados e schemas.
 */
function toAbsolute(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Helper para criar scripts JSON-LD, evitando repetição.
 */
function createJsonLdScript(id: string, schema: object) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Gera os parâmetros para as rotas estáticas no momento do build
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Gera os metadados dinâmicos para cada página de post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};

  const canonical = post.canonical ?? `${SITE_URL}/posts/${post.slug}`;
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

// Componente da página que renderiza o post
export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const datePublished = post.date ? new Date(String(post.date)).toISOString() : undefined;
  const dateModified = post.updated ? new Date(String(post.updated)).toISOString() : datePublished;
  const url = post.canonical ?? `${SITE_URL}/posts/${post.slug}`;
  const images = [post.ogImage, post.coverImage]
    .filter(Boolean)
    .map((u) => toAbsolute(String(u)!))
    .filter(Boolean) as string[];

  // Schema JSON-LD para Artigo
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
      logo: { "@type": "ImageObject", url: toAbsolute("/logo.png")! }, // Crie um logo.png em /public
    },
    datePublished,
    dateModified,
    keywords: Array.isArray(post.keywords) ? post.keywords.join(", ") : post.keywords,
  };

  // Schema JSON-LD para FAQ (se existir no frontmatter)
  const faqSchema = post.schema?.faq?.length
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

  // Schema JSON-LD para HowTo (se existir no frontmatter)
  const howToSchema = post.schema?.howto
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
    
  // Schema JSON-LD para Breadcrumbs
  const breadcrumbItems = [
    { position: 1, name: "Home", item: "/" },
    // { position: 2, name: "Posts", item: "/posts" }, // Descomente se tiver uma página de listagem
    { position: 2, name: post.title, item: `/posts/${post.slug}` }
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />

      <article className="prose lg:prose-lg mx-auto max-w-3xl px-4 py-8">
        <h1>{post.title}</h1>
        <MDXRenderer source={post.content} />
      </article>

      {/* Renderiza os schemas JSON-LD */}
      {createJsonLdScript("schema-article", articleSchema)}
      {faqSchema && createJsonLdScript("schema-faq", faqSchema)}
      {howToSchema && createJsonLdScript("schema-howto", howToSchema)}
    </>
  );
}