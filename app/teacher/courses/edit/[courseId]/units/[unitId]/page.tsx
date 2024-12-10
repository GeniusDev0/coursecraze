import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getCourseById, getTeacherProgress } from "@/db/queries";

import { Header } from "./components/header";
import { LessonList } from "./components/lesson-list";
import { UnitForm } from "./components/unit-form";

interface UnitEditPageProps {
  params: {
    courseId: string;
    unitId: string;
  };
}

const UnitEditPage = async ({ params }: UnitEditPageProps) => {
  const { userId } = auth();
  if (!userId) {
    redirect("/");
  }
  const teacherProgress = await getTeacherProgress();

  if (!teacherProgress || teacherProgress.role !== "TEACHER") {
    redirect("/");
  }

  const course = await getCourseById(parseInt(params.courseId));

  if (!course) {
    redirect("/teacher/courses");
  }

  // Check if the teacher owns the course
  if (course.teacherId !== teacherProgress?.userId) {
    redirect("/teacher/courses");
  }

  const unit = course.units.find((u) => u.id === parseInt(params.unitId));

  if (!unit) {
    redirect(`/teacher/courses/edit/${params.courseId}`);
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UnitForm unit={unit} courseId={course.id} />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={`Editing: ${unit.title}`} courseId={course.id} />
        <LessonList lessons={unit.lessons} unitId={unit.id} courseId={course.id} />
      </FeedWrapper>
    </div>
  );
};

export default UnitEditPage;