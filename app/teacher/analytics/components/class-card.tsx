import { Card, CardContent } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Class } from "@/db/schema";

type ClassCardProps = {
  classItem: Class & {
    studentCount: number;
    averageProgress: number;
  };
};

export const ClassCard = ({ classItem }: ClassCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-white rounded-xl overflow-hidden border-2 border-gray-200">
      <CardContent className="font-nunito p-6">
        <div className="flex items-center mb-6">
          <Image
            src={classItem.imageSrc}
            alt={classItem.name}
            width={64}
            height={64}
            className="rounded-full mr-4 border-4 border-[#4ADE80]"
          />
          <h2 className="text-2xl font-bold text-gray-800">
            {classItem.name}
          </h2>
        </div>
        <div className="space-y-3">
          <p className="text-lg text-gray-700 font-semibold">
            Students: <span className="text-blue-600">{classItem.studentCount}</span>
          </p>
          <p className="text-lg text-gray-700 font-semibold">
            Average Progress: <span className="text-green-600">{(classItem.averageProgress).toFixed(2)}%</span>
          </p>
        </div>
        <Link href={`/teacher/analytics/${classItem.id}`} className="block mt-6">
          <Button variant="secondary" className="w-full py-3 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-full transition duration-300">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
