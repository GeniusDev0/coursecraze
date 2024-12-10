import { cache } from "react";

import { auth, clerkClient } from "@clerk/nextjs";
import { and, eq, gt, inArray, sql } from "drizzle-orm";

import db from "./drizzle";
import {
  challengeProgress,
  courses,
  units,
  lessons,
  challenges,
  challengeOptions,
  userProgress,
  userSubscription,
  classes,
  classStudents,
  articles,
  type Article,
} from "./schema";


export type CourseJSON = {
  title: string;
  imageSrc: string;
  units: {
    title: string;
    description: string;
    lessons: {
      title: string;
      challenges: {
        type: "SELECT" | "ASSIST";
        question: string;
        options: {
          text: string;
          correct: boolean;
        }[];
      }[];
    }[];
  }[];
};

const DAY_IN_MS = 86_400_000;

export const getCourses = cache(async () => {
  const { userId } = auth();

  if (!userId) return [];

  const coursesData = await db.query.courses.findMany({
    where: eq(courses.teacherId, userId), 
  });

  const studentCoursesData = await db.query.classStudents.findMany({
    where: eq(classStudents.userId, userId),
    with: {
      class: {
        with: {
          course: true, 
        },
      },
    },
  });

  return [...coursesData, ...studentCoursesData.map(cs => cs.class.course)];
});
export const getPublicCourses = cache(async () => {
  const data = await db.query.courses.findMany({
    where: eq(courses.isPublic, true),
  });

  return data;
});

export const getPublicFreeCourses = cache(async () => {
  const data = await db.query.courses.findMany({
    where: and(
      eq(courses.isPublic, true),
      eq(courses.price, 0)
    ),
  });

  return data;
});

export const getPublicPaidCourses = cache(async () => {
  const data = await db.query.courses.findMany({
    where: and(
      eq(courses.isPublic, true),
      gt(courses.price, 0)
    ),
  });

  return data;
});

export const getUnitAmountInCourse = cache(async (courseId: number) => {
  const data = await db.query.units.findMany({
    where: eq(units.courseId, courseId),
  });

  return data.length;
});

export const getLessonById = cache(async (lessonId: number) => {
  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  });

  return data;
});

export const getChallengesByLessonId = cache(async (lessonId: number) => {
  const data = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
    orderBy: (challenges, { asc }) => [asc(challenges.order)],
  });

  return data;
});

export const getChallengeOptionsByChallengeId = cache(async (challengeId: number) => {
  const data = await db.query.challengeOptions.findMany({
    where: eq(challengeOptions.challengeId, challengeId),
  });

  return data;
});

export const getUserProgress = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
      classes: {
        with: {
          class: {
            with: {
              course: true,
              teacher: true,
            },
          },
        },
      },
    },
  });

  return data;
});

export const getUnits = cache(async () => {
  const { userId } = auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) return [];

  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId),
    orderBy: (units, { asc }) => [asc(units.order)],
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0)
        return { ...lesson, completed: false };

      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        );
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
            with: {
              challenges: {
                orderBy: (challenges, { asc }) => [asc(challenges.order)],
                with: {
                  challengeOptions: true,
                },
              },
            },
          },
        },
      },
      teacher: true,
      classes: true,
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const { userId } = auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) return null;

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return (
          !challenge.challengeProgress ||
          challenge.challengeProgress.length === 0 ||
          challenge.challengeProgress.some((progress) => !progress.completed)
        );
      });
    });

  // If no uncompleted lesson is found, return the first lesson of the course
  const firstLesson = unitsInActiveCourse[0]?.lessons[0];

  return {
    activeLesson: firstUncompletedLesson || firstLesson,
    activeLessonId: firstUncompletedLesson?.id || firstLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return null;
  }

  let lessonId = id;

  if (!lessonId) {
    const courseProgress = await getCourseProgress();
    lessonId = courseProgress?.activeLessonId;
  }

  if (!lessonId) {
    return null;
  }

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: true,
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!lesson) {
    return null;
  }

  return {
    ...lesson,
    challenges: lesson.challenges.map((challenge) => ({
      ...challenge,
      completed: challenge.challengeProgress.some((progress) => progress.completed),
    })),
  };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) return 0;

  const lesson = await getLesson(courseProgress?.activeLessonId);

  if (!lesson) return 0;

  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );

  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );

  return percentage;
});

export const getUserSubscription = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, userId),
  });

  if (!data) return null;

  const isActive =
    data.stripePriceId &&
    data.stripeCurrentPeriodEnd?.getTime() + DAY_IN_MS > Date.now();

  return {
    ...data,
    isActive: !!isActive,
  };
});

