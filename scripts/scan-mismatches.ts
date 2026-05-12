import { readFileSync } from "node:fs";

type Question = {
  id: number;
  topic_id: number;
  question_text: string;
  choices: string | null;
  answer: string;
  explanation: string;
};

const raw = JSON.parse(readFileSync("/tmp/all_questions.json", "utf8")) as Array<{
  results: Question[];
}>;
const questions = raw[0]!.results;

const KANJI = /[一-鿿㐀-䶿]/;
const KANJI_ONLY = /^[一-鿿㐀-䶿]+$/;
const HIRAGANA_ONLY = /^[ぁ-ゖー]+$/;
const KATAKANA_ONLY = /^[ァ-ヺー]+$/;
const NUMERIC_ONLY = /^-?[0-9０-９]+(\.[0-9０-９]+)?$/;

function normalizeNum(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

function countKanji(s: string): number {
  return Array.from(s).filter((c) => KANJI.test(c)).length;
}

type Issue = { id: number; kind: string; detail: string; q: string; ans: string };
const issues: Issue[] = [];

for (const q of questions) {
  const text = q.question_text;
  const ans = q.answer.trim();

  const kanjiMatch = text.match(/漢字\s*([0-9０-９一二三四五六七八九十]+)\s*文字/);
  if (kanjiMatch) {
    const numStr = normalizeNum(kanjiMatch[1]!).replace(/[一二三四五六七八九十]/g, (c) => ({
      一: "1", 二: "2", 三: "3", 四: "4", 五: "5", 六: "6", 七: "7", 八: "8", 九: "9", 十: "10",
    }[c] || c));
    const n = parseInt(numStr, 10);
    if (!isNaN(n)) {
      const kanjiCount = countKanji(ans);
      const allKanji = KANJI_ONLY.test(ans);
      if (!allKanji || kanjiCount !== n) {
        issues.push({
          id: q.id,
          kind: "漢字N文字制約違反",
          detail: `要求: 漢字${n}文字 / 実際: ${ans} (漢字${kanjiCount}文字, 全漢字=${allKanji})`,
          q: text,
          ans,
        });
      }
    }
  }

  if (/ひらがなで(答え|書|記)/.test(text)) {
    if (!HIRAGANA_ONLY.test(ans)) {
      issues.push({
        id: q.id,
        kind: "ひらがな指定違反",
        detail: `要求: ひらがな / 実際: ${ans}`,
        q: text,
        ans,
      });
    }
  }

  if (/カタカナで(答え|書|記)/.test(text)) {
    if (!KATAKANA_ONLY.test(ans)) {
      issues.push({
        id: q.id,
        kind: "カタカナ指定違反",
        detail: `要求: カタカナ / 実際: ${ans}`,
        q: text,
        ans,
      });
    }
  }

  if (/(数字|数値|整数)で(答え|書|記)/.test(text)) {
    if (!NUMERIC_ONLY.test(normalizeNum(ans))) {
      issues.push({
        id: q.id,
        kind: "数値指定違反",
        detail: `要求: 数値 / 実際: ${ans}`,
        q: text,
        ans,
      });
    }
  }

  if (q.choices) {
    try {
      const arr = JSON.parse(q.choices) as string[];
      if (!arr.map((s) => s.trim()).includes(ans)) {
        issues.push({
          id: q.id,
          kind: "正解が選択肢に未含有",
          detail: `choices=${q.choices} / answer=${ans}`,
          q: text,
          ans,
        });
      }
    } catch {
      issues.push({
        id: q.id,
        kind: "choices JSON 不正",
        detail: q.choices,
        q: text,
        ans,
      });
    }
  }
}

console.log(`\n=== ${issues.length} 件の不整合候補 ===\n`);
for (const it of issues) {
  console.log(`Q${it.id} [${it.kind}]`);
  console.log(`  問題: ${it.q.slice(0, 80)}${it.q.length > 80 ? "…" : ""}`);
  console.log(`  ${it.detail}`);
  console.log();
}
