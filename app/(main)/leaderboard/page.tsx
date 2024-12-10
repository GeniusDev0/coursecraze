import Image from "next/image";
import { redirect } from "next/navigation";
import HeroImage from '@/public/hero.svg';

import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserProgress } from "@/components/user-progress";
import {
  getUserProgress,
  getUserSubscription,
  getClassLeaderboard,
  getUserProgressByUserId,
} from "@/db/queries";

const LeaderboardPage = async () => {
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();
  
  const [userProgress, userSubscription] = await Promise.all([
    userProgressData,
    userSubscriptionData,
  ]);

  if (!userProgress || !userProgress.activeCourse) redirect("/courses");
  
  // Get the first class the user is in (you might want to add class selection later)
  const userClass = userProgress.classes[0];
  if (!userClass) redirect("/courses");

  const leaderboard = await getClassLeaderboard(userClass.class.id);
  const isPro = !!userSubscription?.isActive;

  // Update the leaderboard mapping to include user progress data
  const leaderboardWithUserData = await Promise.all(leaderboard.map(async (entry) => {
    const userProgressData = await getUserProgressByUserId(entry.userId); // Fetch user progress by userId
    return {
      ...entry,
      userImageSrc: userProgressData?.userImageSrc || "/default-avatar.png", // Handle potential null
      userName: userProgressData?.userName || "Unknown User", // Handle potential null
      points: userProgressData?.points || 0, // Handle potential null
    };
  }));

  // Sort the leaderboard by points in descending order
  const sortedLeaderboard = leaderboardWithUserData.sort((a, b) => b.points - a.points);

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isPro && <Promo />}
        <Quests points={userProgress.points} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <div className="flex items-center gap-4">
            <Image
              src={leaderboard[0]?.class.imageSrc || HeroImage}
              alt="Class"
              height={60}
              width={60}
              className="rounded-md"
            />
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">
                {leaderboard[0]?.class.name || "Class"} Leaderboard
              </h1>
              <p className="text-muted-foreground">
                See where you stand among your classmates
              </p>
            </div>
          </div>

          <Separator className="my-4 h-0.5 rounded-full" />
          
          {sortedLeaderboard.map((entry, i) => (
            <div
              key={entry.userId}
              className="flex w-full items-center rounded-xl p-2 px-4 hover:bg-gray-200/50"
            >
              <p className="mr-4 font-bold text-lime-700">{i + 1}</p>

              <Avatar className="ml-3 mr-6 h-12 w-12 border bg-green-500">
                <AvatarImage
                  src={entry.userImageSrc}
                  className="object-cover"
                />
              </Avatar>

              <p className="flex-1 font-bold text-neutral-800">
                {entry.userName}
              </p>
              <p className="text-muted-foreground">{entry.points} XP</p>
            </div>
          ))}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;
