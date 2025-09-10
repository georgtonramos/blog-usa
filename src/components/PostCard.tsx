import Link from "next/link";
import Image from "next/image";
import type { PostMetadata } from "@/lib/posts";

export default function PostCard({ post }: { post: PostMetadata }) {
  const formattedDate =
    post?.date
      ? new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "";

  const cover =
    post?.coverImage && post.coverImage.trim() !== ""
      ? post.coverImage
      : "/images/cover.jpg"; // fallback

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card/50 shadow-sm transition hover:shadow-md">
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority={false}
          />
        </div>
        <div className="space-y-2 p-4 md:p-5">
          <h3 className="text-lg font-semibold leading-snug md:text-xl">
            {post.title}
          </h3>
          {post.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {post.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {formattedDate && <span>{formattedDate}</span>}
            {post.readingTime && (
              <>
                <span aria-hidden>•</span>
                <span>{post.readingTime}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
