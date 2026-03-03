import { Question, StudentAttempt } from "@prisma/client";
import { TopicSkill } from "./skillEngine";

export interface RecommendedQuestion {
  id: string;
  questionId: string;
  question_content: string;
  topic: string;
  difficulty: number;
  solution: string;
  timesAttempted: number;
  successRate: number;
  relevanceScore: number;
}

export function generateRecommendationsOptimized(
  questions: {
    id: string;
    questionId: string;
    question_content: string;
    topic: string;
    difficulty: number;
    solution: string;
    timesAttempted: number;
    timesCorrect: number;
  }[],
  recentlyAttemptedIds: Set<string>,
  topicSkills: { topic: string; skill: number }[],
  limit = 10
): RecommendedQuestion[] {

  const skillMap = new Map<string, number>(
    topicSkills.map(ts => [ts.topic, ts.skill])
  );

  const candidates: RecommendedQuestion[] = [];

  for (const question of questions) {

    if (recentlyAttemptedIds.has(question.id)) continue;

    const successRate =
      question.timesAttempted > 0
        ? question.timesCorrect / question.timesAttempted
        : 0;

    if (successRate > 0.85 && question.timesAttempted > 0) continue;

    const topicSkill = skillMap.get(question.topic);

    if (topicSkill === undefined) {
      candidates.push({
        ...question,
        successRate: parseFloat((successRate * 100).toFixed(1)),
        relevanceScore: 0,
      });
      continue;
    }

    const lowerBound = (topicSkill / 10) * 4 + 1;
    const upperBound = lowerBound + 1;
    const targetDifficulty = lowerBound + 0.5;

    if (
      question.difficulty >= lowerBound &&
      question.difficulty <= upperBound
    ) {
      const relevanceScore =
        1 / (1 + Math.abs(question.difficulty - targetDifficulty));

      candidates.push({
        ...question,
        successRate: parseFloat((successRate * 100).toFixed(1)),
        relevanceScore: parseFloat(relevanceScore.toFixed(4)),
      });
    }
  }

  return candidates
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return a.timesAttempted - b.timesAttempted;
    })
    .slice(0, limit);
}