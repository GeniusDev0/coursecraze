import React from 'react';

type ProgressTimelineProps = {
  unitProgress: {
    unitId: number;
    unitTitle: string;
    lessons: {
      lessonId: number;
      lessonTitle: string;
      completedChallenges: number;
      totalChallenges: number;
    }[];
  }[];
};

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ unitProgress }) => {
  return (
    <div className="flex flex-col space-y-8 p-4">
      {unitProgress.map((unit) => (
        <div key={unit.unitId} className="relative">
          <div className="flex items-center mb-2">
            <div className={`w-8 h-8 rounded-full ${getUnitColor(unit)} flex-shrink-0`} />
            <div className="ml-3 text-lg font-medium">{unit.unitTitle}</div>
          </div>
          <div className="ml-4 border-l-2 border-gray-200 pl-4">
            {unit.lessons.map((lesson) => (
              <div key={lesson.lessonId} className="mb-4 last:mb-0">
                <div className="flex items-center mb-2">
                  <div className={`w-6 h-6 rounded-full ${getLessonColor(lesson)} flex-shrink-0`} />
                  <div className="ml-3 text-sm font-medium">{lesson.lessonTitle}</div>
                </div>
                <div className="ml-8 flex items-center space-x-1">
                  {Array.from({ length: lesson.totalChallenges }).map((_, challengeIndex) => (
                    <div
                      key={challengeIndex}
                      className={`w-3 h-3 rounded-full ${getChallengeColor(challengeIndex < lesson.completedChallenges)}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const getUnitColor = (unit: ProgressTimelineProps['unitProgress'][0]) => {
  const totalChallenges = unit.lessons.reduce((sum, lesson) => sum + lesson.totalChallenges, 0);
  const completedChallenges = unit.lessons.reduce((sum, lesson) => sum + lesson.completedChallenges, 0);
  return completedChallenges === totalChallenges ? 'bg-green-500' : 'bg-gray-300';
};

const getLessonColor = (lesson: ProgressTimelineProps['unitProgress'][0]['lessons'][0]) => {
  return lesson.completedChallenges === lesson.totalChallenges ? 'bg-green-400' : 'bg-gray-200';
};

const getChallengeColor = (completed: boolean) => {
  return completed ? 'bg-green-300' : 'bg-gray-100';
};

export default ProgressTimeline;