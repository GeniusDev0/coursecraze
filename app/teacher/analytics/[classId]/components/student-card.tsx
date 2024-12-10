'use client';

import { Card, CardContent, LinearProgress } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type StudentCardProps = {
  student: {
    userId: string;
    userName: string;
    userImageSrc: string;
    points: number;
    progressPercentage: number;
    completedChallenges: number;
    totalChallenges: number;
  };
  classId: number;
};

export const StudentCard = ({ student, classId }: StudentCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-white rounded-xl overflow-hidden border-2 border-gray-200">
      <CardContent className="font-nunito p-6">
        <div className="flex items-center mb-6">
          <Image
            src={student.userImageSrc}
            alt={student.userName}
            width={64}
            height={64}
            className="rounded-full mr-4 border-4 border-[#4ADE80]"
          />
          <h2 className="text-2xl font-bold text-gray-800">
            {student.userName}
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Progress: <span className="text-green-600">{(student.progressPercentage / 100).toFixed(2)}%</span>
            </p>
            <LinearProgress 
              variant="determinate" 
              value={student.progressPercentage} 
              className="h-3 rounded-full"
              style={{ backgroundColor: '#E0E0E0' }}
            />
          </div>
          <p className="text-lg text-gray-700 font-semibold">
            Completed Challenges: <span className="text-blue-600">{student.completedChallenges}</span> / {student.totalChallenges}
          </p>
          <p className="text-lg text-gray-700 font-semibold">
            Points: <span className="text-orange-500">{student.points}</span>
          </p>
        </div>
        <Link href={`/teacher/analytics/${classId}/${student.userId}`} className="block mt-6">
          <Button variant="secondary" className="w-full py-3 text-lg font-bold rounded-full transition duration-300">
            View Detailed Progress
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
