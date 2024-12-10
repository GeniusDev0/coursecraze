import React from 'react';

import { notFound } from 'next/navigation';

import { getCourseById, getUnitAmountInCourse } from '@/db/queries';

import CourseDetails from './components/course-details';

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  console.log('Rendering course page with params:', params);
  const courseId = parseInt(params.courseId, 10);
  console.log('Fetching course with ID:', courseId);
  const course = await getCourseById(courseId);

  if (!course) {
    console.log('Course not found');
    notFound();
  }

  console.log('Course found:', course);
  const unitCount = await getUnitAmountInCourse(courseId);
  console.log('Unit count:', unitCount);

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseDetails course={{ ...course, unitCount, teacher: course.teacher || undefined }} />
    </div>
  );
}