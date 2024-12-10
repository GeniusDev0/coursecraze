"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Course } from "@/db/schema";

import { UserSearchWrapper } from "./user-search-wrapper";

interface CreateClassFormProps {
  teacherId: string;
  courses: Course[];
}

export const CreateClassForm = ({ courses }: CreateClassFormProps) => {
  const router = useRouter();
  const [className, setClassName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          courseId: parseInt(selectedCourseId),
          studentIds: selectedStudents,
        }),
      });
      if (response.ok) {
        const newClass = await response.json() as { id: string };
        router.push(`/teacher/classes/${newClass.id}`);
      } else {
        // Handle error
      }
    } catch (error) {
      console.error("Error creating class:", error);
      // Handle error
    }
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
      <div>
        <label htmlFor="className" className="block text-sm font-bold text-gray-700 mb-2">
          Class Name
        </label>
        <Input
          type="text"
          id="className"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
          className="w-full"
          placeholder="Enter class name"
        />
      </div>
      <div>
        <label htmlFor="course" className="block text-sm font-bold text-gray-700 mb-2">
          Initial Course
        </label>
        <Select
          id="course"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          required
          className="w-full"
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id.toString()}>
              {course.title}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Invite Students</label>
        <div className="border border-gray-300 rounded-md p-4">
          <UserSearchWrapper onUpdateSelectedUsers={setSelectedStudents} />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Create Class
      </Button>
    </form>
  );
};
