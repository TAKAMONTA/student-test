import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { SUBJECT_DOMAINS, FewShot, SubjectDomain } from "./curriculum-domain";

const client = new Anthropic({ apiKey: process.env["ANTHROPIC_API_KEY"] });
const GENERATOR_MODEL = "claude-sonnet-4-6";
const JUDGE_MODEL = "claude-opus-4-5";

type Topic = {
  id: number;
  subject_id: number;
  slug: string;
  name: string;
};

type GeneratedQuestion = {
  questionText: string;
  choices: string[];
  answer: string;
  explanation: string;
  difficulty: number;
};

type GeneratedTopic = {
  lesson: { contentMd: string; estimatedMinutes: number };
  questions: GeneratedQuestion[];
};

type TopicReport = {
  topicId: number;
  topicSlug: string;
  topicName: string;
  subjectName: string;
  finalScore: number;
  retries: number;
  rejections: string[];
  questionCount: number;
  sampleQuestion: string;
};

const SLUG_TO_SUBJECT_DOMAIN: Record<string, SubjectDomain> = {
  kokugo: SUBJECT_DOMAINS.kokugo!,
  sugaku: SUBJECT_DOMAINS.sugaku!,
  eigo: SUBJECT_DOMAINS.eigo!,
  rika: SUBJECT_DOMAINS.rika!,
  shakai: SUBJECT_DOMAINS.shakai!,
};

function subjectDomainFromTopicSlug(topicSlug: string): SubjectDomain | null {
  const subjectSlug = topicSlug.split("-")[0]!;
  return SLUG_TO_SUBJECT_DOMAIN[subjectSlug] ?? null;
}

function fetchTopics(): Topic[] {
  const out = execSync(
    `npx wrangler d1 execute chu1-testkit-db --remote --json --command="SELECT id, subject_id, slug, name FROM topics ORDER BY id;"`,
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out) as Array<{ results: Topic[] }>;
  return parsed[0]!.results;
}

function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fenceMatch?.[1]) return fenceMatch[1];
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object found");
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i]!;
    if (escape) { escape = false; continue; }
    if (c === "\\") { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  throw new Error("Unterminated JSON");
}

function formatExamples(examples: FewShot[]): string {
  return examples
    .map(
      (ex, i) => `例${i + 1}（難易度${ex.difficulty}）
問題: ${ex.q}
選択肢: ${JSON.stringify(ex.choices)}
正解: ${ex.answer}
解説: ${ex.explanation}`,
    )
    .join("\n\n");
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, "")
    .replace(/[。、,.，・「」『』（）()[\]【】]/g, "");
}

function isSingleDigitPositiveIntegerAnswer(answer: string): boolean {
  const normalized = answer.replace(/[＋+]/g, "").replace(/\s+/g, "");
  return /^[1-9]$/.test(normalized) || /^x=?[1-9]$/.test(normalized);
}

function hasMathComplexitySignal(questionText: string): boolean {
  return /[-−]|\/|分数|小数|累乗|乗|除|割|絶対値|\||\^|²|³|\(|\)|（|）|素因数|気温|標高|上下|差/.test(
    questionText,
  );
}

function isTrivialEnglishPattern(q: GeneratedQuestion): boolean {
  const text = `${q.questionText} ${q.choices.join(" ")}`;
  const onlyBeChoices = q.choices.every((choice) => /^(am|is|are)$/i.test(choice.trim()));
  const hasOnlyBasicFrame = /\b(I am|You are|This is)\b/i.test(text);
  const hasAddedSkill = /not|n't|Are you|Is this|from|my|your|new|old|大文字|小文字|順|並|疑問|否定|答え|会話|語順/i.test(
    text,
  );
  return onlyBeChoices || (hasOnlyBasicFrame && !hasAddedSkill);
}

