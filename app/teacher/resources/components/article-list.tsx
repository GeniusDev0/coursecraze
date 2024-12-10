'use client';

import { useState } from 'react';

import { Article } from '@/db/schema';

import ArticleCard from './article-card';

type ArticleListProps = {
  articles: Article[];
};

const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="sort" className="mr-2">Sort by:</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
          className="border rounded p-1"
        >
          <option value="date">Date</option>
          <option value="title">Title</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default ArticleList;
