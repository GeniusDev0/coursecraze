import { Lesson } from "@/db/schema";

import { LessonItem } from "./lesson-item";

type LessonListProps = {
  lessons: Lesson[];
  unitId: number;
  courseId: number;
};

export const LessonList = ({ lessons, unitId, courseId }: LessonListProps) => {
  return (
    <div className="space-y-4">
      {lessons.map((lesson) => (
        <LessonItem key={lesson.id} lesson={lesson} unitId={unitId} courseId={courseId} />
      ))}
    </div>
  );
};