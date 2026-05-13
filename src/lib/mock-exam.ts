export type SubjectQuestionPool = {
  subjectId: number;
  subjectName: string;
  questionIds: number[];
};

export type QuestionPoolProblem = {
  subjectId: number;
  subjectName: string;
  available: number;
  required: number;
};

export function findQuestionPoolProblems(
  pools: SubjectQuestionPool[],
  questionsPerSubject: number,
): QuestionPoolProblem[] {
  return pools
    .filter((pool) => pool.questionIds.length < questionsPerSubject)
    .map((pool) => ({
      subjectId: pool.subjectId,
      subjectName: pool.subjectName,
      available: pool.questionIds.length,
      required: questionsPerSubject,
    }));
}

export function pickQuestionIdsBySubject(
  pools: SubjectQuestionPool[],
  questionsPerSubject: number,
  random: () => number = Math.random,
): number[] {
  const problems = findQuestionPoolProblems(pools, questionsPerSubject);
  if (problems.length > 0) {
    throw new Error("insufficient question pool");
  }

  return pools.flatMap((pool) =>
    [...pool.questionIds]
      .sort(() => random() - 0.5)
      .slice(0, questionsPerSubject),
  );
}
