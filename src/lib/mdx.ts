// src/lib/mdx.ts
import fs from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const POSTS_DIR = path.join(process.cwd(), "src", "posts");

export async function getPost(slug: string) {
  const file = await fs.readFile(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");

  const { content, frontmatter } = await compileMDX<{
    title: string; description?: string; date?: string; ogImage?: string; tags?: string[];
  }>({
    source: file,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        // Permite HTML bruto (ex.: JSON-LD) dentro do MDX
        rehypePlugins: [rehypeRaw, rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
      },
    },
  });

  return { content, frontmatter };
}

export async function getAllSlugs() {
  const files = (await fs.readdir(POSTS_DIR)).filter(f => f.endsWith(".mdx"));
  return files.map(f => f.replace(/\.mdx$/, ""));
}
