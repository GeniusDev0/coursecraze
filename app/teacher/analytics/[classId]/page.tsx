import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getTeacherProgress, getClassById, getStudentProgressInClass } from "@/db/queries";

import { StudentList } from "./components/student-list";

const ClassAnalyticsPage = async ({ params }: { params: { classId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const teacherProgress = await getTeacherProgress();

  if (!teacherProgress || teacherProgress.role !== "TEACHER") {
    return redirect("/");
  }

  const classId = parseInt(params.classId, 10);
  const classDetails = await getClassById(classId);

  if (!classDetails || classDetails.teacherId !== userId) {
    return redirect("/teacher/analytics");
  }

  const studentsProgress = await getStudentProgressInClass(classId);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Link href="/teacher/analytics">
            <Button variant="secondary" className="mr-4">
              &larr;
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-700">
            {classDetails.name} - Student Analytics
          </h1>
        </div>
        <Image
          src={classDetails.imageSrc}
          alt={classDetails.name}
          width={64}
          height={64}
          className="rounded-full"
        />
      </div>
      <StudentList 
        students={studentsProgress} 
        classId={classId} 
      />
    </div>
  );
};

export default ClassAnalyticsPage;
