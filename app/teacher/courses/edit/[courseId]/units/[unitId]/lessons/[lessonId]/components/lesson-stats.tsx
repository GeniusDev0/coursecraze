import { getChallengesByLessonId, getChallengeOptionsByChallengeId } from "@/db/queries";

interface LessonStatsProps {
  lessonId: number;
}

export const LessonStats = async ({ lessonId }: LessonStatsProps) => {
  const challenges = await getChallengesByLessonId(lessonId);

  const challengesWithOptions = await Promise.all(
    challenges.map(async (challenge) => {
      const options = await getChallengeOptionsByChallengeId(challenge.id);
      return { ...challenge, options };
    })
  );

  const totalChallenges = challenges.length;
  const selectChallenges = challenges.filter(c => c.type === "SELECT").length;
  const assistChallenges = challenges.filter(c => c.type === "ASSIST").length;
  const averageOptionsPerChallenge = challengesWithOptions.reduce((acc, challenge) => acc + challenge.options.length, 0) / totalChallenges || 0;
  const challengesWithAudio = challengesWithOptions.filter(challenge => 
    challenge.options.some(option => option.audioSrc)
  ).length;
  const challengesWithImage = challengesWithOptions.filter(challenge => 
    challenge.options.some(option => option.imageSrc)
  ).length;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Lesson Statistics</h2>
      <ul className="space-y-2">
        <li>Total Challenges: {totalChallenges}</li>
        <li>Select Challenges: {selectChallenges}</li>
        <li>Assist Challenges: {assistChallenges}</li>
        <li>Average Options per Challenge: {averageOptionsPerChallenge.toFixed(2)}</li>
        <li>Challenges with Audio: {challengesWithAudio}</li>
        <li>Challenges with Images: {challengesWithImage}</li>
      </ul>
    </div>
  );
};