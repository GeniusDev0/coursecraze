"use client";

import { useState } from "react";

import { TextareaAutosize, Switch } from "@mui/material";
import { Upload } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Course, UserProgress } from "@/db/schema";

type CourseEditSidebarProps = {
  course: Course;
  teacherProgress: UserProgress;
};

export const CourseEditSidebar = ({ course }: CourseEditSidebarProps) => {
  const [title, setTitle] = useState(course.title);
  const [isPublic, setIsPublic] = useState(course.isPublic);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(course.imageSrc);
  const [newCoverImage, setNewCoverImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/courses/edit/course/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          isPublic,
          imageSrc: newCoverImage || coverImage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update course");
      }

      const updatedCourse = await response.json() as Course;
      setMessage({ text: "Course updated successfully", type: 'success' });
      if (newCoverImage) {
        setCoverImage(updatedCourse.imageSrc);
        setNewCoverImage(null);
      }
      // Optionally update other state variables with the returned data
      setTitle(updatedCourse.title);
      setIsPublic(updatedCourse.isPublic);
    } catch (error) {
      setMessage({ text: "Failed to update course", type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4 pt-8">
      {message && (
        <div className={`p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <TextareaAutosize
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minRows={1}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            borderColor: '#e2e8f0',
            borderWidth: '2px',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <div className="flex items-center space-x-3">
        <Switch
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          inputProps={{ 'aria-label': 'Public toggle' }}
        />
        <span className="text-base font-semibold text-gray-700">
          Public
        </span>
      </div>
      <div className="mb-4">
        <label htmlFor="cover-image" className="block text-sm font-medium text-gray-700 mb-2">
          Update Cover Image
        </label>
        <Button
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => document.getElementById('cover-image')?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New Image
        </Button>
        <input
          id="cover-image"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          hidden
        />
      </div>
      {newCoverImage && (
        <div className="mt-4 rounded-lg overflow-hidden shadow-md">
          <Image
            src={newCoverImage}
            alt="New cover preview"
            width={300}
            height={180}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      {coverImage && !newCoverImage && (
        <div className="mt-4 rounded-lg overflow-hidden shadow-md">
          <Image
            src={coverImage}
            alt="Current cover preview"
            width={300}
            height={180}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      <Button type="submit" variant="primary" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Course"}
      </Button>
    </form>
  );
};
