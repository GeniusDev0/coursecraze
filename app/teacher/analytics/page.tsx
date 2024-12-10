import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getTeacherProgress, getTeacherClasses, getStudentProgressInClass } from "@/db/queries";

import { ClassCard } from "./components/class-card";


const AnalyticsDashboardPage = async () => {
  const { userId } = auth();
  
  if (!userId) {
    return redirect("/");
  }

  const teacherProgress = await getTeacherProgress();

  if (!teacherProgress || teacherProgress.role !== "TEACHER") {
    return redirect("/");
  }

  const classes = await getTeacherClasses(userId);

  const classesWithProgress = await Promise.all(classes.map(async (classItem) => {
    const studentsProgress = await getStudentProgressInClass(classItem.id);
    
    const averageProgress = studentsProgress.length > 0
      ? (studentsProgress.reduce((sum: number, student: { progressPercentage: number }) => sum + student.progressPercentage, 0) / 
        studentsProgress.length) / 100
      : 0;

    return {
      ...classItem,
      studentCount: studentsProgress.length,
      averageProgress,
    };
  }));

  return (
    <div className="mx-auto h-full max-w-[912px] px-3 mt-8 pt-7">
      <h1 className="text-2xl font-bold text-neutral-700 mb-6">Your Analytics</h1>
      {classesWithProgress.length === 0 ? (
        <div className="text-center">
          <h2 className="text-lg font-semibold text-neutral-600 mb-4">No classes yet, create some here!</h2>
          <a href="/teacher/classes/create" className="inline-block">
            <Button variant="secondary" className="inline-block">Create Class</Button>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesWithProgress.map((classItem) => (
            <ClassCard 
              key={classItem.id} 
              classItem={classItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
