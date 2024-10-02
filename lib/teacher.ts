import { auth } from "@clerk/nextjs";

import { getUserProgress } from "@/db/queries";

export const getIsTeacher = async () => {
  const { userId } = auth();
  
  if (!userId) {
    console.log("No user ID found");
    return false;
  }

  const userProgress = await getUserProgress();
  
  if (!userProgress) {
    console.log("No user progress found");
    return false;
  }

  const isTeacher = userProgress.role === "TEACHER";
  console.log("Is teacher?", isTeacher);
  
  return isTeacher;
};