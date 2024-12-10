import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { updateClass, deleteClass } from "@/db/queries";
import { getIsTeacher } from "@/lib/teacher";

export async function PATCH(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    console.log("[CLASS_ID_PATCH] Starting class update process");

    const { userId } = auth();
    if (!userId) {
      console.log("[CLASS_ID_PATCH] Unauthorized access attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const classId = parseInt(params.classId, 10);
    console.log(`[CLASS_ID_PATCH] Updating class with ID: ${classId}`);

    const { name, image } = await req.json() as { name: string; image?: string };

    console.log(`[CLASS_ID_PATCH] Received data - Name: ${name}, Image: ${image ? 'Present' : 'Not present'}`);

    let imageSrc: string | undefined = undefined;
    if (image) {
      imageSrc = image;
      console.log(`[CLASS_ID_PATCH] Image received as base64`);
    }

    console.log("[CLASS_ID_PATCH] Calling updateClass function");
    const updatedClass = await updateClass(classId, {
      name,
      ...(imageSrc && { imageSrc }),
    });

    console.log("[CLASS_ID_PATCH] Class updated successfully:", updatedClass);
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("[CLASS_ID_PATCH] Error updating class:", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    console.log("[CLASS_ID_DELETE] Starting class deletion process");

    const { userId } = auth();
    const isTeacher = await getIsTeacher();

    if (!userId || !isTeacher) {
      console.log("[CLASS_ID_DELETE] Unauthorized access attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const classId = parseInt(params.classId, 10);
    console.log(`[CLASS_ID_DELETE] Deleting class with ID: ${classId}`);

    const deletedClass = await deleteClass(classId);

    if (!deletedClass) {
      console.log(`[CLASS_ID_DELETE] Class with ID ${classId} not found`);
      return new NextResponse("Class not found", { status: 404 });
    }

    console.log("[CLASS_ID_DELETE] Class deleted successfully:", deletedClass);
    return NextResponse.json(deletedClass);
  } catch (error) {
    console.error("[CLASS_ID_DELETE] Error deleting class:", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
