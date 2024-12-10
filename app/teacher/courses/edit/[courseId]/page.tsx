import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import {
  getCourseById,
  getTeacherProgress,
} from "@/db/queries";

import { CourseEditSidebar } from "./components/course-edit-sidebar";
import { Header } from "./components/header";
import { UnitList } from "./components/unit-list";

const CourseEditPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const teacherProgress = await getTeacherProgress();

  if (!teacherProgress || teacherProgress.role !== "TEACHER") {
    redirect("/");
  }

  const courseId = parseInt(params.courseId, 10);
  const course = await getCourseById(courseId);

  if (!course) {
    redirect("/teacher/courses");
  }

  // Check if the teacher owns the course
  if (course.teacherId !== teacherProgress?.userId) {
    redirect("/teacher/courses");
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <CourseEditSidebar
          course={course}
          teacherProgress={teacherProgress || {
            userId: '',
            role: 'TEACHER',
            userName: '',
            userImageSrc: '',
            activeCourseId: null,
            hearts: 0,
            points: 0,
          }}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={`Editing: ${course.title}`} />
        <UnitList units={course.units} courseId={course.id} />
      </FeedWrapper>
    </div>
  );
};

export default CourseEditPage;