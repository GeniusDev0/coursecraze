import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { createClass } from "@/db/queries";
import { getIsTeacher } from "@/lib/teacher";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const isTeacher = await getIsTeacher();

    if (!userId || !isTeacher) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json() as { name: string; courseId: number; studentIds: string[] };
    const { name, courseId, studentIds } = body;

    // Validate input
    if (!name || !courseId || !Array.isArray(studentIds)) {
      return new NextResponse("Invalid input", { status: 400 });
    }

    // Create the class using the createClass function from queries
    const newClass = await createClass({
      name,
      teacherId: userId,
      courseId,
      studentIds,
    });

    if (!newClass) {
      return new NextResponse("Failed to create class", { status: 500 });
    }

    return NextResponse.json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
