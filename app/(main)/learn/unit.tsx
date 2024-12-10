import React from "react";

import { lessons, units } from "@/db/schema";
import { cn } from "@/lib/utils";

import { LessonButton } from "./lesson-button";
import { UnitBanner } from "./unit-banner";

type UnitProps = {
  id: number;
  order: number;
  title: string;
  description: string;
  lessons: (typeof lessons.$inferSelect & {
    completed: boolean;
  })[];
  activeLesson?:
    | (typeof lessons.$inferSelect & {
        unit: typeof units.$inferSelect;
      })
    | undefined;
  activeLessonPercentage: number;
  isCompleted: boolean;
};


export const Unit = ({
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
  isCompleted
}: UnitProps) => {
  return (
    <div className={cn(
      "rounded-xl",
      isCompleted && "bg-yellow-50/50"
    )}>
      <UnitBanner 
        title={title} 
        description={description}
      />

      <div className="relative flex flex-col items-center py-12">
        <div className="flex justify-center w-full">
          <div className="relative w-fit">
            {lessons.map((lesson, i) => {
              const isCurrent = lesson.id === activeLesson?.id;
              const isLocked = !lesson.completed && !isCurrent;
              const isCompleted = lesson.completed;

              return (
                <div 
                  key={lesson.id}
                  className={cn(
                    "relative z-10",
                    i !== lessons.length - 1 && "mb-4"
                  )}
                >
                  <LessonButton
                    id={lesson.id}
                    index={i}
                    totalCount={lessons.length - 1}
                    current={isCurrent}
                    locked={isLocked}
                    percentage={isCurrent ? activeLessonPercentage : 0}
                    completed={isCompleted}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
