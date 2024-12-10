import Link from 'next/link';

import { Article } from '@/db/schema';

type ArticleCardProps = {
  article: Article;
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link href={`/resources/${article.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{article.title}</h2>
          <p className="text-gray-600 mb-4 line-clamp-3">{article.summary}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            <span>{article.readTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
