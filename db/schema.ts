import { relations, type InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { MAX_HEARTS } from "@/constants";

export const userRoleEnum = pgEnum("role", ["STUDENT", "TEACHER"]);

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
  teacherId: text("teacher_id"),
  isPublic: boolean("is_public").notNull().default(false),
  isPaid: boolean("is_paid").notNull().default(false),
  price: integer("price"),
});

export type Course = InferSelectModel<typeof courses> & {
  units?: (Unit & { lessons?: Lesson[] })[];
};
export const coursesRelations = relations(courses, ({ many, one }) => ({
  userProgress: many(userProgress),
  units: many(units),
  teacher: one(userProgress, {
    fields: [courses.teacherId],
    references: [userProgress.userId],
  }),
  classes: many(classes),
}));

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseId: integer("course_id").notNull(),
  order: integer("order").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
});

export type Unit = InferSelectModel<typeof units>;

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id").notNull(),
  order: integer("order").notNull(),
});

export type Lesson = InferSelectModel<typeof lessons>;

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}));

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
});

export type Challenge = InferSelectModel<typeof challenges>;

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export type ChallengeOption = InferSelectModel<typeof challengeOptions>;

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  })
);

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export type ChallengeProgress = InferSelectModel<typeof challengeProgress>;

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  })
);

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.png"),
  activeCourseId: integer("active_course_id"),
  hearts: integer("hearts").notNull().default(MAX_HEARTS),
  points: integer("points").notNull().default(0),
  role: userRoleEnum("role").notNull().default("STUDENT"),
});

export type UserProgress = InferSelectModel<typeof userProgress>;

export const userProgressRelations = relations(userProgress, ({ one, many }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
  classes: many(classStudents),
  taughtCourses: many(courses, { relationName: "teacher" }),
  taughtClasses: many(classes, { relationName: "teacher" }),
}));

export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
});

export type UserSubscription = InferSelectModel<typeof userSubscription>;

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  teacherId: text("teacher_id").notNull(),
  courseId: integer("course_id").notNull(),
  imageSrc: text("image_src").notNull().default("/placeholder-class.png"),
});

export type Class = InferSelectModel<typeof classes> & {
  students: ClassStudent[];
};
export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(userProgress, {
    fields: [classes.teacherId],
    references: [userProgress.userId],
  }),
  course: one(courses, {
    fields: [classes.courseId],
    references: [courses.id],
  }),
  students: many(classStudents),
}));

export const classStudents = pgTable("class_students", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  userId: text("user_id").notNull(),
});

export type ClassStudent = InferSelectModel<typeof classStudents>;

export const classStudentsRelations = relations(classStudents, ({ one }) => ({
  class: one(classes, {
    fields: [classStudents.classId],
    references: [classes.id],
  }),
  student: one(userProgress, {
    fields: [classStudents.userId],
    references: [userProgress.userId],
  }),
}));

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  readTime: integer("read_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Article = InferSelectModel<typeof articles>;
