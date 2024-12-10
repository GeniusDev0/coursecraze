'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Article } from '@/db/schema';

const CreateArticlePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [readTime, setReadTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          summary,
          content,
          readTime: parseInt(readTime, 10),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create article');
      }

      const newArticle = await response.json() as Article;
      console.log('New article created:', newArticle);
      router.push('/resources');
    } catch (error) {
      console.error('Error creating article:', error);
      // You might want to add some error handling here, e.g., showing an error message to the user
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Article</h1>
      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(e); }} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="summary" className="block mb-1">Summary</label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full border rounded p-2"
            rows={3}
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-1">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded p-2"
            rows={10}
            required
          />
        </div>
        <div>
          <label htmlFor="readTime" className="block mb-1">Read Time (minutes)</label>
          <input
            type="number"
            id="readTime"
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <Button type="submit">Create Article</Button>
      </form>
    </div>
  );
};

export default CreateArticlePage;
