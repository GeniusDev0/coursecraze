import { Unit } from "@/db/schema";

import { UnitItem } from "./unit-item";

type UnitListProps = {
  units: Unit[];
  courseId: number;
};

export const UnitList = ({ units, courseId }: UnitListProps) => {
  return (
    <div className="space-y-4">
      {units.map((unit) => (
        <UnitItem key={unit.id} unit={unit} courseId={courseId} />
      ))}
    </div>
  );
};