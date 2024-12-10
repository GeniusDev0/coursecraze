import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { BackButton } from "@/components/ui/backbutton";

import { getTeacherProgress } from "@/db/queries";

import { CreateClassForm } from "./components/create-class-form";

const CreateClassPage = async () => {
  const { userId } = auth();
  
  if (!userId) {
    return redirect("/");
  }

  const teacherProgress = await getTeacherProgress();

  if (!teacherProgress || teacherProgress.role !== "TEACHER") {
    return redirect("/");
  }

  return (
    <div className="mx-auto h-full max-w-[912px] px-3 mt-8">
      <div className="pt-4">
        <BackButton />
      </div>
      <h1 className="text-gray-500 font-bold text-4xl text-center pb-8">Create New Class</h1>
      <CreateClassForm teacherId={userId} courses={teacherProgress.taughtCourses || []} />
    </div>
  );
};

export default CreateClassPage;
