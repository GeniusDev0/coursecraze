import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { getTeacherProgress } from "@/db/queries";

import { List } from "./list";

const CoursesPage = async () => {
  const { userId } = auth();
  
  if (!userId) {
    return redirect("/");
  }

  const teacherProgress = await getTeacherProgress();

  if (!teacherProgress || teacherProgress.role !== "TEACHER") {
    return redirect("/");
  }

  const courses = teacherProgress.taughtCourses || [];

  return (
    <div className="mx-auto h-full max-w-[912px] px-3 mt-8">
      <div className="pt-6">
        <List courses={courses} />
      </div>
    </div>
  );
};

export default CoursesPage;