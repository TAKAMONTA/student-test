import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const client = new Anthropic({ apiKey: process.env["ANTHROPIC_API_KEY"] });

const SUBJECTS = [
  { slug: "kokugo", name: "国語", topics: ["説明文の読み方", "物語文の読み方", "漢字・語句", "文法（品詞）", "作文・表現"] },
  { slug: "sugaku", name: "数学", topics: ["正の数・負の数", "文字と式", "方程式", "比例と反比例", "平面図形"] },
  { slug: "eigo", name: "英語", topics: ["アルファベット・発音", "be動詞", "一般動詞", "疑問文・否定文", "名詞・代名詞"] },
  { slug: "rika", name: "理科", topics: ["植物のからだ", "動物の分類", "物質の性質", "光・音・力", "気体の性質"] },
  { slug: "shakai", name: "社会", topics: ["地球のすがた", "日本の地形", "世界の地形", "文明のおこり", "古代日本"] },
];

async function generateTopicContent(subjectName: string, topicName: string) {
  const prompt = `中学1年生の${subjectName}「${topicName}」の学習コンテンツを作成してください。

以下のJSON形式で返してください：
{
  "lesson": {
    "contentMd": "マークダウン形式の解説（300〜500文字）",
    "estimatedMinutes": 5
  },
  "questions": [
    {
      "type": "multi_choice",
      "questionText": "問題文",
      "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "answer": "選択肢A",
      "explanation": "解説",
      "difficulty": 1
    },
    {
      "type": "short_answer",
      "questionText": "問題文",
      "choices": null,
      "answer": "答え",
      "explanation": "解説",
      "difficulty": 2
    },
    {
      "type": "numeric",
      "questionText": "計算問題",
      "choices": null,
      "answer": "42",
      "explanation": "解説",
      "difficulty": 2
    }
  ]
}

学習指導要領に基づいた頻出・必修内容を含めてください。JSONのみ返してください。`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch?.[0]) throw new Error(`No JSON in response for ${subjectName}/${topicName}`);
  return JSON.parse(jsonMatch[0]) as {
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
}

async function main() {
  const output: Array<{
    subjectSlug: string;
    subjectName: string;
    topics: Array<{
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
    }>;
  }> = [];

  for (const subject of SUBJECTS) {
    console.log(`Generating ${subject.name}...`);
    const topicsData = [];

    for (const topicName of subject.topics) {
      console.log(`  - ${topicName}`);
      try {
        const content = await generateTopicContent(subject.name, topicName);
        topicsData.push({ topicName, ...content });
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error(`  ERROR: ${topicName}`, err);
      }
    }

    output.push({ subjectSlug: subject.slug, subjectName: subject.name, topics: topicsData });
  }

  mkdirSync(join(process.cwd(), "seeds"), { recursive: true });
  writeFileSync(join(process.cwd(), "seeds/content.json"), JSON.stringify(output, null, 2));
  console.log("Done! seeds/content.json written.");
}

main().catch(console.error);
