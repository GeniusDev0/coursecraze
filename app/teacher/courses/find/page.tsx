import React from 'react';

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { getTeacherProgress, getCourses, getUnitAmountInCourse } from "@/db/queries";

import CourseList from './components/list'

const FindCoursePage = async () => {
  const { userId } = auth();

  const courses = await getCourses();
  const coursesWithUnitCounts = await Promise.all(
    courses.map(async (course) => ({
      ...course,
      unitCount: await getUnitAmountInCourse(course.id),
    }))
  );

  if (!userId) {
    return redirect("/");
  }

  const teacherProgress = await getTeacherProgress();

  if (!teacherProgress || teacherProgress.role !== "TEACHER") {
    return redirect("/");
  }
  
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-800">Find a Course</h1>
      <p className="mb-8 text-lg text-slate-600">
        Browse through our available courses and select one to teach.
      </p>
      <CourseList courses={coursesWithUnitCounts} />
    </div>
  );
};

export default FindCoursePage;