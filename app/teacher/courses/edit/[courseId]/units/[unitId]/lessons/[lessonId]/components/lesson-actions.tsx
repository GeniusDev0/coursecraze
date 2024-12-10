"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BackButton } from "@/components/ui/backbutton";

interface LessonActionsProps {
  lessonId: number;
  unitId: number;
  courseId: number;
}

export const LessonActions = ({ lessonId, unitId, courseId }: LessonActionsProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/courses/delete/lesson", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }

      router.push(`/teacher/courses/edit/${courseId}/units/${unitId}`);
    } catch (error) {
      console.error("Error deleting lesson:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <BackButton />
      <h2 className="text-xl font-bold mb-4">Lesson Actions</h2>
      <div className="space-y-2">
        <button
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          className="w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-300"
        >
          {isDeleting ? "Deleting..." : "Delete Lesson"}
        </button>
        <Link
          href={`/teacher/courses/edit/${courseId}/units/${unitId}`}
          className="block w-full px-4 py-2 text-center text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Back to Unit
        </Link>
      </div>
    </div>
  );
};