export const getTopTenUsers = cache(async () => {
  const { userId } = auth();

  if (!userId) return [];

  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });

  return data;
});

export const getTeacherProgress = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

  if (!data) return null;

  // Fetch taught courses separately
  const taughtCourses = await db.query.courses.findMany({
    where: eq(courses.teacherId, userId),
  });

  // Fetch taught classes separately
  const taughtClasses = await getTeacherClasses(userId);

  return {
    ...data,
    taughtCourses,
    taughtClasses,
  };
});

export const getClassById = cache(async (classId: number) => {
  console.log(`[getClassById] Fetching class with ID: ${classId}`);
  
  const data = await db.query.classes.findFirst({
    where: eq(classes.id, classId),
    with: {
      teacher: true,
      course: true,
      students: {
        with: {
          student: true,
        },
      },
    },
  });

  console.log(`[getClassById] Raw data fetched:`, JSON.stringify(data, null, 2));

  if (data) {
    console.log(`[getClassById] Class found. Student count: ${data.students.length}`);
    
    const studentsWithEmail = await Promise.all(
      data.students.map(async (student, index) => {
        console.log(`[getClassById] Processing student:`, student);
        try {
          const clerkUser = await clerkClient.users.getUser(student.student.userId);
          console.log(`[getClassById] Clerk user fetched for student:`, clerkUser.id);
          return {
            ...student,
            student: {
              ...student.student,
              email: clerkUser.emailAddresses[0]?.emailAddress || 'No email found',
            },
          };
        } catch (error) {
          console.error(`[getClassById] Error fetching Clerk user for student ${index + 1}:`, error);
          return {
            ...student,
            student: {
              ...student.student,
            },
          };
        }
      })
    );

    console.log(`[getClassById] Processed students with email:`, JSON.stringify(studentsWithEmail, null, 2));

    return {
      ...data,
      students: studentsWithEmail,
    };
  }

  console.log(`[getClassById] No class found with ID: ${classId}`);
  return null;
});

export const getTeacherById = cache(async (teacherId: string) => {
  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, teacherId),
    with: {
      activeCourse: true,
      taughtCourses: true,
      taughtClasses: true,
    },
  });

  return data;
});

export const getTeacherClasses = cache(async (teacherId: string) => {
  const data = await db.query.classes.findMany({
    where: eq(classes.teacherId, teacherId),
    with: {
      course: true,
      students: {
        with: {
          student: true,
        },
      },
    },
  });

  return data;
});

export const getStudentClasses = cache(async () => {
  const { userId } = auth();

  if (!userId) return [];

  const data = await db.query.classStudents.findMany({
    where: eq(classStudents.userId, userId),
    with: {
      class: {
        with: {
          teacher: true,
          course: true,
        },
      },
    },
  });

  return data;
});

export const setUserRole = cache(async (userId: string, role: "STUDENT" | "TEACHER") => {
  // First, try to find the user
  let user = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (!user) {
    const [newUser] = await db.insert(userProgress)
      .values({
        userId,
        role,
        // Add other default values as needed
      })
      .returning();
    user = newUser;
  } else {
    // If user exists, update the role
    const [updatedUser] = await db
      .update(userProgress)
      .set({ role })
      .where(eq(userProgress.userId, userId))
      .returning();
    user = updatedUser;
  }

  if (!user) {
    return null;
  }

  return {
    userId: user.userId,
    role: user.role,
  };
});

export const createCourseFromJSON = cache(async (courseJSON: CourseJSON, teacherId: string, isPublic: boolean, price: number) => {
  // Create the course
  const [createdCourse] = await db.insert(courses).values({
    title: courseJSON.title,
    imageSrc: courseJSON.imageSrc,
    teacherId: teacherId,
    isPublic: isPublic,
    price: price,
  }).returning();

  // Create units
  for (let i = 0; i < courseJSON.units.length; i++) {
    const unit = courseJSON.units[i];
    const [createdUnit] = await db.insert(units).values({
      title: unit.title,
      description: unit.description,
      courseId: createdCourse.id,
      order: i + 1,
    }).returning();

    // Create lessons
    for (let j = 0; j < unit.lessons.length; j++) {
      const lesson = unit.lessons[j];
      const [createdLesson] = await db.insert(lessons).values({
        title: lesson.title,
        unitId: createdUnit.id,
        order: j + 1,
      }).returning();

      // Create challenges
      if (lesson.challenges && lesson.challenges.length > 0) {
        for (let k = 0; k < lesson.challenges.length; k++) {
          const challenge = lesson.challenges[k];
          const [createdChallenge] = await db.insert(challenges).values({
            lessonId: createdLesson.id,
            type: challenge.type,
            question: challenge.question,
            order: k + 1,
          }).returning();

          // Create challenge options for both SELECT and ASSIST types
          if (challenge.options && challenge.options.length > 0) {
            for (const option of challenge.options) {
              await db.insert(challengeOptions).values({
                challengeId: createdChallenge.id,
                text: option.text,
                correct: option.correct,
              });
            }
          }
        }
      }
    }
  }

  return createdCourse.id;
});

