// src/lib/posts.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostFrontmatter = {
  title: string;
  description?: string;
  slug: string;
  date?: string | Date;
  updated?: string | Date;
  draft?: boolean;
  author?: string;
  tags?: string[];
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  coverImage?: string;
  toc?: boolean;
  readingTime?: string;
  schema?: {
    faq?: { question: string; answer: string }[];
    howto?: {
      name: string;
      totalTime?: string;
      supplies?: string[];
      tools?: string[];
      steps: string[];
    };
  };
};

export type Post = PostFrontmatter & { content: string };

// Para cards/listagens (sem `content`)
export type PostMetadata = Omit<Post, "content">;

// Diretórios candidatos para armazenar posts .mdx
const CANDIDATES = [
  ["src", "content", "posts"],
  ["content", "posts"],
  ["src", "posts"],
  ["posts"],
];

function pickPostsDir(): string {
  const cwd = process.cwd();
  for (const parts of CANDIDATES) {
    const p = path.join(cwd, ...parts);
    if (fs.existsSync(p)) return p;
  }
  // fallback: cria src/content/posts para não quebrar builds sem posts
  const fallback = path.join(cwd, "src", "content", "posts");
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

const POSTS_DIR = pickPostsDir();

function mdxPathFromSlug(slug: string) {
  return path.join(POSTS_DIR, `${slug}.mdx`);
}

function toTimestamp(v: unknown): number {
  if (!v) return 0;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

// Lista somente os slugs (sem ler conteúdo)
export async function getAllSlugs(): Promise<string[]> {
  const files = fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith(".mdx"))
    .map((f) => f.name.replace(/\.mdx$/, ""));
  return files;
}

// Lista metadados (para cards/listagens). Ordena por updated/date desc.
export async function getPostsMetadata(): Promise<PostMetadata[]> {
  const files = fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith(".mdx"))
    .map((f) => f.name);

  const list: PostMetadata[] = [];
  for (const file of files) {
    const full = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data } = matter(full);
    const slug = file.replace(/\.mdx$/, "");
    const fm = data as PostFrontmatter;

    // normaliza slug (sem barras iniciais)
    const effectiveSlug = (fm.slug?.trim() || slug).replace(/^\/+/, "");

    // Coerção leve: garantimos o slug no objeto retornado
    list.push({ ...fm, slug: effectiveSlug });
  }

  return list.sort((a, b) => {
    return toTimestamp(b.updated ?? b.date) - toTimestamp(a.updated ?? a.date);
  });
}

// Lê um post específico (frontmatter + conteúdo)
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const p = mdxPathFromSlug(slug);
  if (!fs.existsSync(p)) return null;

  const raw = fs.readFileSync(p, "utf8");
  const { data, content } = matter(raw);
  const fm = data as PostFrontmatter;
  const effectiveSlug = (fm.slug?.trim() || slug).replace(/^\/+/, "");

  return { ...fm, slug: effectiveSlug, content };
}
