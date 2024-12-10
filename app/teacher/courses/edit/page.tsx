import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import {
  getCourseById,
  getTeacherProgress,
} from "@/db/queries";

import { CourseEditSidebar } from "./[courseId]/components/course-edit-sidebar";
import { Header } from "./[courseId]/components/header";
import { UnitList } from "./[courseId]/components/unit-list";

const CourseEditPage = async () => {
  const { userId } = auth();
  const teacherProgress = await getTeacherProgress();

  if ((!teacherProgress || teacherProgress.role !== "TEACHER") && userId !== "user_2mhMZQtLJjIgaR2FjbRnUbRA6ec") {
    redirect("/");
  }

  const course = await getCourseById(teacherProgress?.activeCourseId ?? 0);

  if (!course) {
    redirect("/courses");
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <CourseEditSidebar
          course={course}
          teacherProgress={{
            userId: teacherProgress?.userId || '',
            role: teacherProgress?.role || 'TEACHER',
            userName: teacherProgress?.userName || '',
            userImageSrc: teacherProgress?.userImageSrc || '',
            activeCourseId: teacherProgress?.activeCourseId || null,
            hearts: teacherProgress?.hearts || 0,
            points: teacherProgress?.points || 0,
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