export const updateLesson = async (lessonId: number, title: string) => {
  return await db
    .update(lessons)
    .set({ title })
    .where(eq(lessons.id, lessonId))
    .returning();
};

export const updateChallenge = async (challengeId: number, data: Partial<typeof challenges.$inferInsert>) => {
  return await db
    .update(challenges)
    .set(data)
    .where(eq(challenges.id, challengeId))
    .returning();
};

export const createChallenge = async (data: typeof challenges.$inferInsert) => {
  return await db.insert(challenges).values(data).returning();
};

export const deleteChallenge = async (challengeId: number) => {
  return await db.delete(challenges).where(eq(challenges.id, challengeId));
};

export const updateChallengeOption = async (optionId: number, data: Partial<typeof challengeOptions.$inferInsert>) => {
  return await db
    .update(challengeOptions)
    .set(data)
    .where(eq(challengeOptions.id, optionId))
    .returning();
};

export const createChallengeOption = async (data: typeof challengeOptions.$inferInsert) => {
  return await db.insert(challengeOptions).values(data).returning();
};

export const deleteChallengeOption = async (optionId: number) => {
  return await db.delete(challengeOptions).where(eq(challengeOptions.id, optionId));
};

export const setUserActiveCourse = cache(async (userId: string, courseId: number) => {
  const updatedUser = await db
    .update(userProgress)
    .set({ activeCourseId: courseId })
    .where(eq(userProgress.userId, userId))
    .returning();

  return updatedUser[0];
});

export const updateClass = cache(async (classId: number, data: Partial<typeof classes.$inferInsert>) => {
  return await db
    .update(classes)
    .set(data)
    .where(eq(classes.id, classId))
    .returning();
});

export const getUserRole = cache(async (userId: string) => {
  const user = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: { role: true },
  });

  return user?.role || null;
});

export const deleteClass = cache(async (classId: number) => {
  try {
    // First, delete all associated class students
    await db.delete(classStudents).where(eq(classStudents.classId, classId));

    // Then, delete the class itself
    const deletedClass = await db.delete(classes)
      .where(eq(classes.id, classId))
      .returning();

    return deletedClass[0] || null;
  } catch (error) {
    console.error("Error deleting class:", error);
    return null;
  }
});

export const createClass = cache(async ({ 
  name, 
  teacherId, 
  courseId, 
  studentIds 
}: { 
  name: string; 
  teacherId: string; 
  courseId: number; 
  studentIds: string[] 
}) => {
  // Create the class
  const [newClass] = await db.insert(classes).values({
    name,
    teacherId,
    courseId,
  }).returning();

  // Verify that all studentIds correspond to actual students
  const validStudents = await db
    .select({ userId: userProgress.userId })
    .from(userProgress)
    .where(
      and(
        inArray(userProgress.userId, studentIds),
        eq(userProgress.role, 'STUDENT')
      )
    );

  const validStudentIds = validStudents.map(student => student.userId);

  // Add only valid students to the class
  if (validStudentIds.length > 0) {
    await db.insert(classStudents).values(
      validStudentIds.map(studentId => ({
        classId: newClass.id,
        userId: studentId,
      }))
    );
  }

  // Fetch the created class with its students
  const classWithStudents = await db.query.classes.findFirst({
    where: eq(classes.id, newClass.id),
    with: {
      students: {
        with: {
          student: true,
        },
      },
    },
  });

  return classWithStudents;
});

export const getTeacherClassesWithStats = cache(async (teacherId: string) => {
  const classesQuery = await db.query.classes.findMany({
    where: eq(classes.teacherId, teacherId),
    with: {
      course: true,
      students: {
        with: {
          student: true,
        },
      },
    },
  });

  const classesWithStats = await Promise.all(classesQuery.map(async (classItem) => {
    const studentCount = classItem.students.length;
    const studentIds = classItem.students.map(s => s.student.userId);
    
    const studentProgress = await db.select({
      userId: userProgress.userId,
      points: userProgress.points,
    })
    .from(userProgress)
    .where(inArray(userProgress.userId, studentIds));

    const totalProgress = studentProgress.reduce((sum, student) => sum + student.points, 0);
    const averageProgress = studentCount > 0 ? totalProgress / studentCount : 0;

    return {
      ...classItem,
      studentCount,
      averageProgress,
    };
  }));

  return classesWithStats;
});

