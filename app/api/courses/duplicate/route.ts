import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { createCourseFromJSON, getCourseById } from "@/db/queries";
import { CourseJSON } from "@/db/queries";
import { Unit, Lesson, Challenge, ChallengeOption } from "@/db/schema";

export async function POST(req: Request) {
	try {
		const { userId } = auth();
		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const { courseId } = (await req.json()) as { courseId: number };

		if (!courseId) {
			return new NextResponse("Course ID is required", { status: 400 });
		}

		const originalCourse = await getCourseById(courseId);

		if (!originalCourse) {
			return new NextResponse("Course not found", { status: 404 });
		}

		const newCourseJSON: CourseJSON = {
			title: `${originalCourse.title} (Copy)`,
			imageSrc: originalCourse.imageSrc,
			units: originalCourse.units?.map((unit: Unit & { lessons?: (Lesson & { challenges?: Challenge[] })[] }) => ({
				title: unit.title,
				description: unit.description,
				lessons: unit.lessons?.map((lesson) => ({
					title: lesson.title,
					challenges: lesson.challenges?.map((challenge) => ({
						type: challenge.type,
						question: challenge.question,
						options: (challenge as Challenge & { challengeOptions?: ChallengeOption[] }).challengeOptions?.map((option) => ({
							text: option.text,
							correct: option.correct
						})) || []
					})) || []
				})) || []
			})) || []
		};

		const newCourseId = await createCourseFromJSON(newCourseJSON, userId, false, 0);

		return NextResponse.json({ newCourseId });
	} catch (error) {
		return new NextResponse("Internal Error", { status: 500 });
	}
}
