import { readFileSync } from "node:fs";

const sql = readFileSync("seeds/complete-content.sql", "utf8");

const subjects = new Map([
  [1, "kokugo"],
  [2, "sugaku"],
  [3, "eigo"],
  [4, "rika"],
  [5, "shakai"],
]);

const topics = new Map();
const topicRe =
  /INSERT INTO topics \(id, subject_id, slug, name, "order"\) VALUES \((\d+), (\d+), '((?:''|[^'])*)', '((?:''|[^'])*)', (\d+)\);/g;

for (const match of sql.matchAll(topicRe)) {
  const [, idRaw, subjectIdRaw, slug, name, orderRaw] = match;
  const id = Number(idRaw);
  topics.set(id, {
    id,
    subjectId: Number(subjectIdRaw),
    slug,
    name: name.replaceAll("''", "'"),
    order: Number(orderRaw),
    questions: [],
  });
}

const questionRe =
  /INSERT INTO questions \(topic_id, type, question_text, choices, answer, explanation, difficulty\) VALUES \((\d+), '([^']+)', '((?:''|[^'])*)', ('(?:''|[^'])*'|NULL), '((?:''|[^'])*)', '((?:''|[^'])*)', (\d+)\);/g;

for (const match of sql.matchAll(questionRe)) {
  const [, topicIdRaw, type, questionText, choicesRaw, answerRaw, , difficultyRaw] = match;
  const topic = topics.get(Number(topicIdRaw));
  if (!topic) continue;
  const choices =
    choicesRaw === "NULL"
      ? null
      : JSON.parse(choicesRaw.slice(1, -1).replaceAll("''", "'"));
  topic.questions.push({
    type,
    questionText: questionText.replaceAll("''", "'"),
    choices,
    answer: answerRaw.replaceAll("''", "'"),
    difficulty: Number(difficultyRaw),
  });
}

const problems = [];

if (topics.size !== 25) {
  problems.push(`expected 25 topics, got ${topics.size}`);
}

for (const [subjectId, subjectSlug] of subjects) {
  const subjectTopics = [...topics.values()]
    .filter((topic) => topic.subjectId === subjectId)
    .sort((a, b) => a.order - b.order);
  if (subjectTopics.length !== 5) {
    problems.push(`${subjectSlug}: expected 5 topics, got ${subjectTopics.length}`);
  }
  const orders = new Set(subjectTopics.map((topic) => topic.order));
  for (let order = 1; order <= 5; order += 1) {
    if (!orders.has(order)) problems.push(`${subjectSlug}: missing order ${order}`);
  }
  for (const topic of subjectTopics) {
    const expectedSlug = `${subjectSlug}-${topic.order}`;
    if (topic.slug !== expectedSlug) {
      problems.push(`${topic.name}: expected slug ${expectedSlug}, got ${topic.slug}`);
    }
  }
}

for (const topic of topics.values()) {
  if (topic.questions.length < 8) {
    problems.push(`${topic.slug}: expected at least 8 questions, got ${topic.questions.length}`);
  }
  for (const [index, question] of topic.questions.entries()) {
    const label = `${topic.slug} q${index + 1}`;
    if (question.type !== "multi_choice") {
      problems.push(`${label}: expected multi_choice, got ${question.type}`);
    }
    if (!Array.isArray(question.choices) || question.choices.length !== 3) {
      problems.push(`${label}: expected exactly 3 choices`);
    } else if (!question.choices.includes(question.answer)) {
      problems.push(`${label}: answer is not included in choices`);
    }
    if (![1, 2, 3].includes(question.difficulty)) {
      problems.push(`${label}: invalid difficulty ${question.difficulty}`);
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(
  `Content seed OK: ${topics.size} topics, ${[...topics.values()].reduce(
    (sum, topic) => sum + topic.questions.length,
    0,
  )} questions`,
);
