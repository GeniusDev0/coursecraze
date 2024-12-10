'use client'

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Course } from '@/db/schema';

interface CourseListProps {
  courses: (Course & { unitCount: number })[];
}

const CourseList: React.FC<CourseListProps> = ({ courses }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseItem key={course.id} course={course} />
      ))}
    </div>
  );
};

const CourseItem: React.FC<{ course: Course & { unitCount: number } }> = ({ course }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <Image src={course.imageSrc} alt={course.title} width={400} height={160} className="w-full h-40 object-cover rounded-md mb-4" />
      <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
      <p className="text-gray-600 mb-2">
        {course.isPublic ? 'Public' : 'Private'} Course
      </p>
      {course.isPaid && (
        <p className="text-green-600 font-semibold mb-2">
          Price: ${course.price ? (course.price / 100).toFixed(2) : 'N/A'}
        </p>
      )}
      <p className="text-sm text-gray-500 mb-2">
        Units: {course.unitCount}
      </p>
      <Link href={`/teacher/courses/find/${course.id}`}>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          View Course
        </button>
      </Link>
    </div>
  );
};

export default CourseList;