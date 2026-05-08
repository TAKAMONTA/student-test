import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  purchasedAt: integer("purchased_at", { mode: "timestamp_ms" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  textbookPublisher: text("textbook_publisher"),
  testDate: text("test_date"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
});

export const topics = sqliteTable("topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  curriculumRef: text("curriculum_ref"),
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id),
  contentMd: text("content_md").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull().default(5),
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id),
  type: text("type", { enum: ["multi_choice", "short_answer", "numeric"] }).notNull(),
  questionText: text("question_text").notNull(),
  choices: text("choices", { mode: "json" }).$type<string[] | null>(),
  answer: text("answer").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: integer("difficulty").notNull().default(1),
});

export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  userAnswer: text("user_answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  attemptedAt: integer("attempted_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const topicProgress = sqliteTable(
  "topic_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id),
    masteryLevel: integer("mastery_level").notNull().default(0),
    consecutiveCorrect: integer("consecutive_correct").notNull().default(0),
    lastStudiedAt: integer("last_studied_at", { mode: "timestamp_ms" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.topicId] }),
  })
);

export const aiChats = sqliteTable("ai_chats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  topicId: integer("topic_id").references(() => topics.id),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  tokensIn: integer("tokens_in").notNull().default(0),
  tokensOut: integer("tokens_out").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const mockExams = sqliteTable("mock_exams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
  score: integer("score"),
});

export const mockExamItems = sqliteTable(
  "mock_exam_items",
  {
    examId: integer("exam_id")
      .notNull()
      .references(() => mockExams.id),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    userAnswer: text("user_answer"),
    isCorrect: integer("is_correct", { mode: "boolean" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.examId, t.questionId] }),
  })
);

// V2 reservation: friend referral feature. Empty in V1.
export const referrals = sqliteTable("referrals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => users.id),
  inviteeId: text("invitee_id").references(() => users.id),
  giftedSubjectId: integer("gifted_subject_id").references(() => subjects.id),
  redeemedAt: integer("redeemed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});
