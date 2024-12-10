import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { getUserRole } from "@/db/queries";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userRole = await getUserRole(userId);

    if (!userRole) {
      return new NextResponse("User role not found", { status: 404 });
    }

    return NextResponse.json({ role: userRole });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
