import { auth, currentUser } from "@clerk/nextjs";

export const getIsAdmin = async () => {
  let userId;

  if (typeof window === "undefined") {
    // Server-side
    const { userId: serverUserId } = auth();
    userId = serverUserId;
  } else {
    // Client-side
    const user = await currentUser();
    userId = user?.id;
  }

  console.log("Current user ID:", userId);
  
  const adminIdsString = process.env.NEXT_PUBLIC_CLERK_ADMIN_IDS;
  console.log("CLERK_ADMIN_IDS env variable:", adminIdsString);
  
  if (!adminIdsString) {
    console.error("CLERK_ADMIN_IDS is not set in the environment variables");
    return false;
  }
  
  const adminIds = adminIdsString.split(",").map(id => id.trim());
  console.log("Parsed admin IDs:", adminIds);

  if (!userId) {
    console.log("No user ID found");
    return false;
  }
  
  const isAdmin = adminIds.includes(userId);
  console.log("Is admin?", isAdmin);
  
  return isAdmin;
};