import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { getIsTeacher } from "@/lib/teacher";

const App = dynamic(() => import("./app"), { ssr: false });

const teacherPage = async () => {
  const isTeacher = await getIsTeacher();

  if (!isTeacher) {
    redirect("/");
  }

  return (
    <div>
      <App />
    </div>
  );
};

export default teacherPage;