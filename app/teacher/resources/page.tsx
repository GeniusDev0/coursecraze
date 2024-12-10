import { auth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { getArticles } from "@/db/queries";
import { getIsAdmin } from "@/lib/admin";

import ArticleList from "./components/article-list";
import CreateArticleButton from "./components/create-article-button";

const ResourcesPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const articles = await getArticles();
  const userIsAdmin = await getIsAdmin();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resources</h1>
        {userIsAdmin ? <CreateArticleButton /> : <UserButton appearance={{ elements: { avatarBox: "h-12 w-12" } }} />}
      </div>
      <ArticleList articles={articles} />
    </div>
  );
};

export default ResourcesPage;
