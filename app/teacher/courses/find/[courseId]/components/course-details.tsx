'use client';

import React, { useState } from 'react';

import { useAuth } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { redirect, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Course, UserProgress } from '@/db/schema';


interface CourseDetailsProps {
  course: Course & { 
    unitCount: number;
    teacher?: UserProgress;
  };
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ course }) => {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTeachCourse = async () => {
    if (!userId) {
      return redirect("/");
    }
  
    setIsLoading(true);
    try {
      console.log('Sending request to duplicate course:', course.id);
      const response = await fetch('/api/courses/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
        }),
      });

      const { newCourseId } = response.ok 
        ? await response.json() as { newCourseId: number } 
        : { newCourseId: null };

      console.log('New course created with ID:', newCourseId);

      router.push(`/teacher/courses/edit/${newCourseId || course.id}`);

    } catch (error) {
      console.error('Error duplicating course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Image
        src={course.imageSrc}
        alt={course.title}
        width={800}
        height={400}
        className="w-full h-64 object-cover"
      />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500">
            {course.isPublic ?? true ? 'Public' : 'Private'} Course
          </span>
          <span className="text-gray-500">Units: {course.unitCount}</span>
        </div>
        {course.price !== null && course.price > 0 && (
          <p className="text-green-600 font-semibold mb-4">
            Price: ${(course.price / 100).toFixed(2)}
          </p>
        )}
        {course.teacher && (
          <p className="text-gray-600 mb-4">
            Teacher: {course.teacher.userName}
          </p>
        )}
        <div className="flex justify-end">
          <Button 
            onClick={() => void handleTeachCourse()}
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Duplicating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Teach This Course
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
