import { Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Lesson } from "@/db/schema";

type LessonItemProps = {
  lesson: Lesson;
  unitId: number;
  courseId: number;
};

export const LessonItem = ({ lesson, unitId, courseId }: LessonItemProps) => {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{lesson.title}</h3>
        <Link href={`/teacher/courses/edit/${courseId}/units/${unitId}/lessons/${lesson.id}`}>
          <Button size="sm" variant="ghost">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>
      <p className="text-sm text-gray-500">Order: {lesson.order}</p>
    </div>
  );
};