import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const client = new Anthropic({ apiKey: process.env["ANTHROPIC_API_KEY"] });

const SUBJECT_ID: Record<string, number> = {
  kokugo: 1, sugaku: 2, eigo: 3, rika: 4, shakai: 5,
};

const MISSING: Array<{ slug: string; subjectName: string; topicName: string; order: number }> = [
  { slug: "kokugo", subjectName: "国語", topicName: "漢字・語句", order: 3 },
  { slug: "kokugo", subjectName: "国語", topicName: "文法（品詞）", order: 4 },
  { slug: "kokugo", subjectName: "国語", topicName: "作文・表現", order: 5 },
  { slug: "sugaku", subjectName: "数学", topicName: "方程式", order: 3 },
  { slug: "sugaku", subjectName: "数学", topicName: "比例と反比例", order: 4 },
  { slug: "eigo", subjectName: "英語", topicName: "名詞・代名詞", order: 5 },
  { slug: "rika", subjectName: "理科", topicName: "動物の分類", order: 2 },
  { slug: "rika", subjectName: "理科", topicName: "光・音・力", order: 4 },
  { slug: "rika", subjectName: "理科", topicName: "気体の性質", order: 5 },
  { slug: "shakai", subjectName: "社会", topicName: "日本の地形", order: 2 },
  { slug: "shakai", subjectName: "社会", topicName: "世界の地形", order: 3 },
  { slug: "shakai", subjectName: "社会", topicName: "古代日本", order: 5 },
];

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
  throw new Error("Unterminated JSON object");
}

async function generateTopic(
  subjectName: string,
  topicName: string,
  attempt = 1,
): Promise<GeneratedTopic> {
  const prompt = `中学1年生の${subjectName}「${topicName}」の学習コンテンツを作成してください。

以下の正確なJSON形式で、コードブロックの中だけに返してください:

\`\`\`json
{
  "lesson": {
    "contentMd": "マークダウン形式の解説（300〜500文字）。# 見出し、## 小見出し、**強調**、リスト「-」を使って読みやすく",
    "estimatedMinutes": 5
  },
  "questions": [
    {
      "questionText": "問題文",
      "choices": ["選択肢A", "選択肢B", "選択肢C"],
      "answer": "選択肢A",
      "explanation": "なぜそれが正解なのかの解説",
      "difficulty": 1
    }
  ]
}
\`\`\`

要件:
- questions は 6〜8 個
- すべて 3 択（choices は必ず長さ3）
- answer は choices の中の文字列と完全一致
- 学習指導要領に沿った中1の頻出・必修内容
- 文字列内のダブルクォートは \\" でエスケープ
- コードブロック以外は何も書かない`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });
  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  try {
    const jsonStr = extractJson(text);
    const parsed = JSON.parse(jsonStr) as GeneratedTopic;
    if (!parsed.lesson || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("Invalid structure");
    }
    for (const q of parsed.questions) {
      if (!Array.isArray(q.choices) || q.choices.length !== 3) {
        throw new Error(`Question has ${q.choices?.length ?? 0} choices, expected 3`);
      }
      if (!q.choices.includes(q.answer)) {
        throw new Error(`Answer "${q.answer}" not in choices`);
      }
    }
    return parsed;
  } catch (err) {
    if (attempt < 3) {
      console.log(`    retry ${attempt + 1}: ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, 1500));
      return generateTopic(subjectName, topicName, attempt + 1);
    }
    throw err;
  }
}

function sqlEsc(s: string): string {
  return "'" + s.replace(/'/g, "''") + "'";
}

async function main() {
  const lines: string[] = [];
  let topicId = 13;

  for (const m of MISSING) {
    topicId++;
    console.log(`Generating ${m.subjectName}/${m.topicName} (id=${topicId})...`);
    try {
      const data = await generateTopic(m.subjectName, m.topicName);
      const subjectId = SUBJECT_ID[m.slug]!;
      const topicSlug = `${m.slug}-${m.order}`;
      lines.push(
        `INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (${topicId}, ${subjectId}, ${sqlEsc(topicSlug)}, ${sqlEsc(m.topicName)}, ${m.order});`,
      );
      lines.push(
        `INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (${topicId}, ${sqlEsc(data.lesson.contentMd)}, ${data.lesson.estimatedMinutes});`,
      );
      for (const q of data.questions) {
        lines.push(
          `INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (${topicId}, 'multi_choice', ${sqlEsc(q.questionText)}, ${sqlEsc(JSON.stringify(q.choices))}, ${sqlEsc(q.answer)}, ${sqlEsc(q.explanation)}, ${q.difficulty});`,
        );
      }
      console.log(`  ✓ ${data.questions.length} questions`);
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ✗ FAILED:`, err);
    }
  }

  mkdirSync(join(process.cwd(), "seeds"), { recursive: true });
  writeFileSync(join(process.cwd(), "seeds/regen-insert.sql"), lines.join("\n") + "\n");
  console.log(`\nWrote seeds/regen-insert.sql with ${lines.length} statements.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
