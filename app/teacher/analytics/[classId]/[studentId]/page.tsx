import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getTeacherProgress, getStudentDetailedProgress } from "@/db/queries";

import ProgressTimeline from "./components/progress-timeline";

const StudentDetailsPage = async ({ params }: { params: { classId: string; studentId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const teacherProgress = await getTeacherProgress();

  if (!teacherProgress || teacherProgress.role !== "TEACHER") {
    return redirect("/");
  }

  const classId = parseInt(params.classId, 10);
  const studentId = params.studentId;

  const studentProgress = await getStudentDetailedProgress(classId, studentId);

  if (!studentProgress) {
    return redirect(`/teacher/analytics/${classId}`);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Link href={`/teacher/analytics/${classId}`}>
            <Button variant="secondary" className="mr-4">
              &larr;
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Student Progress: {studentProgress.studentName}</h1>
        </div>
        <Image
          src={studentProgress.studentImageSrc || "/default-avatar.png"}
          alt={studentProgress.studentName}
          width={64}
          height={64}
          className="rounded-full"
        />
      </div>
      <ProgressTimeline unitProgress={studentProgress.unitProgress} />
    </div>
  );
};

export default StudentDetailsPage;
