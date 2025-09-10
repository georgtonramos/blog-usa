// src/app/api/write-post/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { title, author, content, coverImage } = data;
    if (!title || !author || !content) {
      return NextResponse.json(
        { message: 'Missing required fields: title, author, content' },
        { status: 400 }
      );
    }

    const slug = createSlug(title);
    const fileName = `${slug}.mdx`;
    const filePath = path.join(process.cwd(), 'src', 'posts', fileName);

    try {
      await fs.access(filePath);
      return NextResponse.json(
        { message: 'A post with this title already exists.' },
        { status: 409 }
      );
    } catch (error) {
      // File does not exist, safe to proceed
    }
    
    const date = new Date().toISOString().split('T')[0];
    const frontmatter = `---
title: ${title}
date: ${date}
author: ${author}
coverImage: ${coverImage || ''}
---`;

    const mdxContent = `${frontmatter}\n\n${content}`;

    await fs.writeFile(filePath, mdxContent, 'utf-8');

    return NextResponse.json(
      { message: 'Post created successfully!', slug },
      { status: 201 }
    );

  } catch (error) {
    console.error('Failed to write post:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}