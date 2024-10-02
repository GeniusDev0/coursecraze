/* eslint-disable @typescript-eslint/await-thenable */
import { auth } from "@clerk/nextjs";

export const getIsAdmin = async () => {
  const { userId } = await auth();
  
  console.log("Current user ID:", userId);
  const adminId = process.env.CLERK_ADMIN_IDS;
  console.log("CLERK_ADMIN_IDS env variable:", adminId);
  
  if (!adminId) {
    console.error("CLERK_ADMIN_IDS is not set in the environment variables");
    return false;
  }
  
  // Remove any surrounding quotes from the adminId
  const cleanAdminId = adminId.replace(/^["']|["']$/g, '').trim();
  
  console.log("Cleaned admin ID:", cleanAdminId);

  if (!userId) {
    console.log("No user ID found");
    return false;
  }
  
  const isAdmin = userId === cleanAdminId;
  console.log("Is admin?", isAdmin);
  
  return isAdmin;
};