// src/lib/posts.ts
import fs from "node:fs/promises";
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
export type PostMetadata = Omit<Post, "content">;

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

async function getPostFileNames(): Promise<string[]> {
  try {
    const files = await fs.readdir(POSTS_DIR);
    return files.filter((f) => f.endsWith(".mdx"));
  } catch (error) {
    // Retorna vazio se o diretório não existir
    return [];
  }
}

function toTimestamp(v: unknown): number {
  if (!v) return 0;
  const date = new Date(v as string | Date);
  return isNaN(date.getTime()) ? 0 : date.getTime();
}

export async function getAllSlugs(): Promise<string[]> {
  const files = await getPostFileNames();
  return files.map((f) => f.replace(/\.mdx$/, ""));
}

export async function getPostsMetadata(): Promise<PostMetadata[]> {
  const files = await getPostFileNames();

  const posts = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(POSTS_DIR, file);
      const fileContents = await fs.readFile(fullPath, "utf8");
      const { data } = matter(fileContents);
      const slug = file.replace(/\.mdx$/, "");
      const fm = data as PostFrontmatter;

      return { ...fm, slug: (fm.slug?.trim() || slug).replace(/^\/+/, "") };
    })
  );

  return posts.sort((a, b) => toTimestamp(b.updated ?? b.date) - toTimestamp(a.updated ?? a.date));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const p = path.join(POSTS_DIR, `${slug}.mdx`);
  try {
    const raw = await fs.readFile(p, "utf8");
    const { data, content } = matter(raw);
    const fm = data as PostFrontmatter;
    const effectiveSlug = (fm.slug?.trim() || slug).replace(/^\/+/, "");
    return { ...fm, slug: effectiveSlug, content };
  } catch (error) {
    return null;
  }
}