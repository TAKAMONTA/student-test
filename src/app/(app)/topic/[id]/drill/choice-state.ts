export type ChoiceState = "idle" | "selected" | "correct" | "incorrect";

export type ChoiceResult = { isCorrect: boolean; answer: string } | null;

export function choiceState(
  choice: string,
  userAnswer: string,
  result: ChoiceResult,
): ChoiceState {
  if (result === null) {
    return choice === userAnswer ? "selected" : "idle";
  }
  if (choice === result.answer) return "correct";
  if (choice === userAnswer && !result.isCorrect) return "incorrect";
  return "idle";
}

export function classForChoiceState(state: ChoiceState): string {
  switch (state) {
    case "correct":
      return "border-green-500 bg-green-50 text-green-900";
    case "incorrect":
      return "border-red-500 bg-red-50 text-red-900";
    case "selected":
      return "border-indigo-500 bg-indigo-50 text-indigo-900";
    case "idle":
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}
