import { redirect } from "next/navigation";

import { getIsAdmin } from "@/lib/admin";

export default async function RedirectPage() {
  const isAdmin = await getIsAdmin();
  
  if (isAdmin) {
    redirect("/admin");
  } else {
    redirect("/learn");
  }
}