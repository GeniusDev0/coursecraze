import { auth, clerkClient } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getClassById, getTeacherProgress } from "@/db/queries";

import { ClassEditSidebar } from "./components/class-edit-sidebar";
import { Header } from "./components/header";
import { StudentList } from "./components/student-list";

const ClassDetailsPage = async ({ params }: { params: { classId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const teacherProgress = await getTeacherProgress();

  if (!teacherProgress || teacherProgress.role !== "TEACHER") {
    redirect("/");
  }

  const classId = parseInt(params.classId, 10);
  const classDetails = await getClassById(classId);

  if (!classDetails) {
    console.log(`No class found with ID: ${classId}`);
    redirect("/teacher/classes");
  }

  // Check if the teacher owns the class
  if (classDetails.teacherId !== teacherProgress?.userId) {
    console.log(`Teacher ${teacherProgress?.userId} does not own class ${classId}`);
    redirect("/teacher/classes");
  }

  console.log(`Rendering class details for class ${classDetails.name}`);

  const studentsWithEmail = await Promise.all(
    classDetails.students.map(async (s) => {
      // Check if userId is valid
      if (!s.student.userId) {
        console.warn(`Invalid userId for student:`, s);
        return {
          ...s,
          email: 'No email found',
        };
      }
      
      const clerkUser = await clerkClient.users.getUser(s.student.userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || 'No email found';
      return {
        ...s,
        email,
      };
    })
  );

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <ClassEditSidebar
          classDetails={classDetails}
          teacherProgress={teacherProgress}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={`Class: ${classDetails.name}`} />
        <StudentList 
          students={studentsWithEmail}
          courseId={classDetails.courseId} 
          classImage={classDetails.imageSrc}
          className={classDetails.name}
        />
      </FeedWrapper>
    </div>
  );
};

export default ClassDetailsPage;
