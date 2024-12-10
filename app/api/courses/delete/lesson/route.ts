import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { lessons, challenges, challengeOptions } from "@/db/schema";

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lessonId } = await req.json() as { lessonId: number };

    if (!lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 });
    }

    // Check if the user owns the course
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        unit: {
          with: {
            course: true,
          },
        },
      },
    });

    if (!lesson || lesson.unit.course.teacherId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the lesson and its related data
    await db.transaction(async (tx) => {
      // Delete challenge options
      await tx
        .delete(challengeOptions)
        .where(eq(challengeOptions.challengeId, lessonId));

      // Delete challenges
      await tx
        .delete(challenges)
        .where(eq(challenges.lessonId, lessonId));

      // Delete the lesson
      await tx
        .delete(lessons)
        .where(eq(lessons.id, lessonId));
    });

    return new NextResponse("Lesson deleted successfully", { status: 200 });
  } catch (error) {
    console.error("[LESSON_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
