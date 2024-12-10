import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getCourseById, getTeacherProgress, getLessonById, getChallengesByLessonId, getChallengeOptionsByChallengeId } from "@/db/queries";

import { ChallengeList } from "./components/challenge-list";
import { Header } from "./components/header";
import { LessonForm } from "./components/lesson-form";

interface LessonEditPageProps {
  params: {
    courseId: string;
    unitId: string;
    lessonId: string;
  };
}

const LessonEditPage = async ({ params }: LessonEditPageProps) => {
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

  if (course.teacherId !== teacherProgress?.userId) {
    redirect("/teacher/courses");
  }

  const lesson = await getLessonById(parseInt(params.lessonId));

  if (!lesson) {
    redirect(`/teacher/courses/edit/${params.courseId}/units/${params.unitId}`);
  }

  const challenges = await getChallengesByLessonId(parseInt(params.lessonId));

  const challengesWithOptions = await Promise.all(
    challenges.map(async (challenge) => {
      const options = await getChallengeOptionsByChallengeId(challenge.id);
      return { ...challenge, options };
    })
  );

  const lessonWithChallenges = {
    ...lesson,
    challenges: challengesWithOptions,
  };

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <LessonForm lesson={lessonWithChallenges} unitId={parseInt(params.unitId)} />
      </StickyWrapper>
      <FeedWrapper>
        <Header 
          title={`Editing: ${lesson.title}`} 
          courseId={parseInt(params.courseId)}
          unitId={parseInt(params.unitId)}
        />
        <ChallengeList 
          challenges={challengesWithOptions}
          lessonId={lesson.id}
        />
      </FeedWrapper>
    </div>
  );
};

export default LessonEditPage;