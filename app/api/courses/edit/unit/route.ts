import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { units, courses } from "@/db/schema";

export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { unitId, courseId, title, description } = await req.json() as {
      unitId: string;
      courseId: string;
      title: string;
      description: string;
    };

    if (!unitId || !courseId || !title || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if the user owns the course
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, parseInt(courseId)),
    });

    if (!course || course.teacherId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the unit
    const updatedUnit = await db
      .update(units)
      .set({ title, description })
      .where(eq(units.id, parseInt(unitId)))
      .returning();

    return NextResponse.json(updatedUnit[0]);
  } catch (error) {
    console.error("[UNIT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}