import { Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Unit } from "@/db/schema";

type UnitItemProps = {
  unit: Unit;
  courseId: number;
};

export const UnitItem = ({ unit, courseId }: UnitItemProps) => {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{unit.title}</h3>
        <Link href={`/teacher/courses/edit/${courseId}/units/${unit.id}`}>
          <Button size="sm" variant="ghost">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>
      <p className="text-sm text-gray-500">{unit.description}</p>
    </div>
  );
};