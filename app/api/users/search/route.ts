import { auth, clerkClient } from "@clerk/nextjs";
import { and, or, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { getIsTeacher } from "@/lib/teacher";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const isTeacher = await getIsTeacher();

    if (!userId || !isTeacher) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return new NextResponse("Missing query parameter", { status: 400 });
    }

    const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);

    const users = await db.query.userProgress.findMany({
      where: and(
        ...searchTerms.map(term => 
          or(
            ilike(userProgress.userName, `%${term}%`),
            ilike(userProgress.userId, `%${term}%`)
          )
        )
      ),
      columns: {
        userId: true,
        userName: true,
        userImageSrc: true,
      },
      limit: 10,
    });

    // Fetch email addresses from Clerk
    const usersWithEmail = await Promise.all(
      users.map(async (user) => {
        try {
          const clerkUser = await clerkClient.users.getUser(user.userId);
          return {
            ...user,
            email: clerkUser.emailAddresses[0]?.emailAddress || 'No email found',
          };
        } catch (error) {
          console.error(`Error fetching email for user ${user.userId}:`, error);
          return {
            ...user,
            email: 'Error fetching email',
          };
        }
      })
    );

    return NextResponse.json(usersWithEmail);
  } catch (error) {
    console.error("[USERS_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
