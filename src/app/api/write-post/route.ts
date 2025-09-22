// src/app/api/write-post/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ================= Helpers ================= */
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

function yamlStr(s: unknown): string {
  return `"${String(s).replace(/"/g, '\\"')}"`;
}

function yamlVal(v: unknown): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return `[${v.map(yamlStr).join(", ")}]`;
  if (v === undefined || v === null) return `""`;
  return yamlStr(v);
}

function getIP(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    (h.get("cf-connecting-ip") as string) ||
    "unknown"
  );
}

function nowISO(): string {
  return new Date().toISOString();
}

function todayYMD(): string {
  return new Date().toISOString().split("T")[0];
}

async function auditLog(line: string) {
  try {
    const logsDir = path.join(process.cwd(), ".logs");
    await fs.mkdir(logsDir, { recursive: true });
    await fs.appendFile(path.join(logsDir, "write-post.log"), line + "\n", "utf-8");
  } catch {
    // ignore
  }
}

/* ================= Zod (payload JSON) ================= */
const BodySchema = z.object({
  title: z.string().min(3).max(120),
  author: z.string().min(2).max(60),
  content: z.string().min(20).max(100_000),
  description: z.string().max(300).optional().default(""),
  slug: z.string().max(160).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  draft: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  keywords: z.array(z.string()).optional().default([]),
  canonical: z.string().optional().default(""),
  toc: z.boolean().optional().default(true),
  readingTime: z.string().optional().default(""),
  coverImage: z.string().max(300).optional().default(""),
  ogImage: z.string().max(300).optional(),
  dir: z.string().optional().default("src/content/posts"),
  overwrite: z.boolean().optional().default(false),
});

/* ================= Rate limit ================= */
type Bucket = { count: number; resetAt: number };
const RL_WINDOW_MS = 60_000;
const RL_MAX = 10;
const globalAny = global as any;
if (!globalAny.__WRITE_POST_RL__) {
  globalAny.__WRITE_POST_RL__ = new Map<string, Bucket>();
}
const buckets: Map<string, Bucket> = globalAny.__WRITE_POST_RL__;

function rateLimitCheck(id: string) {
  const now = Date.now();
  const b = buckets.get(id);
  if (!b || b.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + RL_WINDOW_MS });
    return { ok: true, remaining: RL_MAX - 1, resetAt: now + RL_WINDOW_MS };
  }
  if (b.count >= RL_MAX) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }
  b.count++;
  return { ok: true, remaining: RL_MAX - b.count, resetAt: b.resetAt };
}

/* ================= Frontmatter builder ================= */
function buildFrontmatter(fm: {
  title: string;
  description?: string;
  slug: string;
  date: string;
  updated: string;
  draft: boolean;
  author: string;
  tags: string[];
  keywords: string[];
  canonical: string;
  ogImage?: string;
  coverImage?: string;
  toc: boolean;
  readingTime?: string;
}) {
  const order: [string, unknown][] = [
    ["title", fm.title],
    ["description", fm.description ?? ""],
    ["slug", fm.slug],
    ["date", fm.date],
    ["updated", fm.updated],
    ["draft", fm.draft],
    ["author", fm.author],
    ["tags", fm.tags],
    ["keywords", fm.keywords],
    ["canonical", fm.canonical ?? ""],
    ["ogImage", fm.ogImage ?? fm.coverImage ?? ""],
    ["coverImage", fm.coverImage ?? fm.ogImage ?? ""],
    ["toc", fm.toc],
    ["readingTime", fm.readingTime ?? ""],
  ];

  const body = order.map(([k, v]) => `${k}: ${yamlVal(v)}`).join("\n");
  return `---\n${body}\n---\n`;
}

/* ================= Handler ================= */
export async function POST(request: Request) {
  const startedAt = Date.now();
  const ip = getIP(request);
  const ua = request.headers.get("user-agent") || "unknown";
  const apiKey = request.headers.get("x-api-key") || "";

  // 1) API Key Validation
  const expectedKey = process.env.WRITE_POST_API_KEY;
  if (!expectedKey || !timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedKey))) {
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=401 reason=bad_api_key`);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 2) Rate limit
  const rl = rateLimitCheck(`key:${apiKey}`);
  if (!rl.ok) {
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=429 reason=rate_limited resetAt=${new Date(rl.resetAt).toISOString()}`);
    return NextResponse.json(
      { message: "Too Many Requests", resetAt: new Date(rl.resetAt).toISOString() },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  let fileDir: string;
  let fileName: string;
  let mdxToWrite: string;
  let allowOverwrite: boolean;

  try {
    const data = BodySchema.parse(await request.json());
    const slug = slugify(data.slug || data.title);
    const date = data.date || todayYMD();
    const updated = data.updated || date;

    fileDir = data.dir;
    fileName = `${slug}.mdx`;
    allowOverwrite = data.overwrite;

    const frontmatter = buildFrontmatter({
      ...data,
      slug,
      date,
      updated,
    });

    mdxToWrite = `${frontmatter}\n${data.content}\n`;
  } catch (err: any) {
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=400 reason=invalid_body`);
    return NextResponse.json({ message: "Invalid request body", error: err.issues || String(err) }, { status: 400 });
  }

  try {
    const postsDir = path.join(process.cwd(), fileDir);
    await fs.mkdir(postsDir, { recursive: true });
    const filePath = path.join(postsDir, fileName);

    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    if (fileExists && !allowOverwrite) {
      await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=409 file="${fileDir}/${fileName}" reason=duplicate`);
      return NextResponse.json({ message: "A post with this slug already exists.", file: `${fileDir}/${fileName}` }, { status: 409 });
    }

    await fs.writeFile(filePath, mdxToWrite, "utf-8");

    const took = Date.now() - startedAt;
    const out = { message: "Post created successfully!", file: `${fileDir}/${fileName}`, tookMs: took };
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=201 file="${out.file}" tookMs=${took} remaining=${rl.remaining}`);

    return NextResponse.json(out, { status: 201 });
  } catch (err: any) {
    const took = Date.now() - startedAt;
    await auditLog(`${nowISO()} ip=${ip} ua="${ua}" status=500 error="${String(err?.message || err)}" tookMs=${took}`);
    console.error("Failed to write post:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}