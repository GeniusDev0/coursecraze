import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeaderProps = {
  title: string;
  courseId: number;
  unitId: number;
};

export const Header = ({ title, courseId, unitId }: HeaderProps) => {
  return (
    <div className="sticky top-0 mb-5 flex items-center justify-between border-b-2 bg-white pb-3 text-neutral-400 lg:z-50 lg:mt-[-28px] lg:pt-[28px]">
      <Link href={`/teacher/courses/edit/${courseId}/units/${unitId}`}>
        <Button size="sm" variant="ghost">
          <ArrowLeft className="h-5 w-5 stroke-2 text-neutral-400" />
        </Button>
      </Link>

      <h1 className="text-lg font-bold">{title}</h1>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondaryOutline">
          Preview
        </Button>
      </div>
    </div>
  );
};