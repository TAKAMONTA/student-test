import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type SeedTopic = {
  topicName: string;
  lesson: { contentMd: string; estimatedMinutes: number };
  questions: Array<{
    type: string;
    questionText: string;
    choices: string[] | null;
    answer: string;
    explanation: string;
    difficulty: number;
  }>;
};

type SeedSubject = {
  subjectSlug: string;
  subjectName: string;
  topics: SeedTopic[];
};

const SUBJECT_ID: Record<string, number> = {
  kokugo: 1,
  sugaku: 2,
  eigo: 3,
  rika: 4,
  shakai: 5,
};

const q = (s: string) => "'" + s.replace(/'/g, "''") + "'";

const data = JSON.parse(readFileSync(join(process.cwd(), "seeds/content.json"), "utf8")) as SeedSubject[];

const lines: string[] = [];
let topicId = 0;

for (const subject of data) {
  const subjectId = SUBJECT_ID[subject.subjectSlug];
  if (!subjectId) throw new Error(`No subject id for ${subject.subjectSlug}`);

  let order = 0;
  for (const topic of subject.topics) {
    topicId += 1;
    order += 1;
    const topicSlug = `${subject.subjectSlug}-${order}`;
    lines.push(
      `INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (${topicId}, ${subjectId}, ${q(topicSlug)}, ${q(topic.topicName)}, ${order});`,
    );
    lines.push(
      `INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (${topicId}, ${q(topic.lesson.contentMd)}, ${topic.lesson.estimatedMinutes});`,
    );
    for (const qst of topic.questions) {
      const choicesJson = qst.choices === null ? "NULL" : q(JSON.stringify(qst.choices));
      const type = qst.type === "multi_choice" || qst.type === "short_answer" || qst.type === "numeric"
        ? qst.type
        : "short_answer";
      lines.push(
        `INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (${topicId}, ${q(type)}, ${q(qst.questionText)}, ${choicesJson}, ${q(qst.answer)}, ${q(qst.explanation)}, ${qst.difficulty});`,
      );
    }
  }
}

writeFileSync(join(process.cwd(), "seeds/insert.sql"), lines.join("\n") + "\n");
console.log(`Wrote seeds/insert.sql with ${lines.length} statements (topics: ${topicId}).`);
