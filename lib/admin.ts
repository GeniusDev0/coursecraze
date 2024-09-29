import { auth } from "@clerk/nextjs";

export const getIsAdmin = () => {
  const { userId } = auth();
  console.log("Current user ID:", userId);
  
  // Accessing the environment variable
  const adminIdsString = process.env.CLERK_ADMIN_IDS;
  console.log("CLERK_ADMIN_IDS env variable:", adminIdsString);
  
  if (!adminIdsString) {
    console.error("CLERK_ADMIN_IDS is not set in the environment variables");
    return false;
  }
  
  // Split by comma to get an array of admin IDs
  const adminIds = adminIdsString.split(","); // Change to split(",") if IDs are comma-separated without spaces
  console.log("Parsed admin IDs:", adminIds);

  // Check if userId is available
  if (!userId) {
    console.log("No user ID found");
    return false;
  }
  
  // Check if the current user ID is included in the admin IDs
  const isAdmin = adminIds.includes(userId);
  console.log("Is admin?", isAdmin);
  
  return isAdmin;
};
