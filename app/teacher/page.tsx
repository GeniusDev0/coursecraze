import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { getIsTeacher } from "@/lib/teacher";

const App = dynamic(() => import("./app"), { ssr: false });

const teacherPage = () => {
  const isAdmin = getIsTeacher();

  if (!isAdmin) redirect("/");

  return (
    <div>
      <App />
    </div>
  );
};

export default teacherPage;
