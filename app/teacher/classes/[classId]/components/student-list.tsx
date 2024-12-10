import Image from "next/image";

import { ClassStudent } from "@/db/schema";

import { StudentItem } from "./student-item";

type StudentListProps = {
  students: (ClassStudent & { 
    student: { 
      userImageSrc: string; 
      userName: string; 
      userId: string;
    }; 
    email: string;
  })[];
  courseId: number;
  classImage: string;
  className: string;
};

export const StudentList = ({ students, courseId, classImage, className }: StudentListProps) => {
  console.log(`Rendering StudentList with ${students.length} students`);
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Image
          src={classImage}
          alt={className}
          width={64}
          height={64}
          className="rounded-full"
        />
        <h2 className="text-2xl font-bold">{className}</h2>
      </div>
      <div className="space-y-4">
        {students.map((student) => (
          <StudentItem
            key={student.student.userId}
            student={student}
            courseId={courseId}
          />
        ))}
      </div>
    </div>
  );
};
