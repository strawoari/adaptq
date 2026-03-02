import { StudentAttempt } from "@prisma/client";

export interface TopicSkill {
  topic: string;
  skill: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

export function computeSkillPerTopic(
  attempts: StudentAttempt[]
): TopicSkill[] {
  const topicMap = new Map<
    string,
    { correct: number[]; incorrect: number[]; total: number; totalCorrect: number }
  >();

  for (const attempt of attempts) {
    if (!topicMap.has(attempt.topic)) {
      topicMap.set(attempt.topic, {
        correct: [],
        incorrect: [],
        total: 0,
        totalCorrect: 0,
      });
    }
    const entry = topicMap.get(attempt.topic)!;
    entry.total += 1;
    if (attempt.correct) {
      entry.correct.push(attempt.difficulty);
      entry.totalCorrect += 1;
    } else {
      entry.incorrect.push(attempt.difficulty);
    }
  }

  const result: TopicSkill[] = [];

  topicMap.forEach((data, topic) => {
    const sumCorrect = data.correct.reduce((a, b) => a + b, 0);
    const sumIncorrect = data.incorrect.reduce((a, b) => a + b, 0);

    // skill = sumCorrect / (sumCorrect + sumIncorrect + 1) * 10
    // Range: 0–10, rounded to 1 decimal place.
    const skill = Math.round((sumCorrect / (sumCorrect + sumIncorrect + 1)) * 100) / 10;

    result.push({
      topic,
      skill,
      totalAttempts: data.total,
      correctAttempts: data.totalCorrect,
      accuracy: data.total > 0
        ? parseFloat(((data.totalCorrect / data.total) * 100).toFixed(1))
        : 0,
    });
  });

  return result.sort((a, b) => a.skill - b.skill);
}

export function computeOverallAccuracy(attempts: StudentAttempt[]): number {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter((a) => a.correct).length;
  return parseFloat(((correct / attempts.length) * 100).toFixed(1));
}
