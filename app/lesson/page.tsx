import { redirect } from "next/navigation";

import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";

import { Quiz } from "./quiz";

const LessonPage = async () => {
  const lessonData = getLesson();
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();

  try {
    const [lesson, userProgress, userSubscription] = await Promise.all([
      lessonData,
      userProgressData,
      userSubscriptionData,
    ]);

    if (!lesson || !userProgress) {
      return redirect("/learn");
    }

    if (!lesson.challenges || lesson.challenges.length === 0) {
      return <div>No challenges found for this lesson. Please contact support at help@coursim.co</div>;
    }

    const initialPercentage =
      (lesson.challenges.filter((challenge) => challenge.completed).length /
        lesson.challenges.length) *
       100;

    return (
      <Quiz
        initialLessonId={lesson.id}
        initialLessonChallenges={lesson.challenges}
        initialHearts={userProgress.hearts}
        initialPercentage={initialPercentage}
        userSubscription={userSubscription}
      />
    );
  } catch (error) {
    return <div>An error occurred. Please try again later or contact support at help@coursim.co</div>;
  }
};

export default LessonPage;
