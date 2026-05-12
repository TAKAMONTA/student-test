import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const client = new Anthropic({ apiKey: process.env["ANTHROPIC_API_KEY"] });

type Question = {
  id: number;
  type: "multi_choice" | "short_answer" | "numeric";
  question_text: string;
  choices: string | null; // JSON string in D1
  answer: string;
  explanation: string;
  difficulty: number;
};

function fetchQuestions(): Question[] {
  const out = execSync(
    `npx wrangler d1 execute chu1-testkit-db --remote --json --command="SELECT id, type, question_text, choices, answer, explanation, difficulty FROM questions ORDER BY id;"`,
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out) as Array<{ results: Question[] }>;
  return parsed[0]!.results;
}

async function generateWrongs(q: Question): Promise<[string, string]> {
  const prompt = `中学1年生向けの問題に対する誤答（紛らわしい不正解の選択肢）を2つ生成してください。

問題: ${q.question_text}
正解: ${q.answer}
解説: ${q.explanation}

要件:
- 正解と同じ形式・カテゴリで、生徒がうっかり選びそうなものを2つ
- 正解と被ってはいけない
- 漢字・記号・スタイルを正解とそろえる

JSON のみで返してください: {"wrong1": "...", "wrong2": "..."}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });
  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch?.[0]) throw new Error(`No JSON in response for q${q.id}`);
  const parsed = JSON.parse(jsonMatch[0]) as { wrong1: string; wrong2: string };
  return [parsed.wrong1, parsed.wrong2];
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function sqlEsc(s: string): string {
  return "'" + s.replace(/'/g, "''") + "'";
}

async function main() {
  const questions = fetchQuestions();
  console.log(`Fetched ${questions.length} questions.`);

  const updates: string[] = [];

  for (const q of questions) {
    let choices: string[];

    if (q.type === "multi_choice" && q.choices) {
      const existing = JSON.parse(q.choices) as string[];
      const correct = q.answer;
      const wrongs = existing.filter((c) => c !== correct);
      const pickedWrongs = wrongs.slice(0, 2);
      if (pickedWrongs.length < 2) {
        console.log(`  q${q.id}: only ${pickedWrongs.length} wrongs, generating extras`);
        const [w1, w2] = await generateWrongs(q);
        if (pickedWrongs.length === 0) pickedWrongs.push(w1, w2);
        else pickedWrongs.push(w2);
        await new Promise((r) => setTimeout(r, 800));
      }
      choices = shuffle([correct, ...pickedWrongs.slice(0, 2)]);
      console.log(`  q${q.id} [${q.type}]: ${existing.length} → 3 choices`);
    } else {
      console.log(`  q${q.id} [${q.type}]: generating wrongs...`);
      try {
        const [w1, w2] = await generateWrongs(q);
        choices = shuffle([q.answer, w1, w2]);
        await new Promise((r) => setTimeout(r, 800));
      } catch (err) {
        console.error(`  ERROR q${q.id}:`, err);
        continue;
      }
    }

    const choicesJson = JSON.stringify(choices);
    updates.push(
      `UPDATE questions SET type='multi_choice', choices=${sqlEsc(choicesJson)} WHERE id=${q.id};`,
    );
  }

  mkdirSync(join(process.cwd(), "seeds"), { recursive: true });
  writeFileSync(join(process.cwd(), "seeds/3choice-update.sql"), updates.join("\n") + "\n");
  console.log(`\nWrote seeds/3choice-update.sql with ${updates.length} statements.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
