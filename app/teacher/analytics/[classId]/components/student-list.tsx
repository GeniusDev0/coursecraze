import { StudentCard } from "./student-card";

type StudentListProps = {
  students: Array<{
    userId: string;
    userName: string;
    userImageSrc: string;
    points: number;
    progressPercentage: number;
    completedChallenges: number;
    totalChallenges: number;
  }>;
  classId: number;
};

export const StudentList = ({ students, classId }: StudentListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((student) => (
        <StudentCard key={student.userId} student={student} classId={classId} />
      ))}
    </div>
  );
};
