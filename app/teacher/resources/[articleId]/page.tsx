import { auth } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getArticleById } from "@/db/queries";

const ArticlePage = async ({ params }: { params: { articleId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const article = await getArticleById(parseInt(params.articleId, 10));

  if (!article) {
    return redirect("/resources");
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/resources">
        <Button variant="secondary" className="mb-4">
          &larr; Back to Resources
        </Button>
      </Link>
      <article className="prose lg:prose-xl mx-auto">
        <h1>{article.title}</h1>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          <span>{article.readTime} min read</span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </div>
  );
};

export default ArticlePage;
