import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
    
type StudentItemProps = {
  student: {
    userId: string;
    student: { 
      userImageSrc: string; 
      userName: string; 
      userId: string;
    };
    email: string;
  };
  courseId: number;
};

export const StudentItem = ({ student, courseId }: StudentItemProps) => {
  console.log(`Rendering StudentItem:`, JSON.stringify(student, null, 2));
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div className="flex items-center space-x-4">
        <Image
          src={student.student.userImageSrc}
          alt={student.student.userName}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h3 className="text-lg font-semibold">{student.student.userName}</h3>
          <p className="text-sm text-gray-500">{student.email}</p>
        </div>
      </div>
      <Link href={`/teacher/analytics/${courseId}/${student.student.userId}`}>
        <Button size="sm" variant="ghost">
          <Pencil className="h-4 w-4 mr-2" />
          View Progress
        </Button>
      </Link>
    </div>
  );
};
