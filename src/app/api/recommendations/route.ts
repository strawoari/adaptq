import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeSkillPerTopic } from "@/lib/skillEngine";
import { generateRecommendationsOptimized } from "@/lib/recommendationEngine";
import { RecommendationsResponse } from "@/types";

// export const runtime = "nodejs";

// export async function GET(): Promise<NextResponse> {
//   try {
//     const [attempts, questions] = await Promise.all([
//       prisma.studentAttempt.findMany({ orderBy: { createdAt: "desc" } }),
//       prisma.question.findMany(),
//     ]);

//     const topicSkills = computeSkillPerTopic(attempts);
//     const recommendations = generateRecommendations(
//       questions,
//       attempts,
//       topicSkills,
//       10
//     );

//     const response: RecommendationsResponse = { recommendations };
//     return NextResponse.json(response);
//   } catch (error) {
//     return NextResponse.json(
//       { error: `Failed to generate recommendations: ${error instanceof Error ? error.message : "Unknown error"}` },
//       { status: 500 }
//     );
//   }
// }
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const oneDayAgo = new Date(Date.now() - 30 * 60 * 1000);

    const [recentAttempts, topicTotals, topicCorrect] = await Promise.all([
      prisma.studentAttempt.findMany({
        where: { createdAt: { gte: oneDayAgo } },
        select: { questionId: true },
      }),
      prisma.studentAttempt.groupBy({
        by: ['topic'],
        _count: { _all: true },
      }),
      prisma.studentAttempt.groupBy({
        by: ['topic'],
        where: { correct: true },
        _count: { _all: true },
      }),
    ]);

    // Build topic skill map (accuracy-based, 0–10 scale)
    const correctMap = new Map(
      topicCorrect.map(c => [c.topic, c._count._all])
    );

    const topicSkills = topicTotals.map(stat => {
      const total = stat._count._all;
      const correct = correctMap.get(stat.topic) ?? 0;
      const accuracy = total > 0 ? correct / total : 0;
      return {
        topic: stat.topic,
        skill: accuracy * 10,
      };
    });

    const recentlyAttemptedIds = new Set(
      recentAttempts.map(a => a.questionId)
    );

    // Only fetch necessary fields
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        questionId: true,
        question_content: true,
        topic: true,
        difficulty: true,
        solution: true,
        timesAttempted: true,
        timesCorrect: true,
      },
    });

    const recommendations = generateRecommendationsOptimized(
      questions,
      recentlyAttemptedIds,
      topicSkills,
      10
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}