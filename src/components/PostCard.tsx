// src/components/PostCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { PostMetadata } from '@/lib/posts';

export default function PostCard({ post }: { post: PostMetadata }) {
  const formattedDate = new Date(post.date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/posts/${post.slug}`}>
        {post.coverImage && (
          <div className="relative h-48 w-full">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 transform hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          <p className="text-sm font-medium text-textSecondary mb-2">
            {post.author} • {formattedDate}
          </p>
          <h2 className="text-xl font-bold text-textDark mb-2">{post.title}</h2>
          
          <div className="text-primary hover:text-accent font-semibold inline-flex items-center mt-4">
            Read more
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
}