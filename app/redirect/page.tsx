import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { getUserProgress } from "@/db/queries";
import { getIsTeacher } from "@/lib/teacher";

export default async function RedirectPage() {
    const { userId } = auth();
    if (!userId) {
        redirect("/");
    }

    const isTeacherPromise = getIsTeacher();
    const userProgressPromise = getUserProgress();

    const [isTeacher, userProgress] = await Promise.all([isTeacherPromise, userProgressPromise]);

    console.log("Is teacher:", isTeacher);

    if (!userProgress || (userProgress.role !== "STUDENT" && userProgress.role !== "TEACHER")) {
        redirect("/roles");
    } else if (isTeacher || userProgress.role === "TEACHER") {
        redirect("/teacher/courses");
    } else {
        redirect("/learn");
    }
}