function questionCategory(subjectSlug: string, q: GeneratedQuestion): string {
  const text = normalizeText(`${q.questionText}${q.answer}${q.explanation}`);
  if (subjectSlug === "sugaku") {
    if (/絶対値|\|/.test(text)) return "absolute-value";
    if (/大小|大きい|小さい|不等号|順/.test(text)) return "comparison";
    if (/素因数|素数/.test(text)) return "prime-factorization";
    if (/累乗|指数|2乗|3乗|\^|²|³/.test(text)) return "powers";
    if (/気温|標高|利益|損|上が|下が|文章/.test(text)) return "signed-context";
    if (/乗|除|割|÷|×/.test(text)) return "multiplication-division";
    if (/加|減|\+|-|−/.test(text)) return "addition-subtraction";
    return "calculation";
  }
  if (subjectSlug === "eigo") {
    if (/大文字|小文字|capital|アルファベット|順|母音|子音/.test(text)) return "alphabet";
    if (/語順|並べ|ならべ/.test(text)) return "word-order";
    if (/疑問|areyou|isthis|\?/.test(text)) return "question";
    if (/否定|not|n't/.test(text)) return "negative";
    if (/意味|日本文|和訳/.test(text)) return "meaning";
    if (/会話|答え|yes|no/.test(text)) return "response";
    return "be-verb";
  }
  if (subjectSlug === "rika") {
    if (/ルーペ|顕微鏡|観察/.test(text)) return "observation";
    if (/子房|胚珠|おしべ|めしべ|花/.test(text)) return "flower";
    if (/被子|裸子/.test(text)) return "angiosperm-gymnosperm";
    if (/単子葉|双子葉|葉脈|根/.test(text)) return "monocot-dicot";
    return "biology-basic";
  }
  if (subjectSlug === "shakai") {
    if (/大陸|大洋/.test(text)) return "continents-oceans";
    if (/緯度|経度|赤道|本初子午線/.test(text)) return "latitude-longitude";
    if (/州|アジア|ヨーロッパ|アフリカ|オセアニア/.test(text)) return "world-regions";
    if (/時差|時間|15度/.test(text)) return "time-difference";
    if (/地図|投影/.test(text)) return "map";
    return "geography-basic";
  }
  if (/漢字|読み|熟語|対義|類義/.test(text)) return "kanji-vocab";
  if (/接続語|しかし|そのため|つまり/.test(text)) return "connector";
  if (/指示語|それ|これ|あれ/.test(text)) return "reference";
  if (/段落|筆者|主張|理由|根拠/.test(text)) return "expository-reading";
  if (/物語|登場人物|気持ち|場面|情景/.test(text)) return "narrative-reading";
  return "kokugo-basic";
}

function validateGeneratedTopic(domain: SubjectDomain, generated: GeneratedTopic): string[] {
  const problems: string[] = [];
  const subjectSlug = domain.slug;

  if (generated.questions.length !== 8) {
    problems.push(`expected 8 questions, got ${generated.questions.length}`);
  }

  const normalizedQuestions = new Set<string>();
  let trivialMathCount = 0;
  let trivialEnglishCount = 0;
  const categoryCounts = new Map<string, number>();

  for (const [index, q] of generated.questions.entries()) {
    const label = `Q${index + 1}`;
    const normalizedQuestion = normalizeText(q.questionText);
    if (normalizedQuestions.has(normalizedQuestion)) {
      problems.push(`${label}: duplicate question text`);
    }
    normalizedQuestions.add(normalizedQuestion);

    if (!Array.isArray(q.choices) || q.choices.length !== 3) {
      problems.push(`${label}: choices must be exactly 3`);
      continue;
    }
    if (new Set(q.choices.map(normalizeText)).size !== 3) {
      problems.push(`${label}: duplicate or near-duplicate choices`);
    }
    if (!q.choices.includes(q.answer)) {
      problems.push(`${label}: answer is not an exact choice`);
    }
    if (![1, 2, 3].includes(q.difficulty)) {
      problems.push(`${label}: difficulty must be 1, 2, or 3`);
    }

    if (
      subjectSlug === "sugaku" &&
      isSingleDigitPositiveIntegerAnswer(q.answer) &&
      !hasMathComplexitySignal(q.questionText)
    ) {
      trivialMathCount++;
    }
    if (subjectSlug === "eigo" && isTrivialEnglishPattern(q)) {
      trivialEnglishCount++;
    }

    const category = questionCategory(subjectSlug, q);
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  const difficulty3Count = generated.questions.filter((q) => q.difficulty === 3).length;
  const difficulty2Count = generated.questions.filter((q) => q.difficulty === 2).length;
  if (difficulty3Count < 1) problems.push("no difficulty 3 question");
  if (difficulty2Count < 2) problems.push("fewer than 2 difficulty 2 questions");
  if (trivialMathCount > 0) {
    problems.push(`${trivialMathCount} math question(s) have a one-digit positive answer with no negative/fraction/power/context signal`);
  }
  if (trivialEnglishCount >= 3) {
    problems.push(`${trivialEnglishCount} English question(s) are only basic I am/You are/This is or am/is/are drills`);
  }

  const categoryCount = categoryCounts.size;
  const maxSameCategory = Math.max(...categoryCounts.values(), 0);
  if (generated.questions.length >= 8 && categoryCount < 4) {
    problems.push(`insufficient sub-skill diversity: ${categoryCount} categories`);
  }
  if (maxSameCategory > 4) {
    problems.push(`too many questions in one sub-skill category: ${maxSameCategory}`);
  }

  return problems;
}

async function generate(
  domain: SubjectDomain,
  topicName: string,
  topicSlug: string,
  isMidterm: boolean,
  attempt = 1,
): Promise<GeneratedTopic> {
  const scopeNote = isMidterm
    ? "この単元は中間テストの出題範囲です。中間テスト本番に出る難易度・形式で問題を作ってください。"
    : "この単元は中間テスト範囲外ですが、期末・学年末テストや日常学習用の練習問題として、中1のテスト本番レベルで作ってください。";

  const prompt = `あなたは中学1年生の${domain.name}の指導経験豊富な教師です。
これから、中1の単元「${topicName}」の学習コンテンツ（解説+ドリル問題）を作成します。

${scopeNote}

【教科全体の出題スタイル・難易度バー】
${domain.styleNotes}

【中1${domain.name}テスト本番レベルの例題（このレベル感で作る）】
${formatExamples(domain.examples)}

【絶対に守ってほしい品質基準】
1. 小学校レベルの易しすぎる問題（例: 「3+5=」「I am a boy. → I am の意味は？」）を作らない
2. 難易度配分は 基礎4：標準3：応用1（difficulty 1/2/3）
3. 問題文は実テストの言い回し（「次の〜のうち、正しいものを選びなさい」「（　）に入る最も適切な〜」など）
4. すべて3択。answer は choices の中の文字列と完全一致。
5. 3択で易しくなりすぎる分、誤答（残り2つ）は「典型的なミス」から作る。明らかに変な選択肢、長さや形式で正解が透ける選択肢は禁止。
6. 単元固有の用語・公式・概念を必ず1つ以上問う
7. 解説は「なぜそれが正解か」を中1にわかる言葉で具体的に
8. 8問の中で同じ小技能だけを繰り返さない。最低4種類の小技能（例：数学なら大小・絶対値・加減・乗除/累乗・文章題）を混ぜる。
9. 却下される例：数学で「答えが1桁の正の整数、かつ負の数/分数/累乗/括弧/文脈がない」問題。英語で I am / You are / This is の肯定文だけ、または am/is/are の単純穴埋めだけで解ける問題。

【出力フォーマット】
以下の JSON だけをコードブロックで返してください。コードブロック外には何も書かない。

\`\`\`json
{
  "lesson": {
    "contentMd": "マークダウン形式の解説（350〜500字）。# 見出し、## 小見出し、**強調**、リスト「-」を活用し、中1が読みやすい構成で。",
    "estimatedMinutes": 5
  },
  "questions": [
    {
      "questionText": "問題文",
      "choices": ["選択肢A", "選択肢B", "選択肢C"],
      "answer": "選択肢A",
      "explanation": "なぜそれが正解か（中1の言葉で）",
      "difficulty": 1
    }
  ]
}
\`\`\`

問題は 8 問。難易度 1 を 3〜4 問、難易度 2 を 3 問、難易度 3 を 1〜2 問。`;

  const message = await client.messages.create({
    model: GENERATOR_MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  try {
    const jsonStr = extractJson(text);
    const parsed = JSON.parse(jsonStr) as GeneratedTopic;
    if (!parsed.lesson?.contentMd || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid structure");
    }
    for (const q of parsed.questions) {
      if (!Array.isArray(q.choices) || q.choices.length !== 3) {
        throw new Error(`q "${q.questionText?.slice(0, 30)}" choices != 3`);
      }
      if (!q.choices.includes(q.answer)) {
        throw new Error(`q "${q.questionText?.slice(0, 30)}" answer not in choices`);
      }
    }
    if (parsed.questions.length < 6) {
      throw new Error(`Only ${parsed.questions.length} questions generated`);
    }
    const validationProblems = validateGeneratedTopic(domain, parsed);
    if (validationProblems.length > 0) {
      throw new Error(`quality gate failed: ${validationProblems.join("; ")}`);
    }
    return parsed;
  } catch (err) {
    if (attempt < 3) {
      console.log(`    [gen retry ${attempt + 1}] ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, 1500));
      return generate(domain, topicName, topicSlug, isMidterm, attempt + 1);
    }
    throw err;
  }
}

async function judgeQuality(
  domain: SubjectDomain,
  topicName: string,
  generated: GeneratedTopic,
): Promise<{ score: number; reasons: string }> {
  const prompt = `あなたは中学校の${domain.name}科のベテラン教師です。以下の問題セットが「中1の実テスト（中間または期末）本番レベル」として適切かを 1〜5 で評価してください。

【単元】${topicName}

【生成された問題】
${generated.questions
  .map(
    (q, i) =>
      `Q${i + 1} (難易度${q.difficulty}): ${q.questionText}
  選択肢: ${q.choices.join(" / ")}
  正解: ${q.answer}`,
  )
  .join("\n\n")}

【評価基準】
- 5: 実テストにそのまま出せる。難易度配分も適切。
- 4: ほぼ実テスト水準だが軽微な改善余地あり。
- 3: 一部の問題が易しすぎる/難しすぎる、または単元の中核を外している。
- 2: 半数以上が小学校レベル、または知識の核心を問えていない。
- 1: 全体が不適切。

【必ず3以下にする具体的な却下基準】
- 3択で正解が明らか、誤答が不自然、同じ小技能の反復が多く、8問で4種類以上の小技能を扱っていない。
- 数学：答えが1桁の正の整数で、問題に負の数・分数・累乗・括弧・文章文脈がない。例「3+5=」「x+5=12」「2×3=」は不可。中間範囲では方程式・文字式・図形を出していたら不可。
- 英語：I am / You are / This is の肯定文だけ、または am/is/are の単純穴埋めだけで解ける問題が多い。例「I ( ) a student.」だけの出題は不可。
- 国語：漢字の読みだけ、または本文根拠のない読解だけに偏る。架空でない教科書本文の引用がある。
- 理科：植物・観察から外れ、動物分類・物質・気体・力が中心。用語名だけで理由を問わない。
- 社会：日本地理・歴史・都道府県が中心。国名一問一答だけで位置関係や用語の対比がない。

【教科の出題スタイル】
${domain.styleNotes}

JSON のみコードブロックで返してください:
\`\`\`json
{"score": 4, "reasons": "理由を簡潔に"}
\`\`\``;

  const message = await client.messages.create({
    model: JUDGE_MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });
  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  const jsonStr = extractJson(text);
  const parsed = JSON.parse(jsonStr) as { score: number; reasons: string };
  if (!Number.isFinite(parsed.score)) {
    throw new Error("judge returned non-numeric score");
  }
  return parsed;
}

function sqlEsc(s: string): string {
  return "'" + s.replace(/'/g, "''") + "'";
}

async function main() {
  const topics = fetchTopics();
  console.log(`Fetched ${topics.length} topics.`);

  const lines: string[] = [
    "DELETE FROM attempts;",
    "DELETE FROM mock_exam_items;",
    "DELETE FROM questions;",
    "DELETE FROM lessons;",
  ];

  const failures: string[] = [];
  const reports: TopicReport[] = [];

  for (const topic of topics) {
    const domain = subjectDomainFromTopicSlug(topic.slug);
    if (!domain) {
      console.error(`  ✗ no domain for slug ${topic.slug}`);
      failures.push(topic.slug);
      continue;
    }
    const isMidterm = domain.midtermTopicSlugs.includes(topic.slug);

    console.log(`[${topic.id}] ${domain.name}/${topic.name} (${isMidterm ? "中間範囲" : "期末以降"})`);

    let attemptCount = 0;
    let accepted: GeneratedTopic | null = null;
    let acceptedScore = 0;
    const rejections: string[] = [];
    while (attemptCount < 3 && !accepted) {
      attemptCount++;
      try {
        const generated = await generate(domain, topic.name, topic.slug, isMidterm);
        const localProblems = validateGeneratedTopic(domain, generated);
        if (localProblems.length > 0) {
          rejections.push(`attempt ${attemptCount}: local gate ${localProblems.join("; ")}`);
          console.log(`  ↳ attempt ${attemptCount}: local gate rejected (${localProblems.join("; ").slice(0, 120)})`);
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        await new Promise((r) => setTimeout(r, 500));
        const judgement = await judgeQuality(domain, topic.name, generated);
        console.log(`  ↳ attempt ${attemptCount}: score=${judgement.score} (${judgement.reasons.slice(0, 80)})`);
        if (judgement.score >= 4) {
          accepted = generated;
          acceptedScore = judgement.score;
        } else {
          rejections.push(`attempt ${attemptCount}: judge score ${judgement.score} - ${judgement.reasons}`);
          await new Promise((r) => setTimeout(r, 1000));
        }
      } catch (err) {
        const message = (err as Error).message;
        rejections.push(`attempt ${attemptCount}: error ${message}`);
        console.log(`  ↳ attempt ${attemptCount} error: ${message}`);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    if (!accepted) {
      console.error(`  ✗ FAILED after ${attemptCount} attempts`);
      failures.push(topic.slug);
      continue;
    }

    lines.push(
      `INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (${topic.id}, ${sqlEsc(accepted.lesson.contentMd)}, ${accepted.lesson.estimatedMinutes});`,
    );
    for (const q of accepted.questions) {
      lines.push(
        `INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (${topic.id}, 'multi_choice', ${sqlEsc(q.questionText)}, ${sqlEsc(JSON.stringify(q.choices))}, ${sqlEsc(q.answer)}, ${sqlEsc(q.explanation)}, ${q.difficulty});`,
      );
    }
    reports.push({
      topicId: topic.id,
      topicSlug: topic.slug,
      topicName: topic.name,
      subjectName: domain.name,
      finalScore: acceptedScore,
      retries: attemptCount - 1,
      rejections,
      questionCount: accepted.questions.length,
      sampleQuestion: accepted.questions[0]?.questionText ?? "",
    });
    console.log(`  ✓ ${accepted.questions.length} questions accepted`);
    await new Promise((r) => setTimeout(r, 800));
  }

  mkdirSync(join(process.cwd(), "seeds"), { recursive: true });
  writeFileSync(join(process.cwd(), "seeds/quality-regen.sql"), lines.join("\n") + "\n");
  console.log(`\nWrote seeds/quality-regen.sql with ${lines.length} statements.`);
  console.log(`Topics succeeded: ${topics.length - failures.length}/${topics.length}`);
  if (failures.length > 0) console.log(`Failed: ${failures.join(", ")}`);
  console.log("\nQuality report:");
  for (const report of reports) {
    console.log(
      `- [${report.topicId}] ${report.subjectName}/${report.topicName} (${report.topicSlug}): score=${report.finalScore}, retries=${report.retries}, rejections=${report.rejections.length}, inserted=${report.questionCount}, sample=${report.sampleQuestion}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
