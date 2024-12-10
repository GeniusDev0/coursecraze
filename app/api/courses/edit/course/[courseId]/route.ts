import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { courses } from "@/db/schema";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { courseId } = params;
    const body = await req.json() as { title: string; isPublic: boolean; imageSrc: string | null };
    const { title, isPublic, imageSrc } = body;

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, parseInt(courseId)),
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    if (course.teacherId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedCourse = await db
      .update(courses)
      .set({
        title,
        isPublic,
        imageSrc: imageSrc || undefined,
      })
      .where(eq(courses.id, parseInt(courseId)))
      .returning();

    return NextResponse.json(updatedCourse[0]);
  } catch (error) {
    console.error("[COURSE_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
