// src/app/api/write-post/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ========= Helpers base =========
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
function yamlEscape(s: string): string {
  return `"${String(s).replace(/"/g, '\\"')}"`;
}
function getIP(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    // @ts-ignore - Next.js dev may set this
    (h.get("cf-connecting-ip") as string) ||
    "unknown"
  );
}
function nowISO() {
  return new Date().toISOString();
}

// ========= Zod: validação de payload =========
const BodySchema = z.object({
  title: z.string().min(3).max(120),
  author: z.string().min(2).max(60),
  content: z.string().min(20).max(100_000),
  coverImage: z.string().max(300).optional().default(""),
});

// ========= Rate limit em memória =========
// Janela de 1 minuto, 10 req por chave (API Key) ou IP
type Bucket = { count: number; resetAt: number };
const RL_WINDOW_MS = 60_000;
const RL_MAX = 10;

// guarda globalmente para sobreviver a HMR em dev
const globalAny = global as any;
if (!globalAny.__WRITE_POST_RL__) globalAny.__WRITE_POST_RL__ = new Map<string, Bucket>();
const buckets: Map<string, Bucket> = globalAny.__WRITE_POST_RL__;

function rateLimitCheck(id: string) {
  const now = Date.now();
  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + RL_WINDOW_MS });
    return { ok: true, remaining: RL_MAX - 1, resetAt: now + RL_WINDOW_MS };
  }
  if (bucket.count >= RL_MAX) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count++;
  return { ok: true, remaining: RL_MAX - bucket.count, resetAt: bucket.resetAt };
}

// ========= Auditoria =========
async function auditLog(line: string) {
  try {
    const logsDir = path.join(process.cwd(), ".logs");
    await fs.mkdir(logsDir, { recursive: true });
    const file = path.join(logsDir, "write-post.log");
    await fs.appendFile(file, line + "\n", "utf-8");
  } catch {
    // ignore erro de log
  }
}

// ========= Handler =========
export async function POST(request: Request) {
  const startedAt = Date.now();
  const ip = getIP(request);
  const ua = request.headers.get("user-agent") || "unknown";
  const apiKey = request.headers.get("x-api-key") || "";

  // 1) Autorização por API Key
  const expectedKey = process.env.WRITE_POST_API_KEY;
  if (!expectedKey || apiKey !== expectedKey) {
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=401 reason=bad_api_key`);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 2) Rate limit por chave (prioridade) e IP como fallback
  const rlId = `key:${apiKey}` || `ip:${ip}`;
  const rl = rateLimitCheck(rlId);
  if (!rl.ok) {
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=429 reason=rate_limited resetAt=${new Date(rl.resetAt).toISOString()}`);
    return NextResponse.json(
      { message: "Too Many Requests", resetAt: new Date(rl.resetAt).toISOString() },
      { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } }
    );
  }

  // 3) Validação do corpo
  let parsed: z.infer<typeof BodySchema>;
  try {
    const json = await request.json();
    parsed = BodySchema.parse(json);
  } catch (err) {
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=400 reason=invalid_body`);
    return NextResponse.json(
      { message: "Invalid request body", error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }

  const { title, author, content, coverImage } = parsed;

  const slug = slugify(title);
  if (!slug) {
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=400 reason=bad_slug`);
    return NextResponse.json({ message: "Invalid title/slug" }, { status: 400 });
  }

  try {
    // diretório alvo: src/content/posts
    const postsDir = path.join(process.cwd(), "src", "content", "posts");
    await fs.mkdir(postsDir, { recursive: true });

    const fileName = `${slug}.mdx`;
    const filePath = path.join(postsDir, fileName);

    // duplicado?
    try {
      await fs.access(filePath);
      await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=409 slug=${slug} reason=duplicate`);
      return NextResponse.json(
        { message: "A post with this title already exists.", slug },
        { status: 409 }
      );
    } catch { /* ok, não existe */ }

    const date = new Date().toISOString().split("T")[0];
    const frontmatter =
`---
title: ${yamlEscape(title)}
description: ""
slug: ${yamlEscape(slug)}
date: ${yamlEscape(date)}
updated: ${yamlEscape(date)}
draft: false
author: ${yamlEscape(author)}
tags: []
keywords: []
canonical: ""
ogImage: ${yamlEscape(coverImage)}
coverImage: ${yamlEscape(coverImage)}
toc: true
readingTime: ""
---`;

    const mdxContent = `${frontmatter}\n\n${content}\n`;
    await fs.writeFile(filePath, mdxContent, "utf-8");

    const took = Date.now() - startedAt;
    const out = { message: "Post created successfully!", slug, file: `src/content/posts/${fileName}`, tookMs: took };

    // Auditoria (sucesso)
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=201 slug=${slug} file="${out.file}" tookMs=${took} remaining=${rl.remaining}`);

    return NextResponse.json(out, { status: 201 });
  } catch (err) {
    const took = Date.now() - startedAt;
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=500 slug=${slug} error="${(err as Error)?.message ?? err}" tookMs=${took}`);
    console.error("Failed to write post:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}