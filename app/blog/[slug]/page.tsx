import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const content = await getSiteContent();
  const post = content.blog.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="article-page">
      <nav className="article-nav">
        <a className="button" href="/#blog">
          <ArrowLeft size={17} /> Back to blog
        </a>
        <a className="brand" href="/">
          <span className="brand-mark">{content.profile.name.slice(0, 1)}</span>
          <span>{content.profile.name}</span>
        </a>
      </nav>

      <article className="article-shell">
        <time dateTime={post.date}>{post.date}</time>
        <h1>{post.title}</h1>
        <p className="article-summary">{post.summary}</p>
        <div className="article-body">
          {post.body.split("\n").filter(Boolean).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
