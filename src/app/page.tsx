// src/app/page.tsx
import { getPostsMetadata } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export default async function HomePage() {
  const posts = await getPostsMetadata();

  // Adiciona um filtro para remover posts incompletos ou nulos
  const validPosts = posts.filter(post => post && post.date && post.title && post.author);

  return (
    <div className="p-8">
      {/* Título e Subtítulo */}
      <div className="text-center mb-16 mt-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-textDark mb-4">
          Exploring New Articles
        </h1>
        <p className="text-lg md:text-xl text-textSecondary">
          Ideas, trends, and inspiration for a brighter future
        </p>
      </div>
      
      {/* Grade de Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Usa a lista filtrada de posts válidos */}
        {validPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}