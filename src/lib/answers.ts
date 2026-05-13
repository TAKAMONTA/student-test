export function normalizeAnswer(answer: string): string {
  return answer
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\s*([=+\-*/÷×])\s*/g, "$1")
    .replace(/[。．.]+$/g, "");
}

export function isAnswerCorrect(userAnswer: string, expectedAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(expectedAnswer);
}