// Get student progress in a specific class
export const getStudentProgressInClass = cache(async (classId: number) => {
  const classData = await db.query.classes.findFirst({
    where: eq(classes.id, classId),
    with: {
      course: true,
      students: {
        with: {
          student: true,
        },
      },
    },
  });

  if (!classData || !classData.course) return [];

  const courseId = classData.course.id;

  const studentProgress = await Promise.all(classData.students.map(async (studentRelation) => {
    const student = studentRelation.student;
    if (!student) {
      console.error('Student data is missing');
      return null;
    }

    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, student.userId),
    });

    const completedChallengesCount = await db.select({ count: sql<number>`count(*)` })
      .from(challengeProgress)
      .innerJoin(challenges, eq(challengeProgress.challengeId, challenges.id))
      .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
      .innerJoin(units, eq(lessons.unitId, units.id))
      .where(and(
        eq(challengeProgress.userId, student.userId),
        eq(challengeProgress.completed, true),
        eq(units.courseId, courseId)
      ))
      .execute();

    const totalChallengesCount = await db.select({ count: sql<number>`count(*)` })
      .from(challenges)
      .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
      .innerJoin(units, eq(lessons.unitId, units.id))
      .where(eq(units.courseId, courseId))
      .execute();

    const completedChallenges = completedChallengesCount[0]?.count || 0;
    const totalChallenges = totalChallengesCount[0]?.count || 0;
    const progressPercentage = totalChallenges > 0 
      ? (completedChallenges / totalChallenges) * 100 
      : 0;

    return {
      userId: student.userId,
      userName: student.userName,
      userImageSrc: student.userImageSrc,
      points: progress?.points || 0,
      progressPercentage,
      completedChallenges,
      totalChallenges,
    };
  }));

  return studentProgress.filter((progress): progress is NonNullable<typeof progress> => progress !== null);
});

// Get detailed progress for a specific student in a class
export const getStudentDetailedProgress = cache(async (classId: number, studentId: string) => {
  // First, get the class and its basic course information
  const classData = await db.query.classes.findFirst({
    where: eq(classes.id, classId),
    with: {
      course: true,
    },
  });

  if (!classData || !classData.course) return null;

  // Then, fetch the units without the isCompleted field
  const unitsData = await db.query.units.findMany({
    where: eq(units.courseId, classData.course.id),
    orderBy: (units, { asc }) => [asc(units.order)],
    columns: {
      id: true,
      title: true,
      description: true,
      order: true,
      courseId: true,
    },
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
      },
    },
  });

  const studentProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, studentId),
  });

  const unitProgress = await Promise.all(unitsData.map(async (unit) => {
    const lessonProgress = await Promise.all(unit.lessons.map(async (lesson) => {
      const completedChallenges = await db.select({ count: sql<number>`count(*)` })
        .from(challengeProgress)
        .innerJoin(challenges, eq(challengeProgress.challengeId, challenges.id))
        .where(and(
          eq(challengeProgress.userId, studentId),
          eq(challengeProgress.completed, true),
          eq(challenges.lessonId, lesson.id)
        ))
        .execute();

      const totalChallenges = await db.select({ count: sql<number>`count(*)` })
        .from(challenges)
        .where(eq(challenges.lessonId, lesson.id))
        .execute();

      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        completedChallenges: completedChallenges[0]?.count || 0,
        totalChallenges: totalChallenges[0]?.count || 0,
      };
    }));

    return {
      unitId: unit.id,
      unitTitle: unit.title,
      lessons: lessonProgress,
    };
  }));

  return {
    studentId,
    studentName: studentProgress?.userName || "Unknown",
    studentImageSrc: studentProgress?.userImageSrc || "/default-avatar.png",
    points: studentProgress?.points || 0,
    unitProgress,
  };
});

export async function getArticles(): Promise<Article[]> {
  return db.select().from(articles).orderBy(articles.createdAt);
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const result = await db.select().from(articles).where(eq(articles.id, id));
  return result[0];
}

export async function createArticle(article: Omit<Article, "id" | "createdAt">): Promise<Article> {
  const [newArticle] = await db.insert(articles).values(article).returning();
  return newArticle;
}

export const getClassLeaderboard = cache(async (classId: number) => {
  const data = await db.query.classStudents.findMany({
    where: eq(classStudents.classId, classId),
    with: {
      class: {
        columns: {
          name: true,
          imageSrc: true,
        }
      }
    },
    orderBy: (classStudents, { desc }) => [desc(classStudents.userId)],
  });

  return data;
});

export const getUserProgressByUserId = cache(async (userId: string) => {
  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  return data;
});