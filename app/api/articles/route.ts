import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { createArticle } from "@/db/queries";
import { getIsAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId || !(await getIsAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json() as { title: string; summary: string; content: string; readTime: number };
  const { title, summary, content, readTime } = body;

  if (!title || !summary || !content || !readTime) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  try {
    const newArticle = await createArticle({ title, summary, content, readTime });
    return NextResponse.json(newArticle);
  } catch (error) {
    console.error("Error creating article:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
