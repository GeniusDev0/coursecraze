import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { setUserRole } from "@/db/queries";

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json() as { role: string };
    const { role } = body as { role: string };
    
    if (role !== "STUDENT" && role !== "TEACHER") {
      return new NextResponse("Invalid role", { status: 400 });
    }

    const updatedUser = await setUserRole(userId, role);

    if (!updatedUser) {
      return new NextResponse("Failed to update or create user role", { status: 500 });
    }

    const safeUserData = {
      userId: updatedUser.userId,
      role: updatedUser.role,
    };

    return NextResponse.json(safeUserData);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
