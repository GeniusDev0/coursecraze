import { AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";

import { Header } from "./header";
import { Unit } from "./unit";

export default async function LearnPage() {
  try {
    const [
      userProgress,
      units,
      courseProgress,
      lessonPercentage,
      userSubscription,
    ] = await Promise.all([
      getUserProgress(),
      getUnits(),
      getCourseProgress(),
      getLessonPercentage(),
      getUserSubscription(),
    ]);

    if (!userProgress?.activeCourse || !courseProgress) {
      redirect("/courses?error=no-active-course");
    }

    const isPro = !!userSubscription?.isActive;

    let activeLesson = courseProgress.activeLesson;
    let activeLessonPercentage = lessonPercentage;

    if (!activeLesson || activeLessonPercentage === 100) {
      for (const unit of units) {
        const incompleteLesson = unit.lessons.find(lesson => !lesson.completed);
        if (incompleteLesson) {
          activeLesson = {
            ...incompleteLesson,
            unit: {
              id: unit.id,
              title: unit.title,
              description: unit.description,
              courseId: userProgress.activeCourseId!,
              order: unit.order,
              isCompleted: unit.isCompleted,
            }
          };
          activeLessonPercentage = 0;
          break;
        }
      }
    }

    const isCourseCompleted = units.every(unit => 
      unit.lessons.every(lesson => lesson.completed)
    );

    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-row-reverse gap-[48px] px-6 py-0 flex-1 max-w-7xl mx-auto w-full">
          <div className="w-[300px] flex-shrink-0">
            <StickyWrapper>
              <UserProgress
                activeCourse={userProgress.activeCourse}
                hearts={userProgress.hearts}
                points={userProgress.points}
                hasActiveSubscription={isPro}
              />
              {!isPro && <Promo />}
              <Quests points={userProgress.points} />
            </StickyWrapper>
          </div>
          <FeedWrapper>
            <Header title={userProgress.activeCourse.title} />
            {isCourseCompleted && (
              <div className="mb-8 rounded-xl bg-emerald-50 border-2 border-emerald-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-800">Course Completed!</h3>
                </div>
                <p className="text-emerald-700 mt-2 ml-11">
                  Congratulations! You&apos;ve mastered all lessons in this course.
                </p>
              </div>
            )}
            {units.length === 0 ? (
              <div className="rounded-xl border-2 border-destructive/50 p-6 bg-destructive/10">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h3 className="font-bold text-destructive">No Units Found</h3>
                </div>
                <p className="text-destructive/90 mt-2 ml-8">
                  This course doesn&apos;t have any content yet. Please check back later.
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {units.map((unit) => (
                  <Unit
                    key={unit.id}
                    id={unit.id}
                    order={unit.order}
                    description={unit.description}
                    title={unit.title}
                    lessons={unit.lessons}
                    activeLesson={activeLesson}
                    activeLessonPercentage={activeLessonPercentage}
                    isCompleted={unit.isCompleted}
                  />
                ))}
              </div>
            )}
          </FeedWrapper>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[LearnPage]", error);
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="rounded-xl border-2 border-destructive/50 p-6 bg-destructive/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-bold text-destructive">Error Loading Course</h3>
          </div>
          <p className="text-destructive/90 mt-2 ml-8">
            Something went wrong while loading the course. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
