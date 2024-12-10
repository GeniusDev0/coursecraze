import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { challenges, challengeOptions } from "@/db/schema";

export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { challengeId, question, options } = await req.json() as {
      challengeId: number;
      question: string;
      options: { id: number; text: string; correct: boolean }[];
    };

    if (!challengeId || !question || !options) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if the user owns the course
    const challenge = await db.query.challenges.findFirst({
      where: eq(challenges.id, challengeId),
      with: {
        lesson: {
          with: {
            unit: {
              with: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!challenge || challenge.lesson.unit.course.teacherId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the challenge
    const updatedChallenge = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(challenges)
        .set({ question })
        .where(eq(challenges.id, challengeId))
        .returning();

      // Update or create options
      for (const option of options) {
        if (option.id) {
          await tx
            .update(challengeOptions)
            .set({ text: option.text, correct: option.correct })
            .where(eq(challengeOptions.id, option.id));
        } else {
          await tx.insert(challengeOptions).values({
            challengeId,
            text: option.text,
            correct: option.correct,
          });
        }
      }

      return updated;
    });

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    console.error("[CHALLENGE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}