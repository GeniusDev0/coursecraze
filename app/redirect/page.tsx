import { redirect } from "next/navigation";

import { getIsAdmin } from "@/lib/admin";
import { getIsTeacher } from "@/lib/teacher";

export default async function RedirectPage() {
    const isAdminPromise = getIsAdmin();
    const isTeacherPromise = getIsTeacher();

    const [isAdmin, isTeacher] = await Promise.all([isAdminPromise, isTeacherPromise]);

    console.log("Is admin:", isAdmin);
    console.log("Is teacher:", isTeacher);

    if (isAdmin) {
        redirect("/admin");
    } else if (isTeacher) {
        redirect("/teach");
    } else {
        redirect("/learn");
    }
}