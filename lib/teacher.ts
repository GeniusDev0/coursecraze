// lib/teacher.ts
import { auth } from "@clerk/nextjs";

export const getIsTeacher = () => {
  const { userId } = auth();
  console.log("Current user ID:", userId);

  // Fetch the list of teacher IDs from the environment variable
  const teacherIdsString = process.env.CLERK_TEACHER_IDS;
  console.log("CLERK_TEACHER_IDS env variable:", teacherIdsString);

  if (!teacherIdsString) {
    console.error("CLERK_TEACHER_IDS is not set in the environment variables");
    return false;
  }

  // Split the teacher IDs into an array
  const teacherIds = teacherIdsString.split(", ");
  console.log("Parsed teacher IDs:", teacherIds);

  // Check if the user ID is defined
  if (!userId) {
    console.log("No user ID found");
    return false;
  }

  // Determine if the user is a teacher
  const isTeacher = teacherIds.includes(userId);
  console.log("Is teacher?", isTeacher);

  return isTeacher;
};
