import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { getIsTeacher } from "@/lib/teacher";

export const GET = async (
  _req: NextRequest,
  { params }: { params: { courseId: number } }
) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.courses.findFirst({
    where: eq(courses.id, params.courseId),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { courseId: number } }
) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof courses.$inferSelect;
  const data = await db
    .update(courses)
    .set({
      ...body,
    })
    .where(eq(courses.id, params.courseId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: { courseId: number } }
) => {
  const { userId } = auth();
  const isAdmin = await getIsAdmin();
  const isTeacher = await getIsTeacher();

  if (!isAdmin && !isTeacher) {
    return new NextResponse("Unauthorized.", { status: 401 });
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, params.courseId),
  });

  if (!course) {
    return new NextResponse("Course not found.", { status: 404 });
  }

  // Allow teachers to delete their own courses
  if (!isAdmin && course.teacherId !== userId) {
    return new NextResponse("Unauthorized to delete this course.", { status: 403 });
  }

  const data = await db
    .delete(courses)
    .where(eq(courses.id, params.courseId))
    .returning();

  return NextResponse.json(data[0]);
};
