import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeSkillPerTopic,
  computeOverallAccuracy,
} from "@/lib/skillEngine";
import { SkillStatsResponse } from "@/types";

// export const runtime = "nodejs";

// export async function GET(): Promise<NextResponse> {
//   try {
//     const attempts = await prisma.studentAttempt.findMany({
//       orderBy: { createdAt: "desc" },
//     });

//     const topicSkills = computeSkillPerTopic(attempts);
//     const overallAccuracy = computeOverallAccuracy(attempts);
//     const weakestTopic = topicSkills.length > 0 ? topicSkills[0].topic : null;

//     const response: SkillStatsResponse = {
//       topicSkills,
//       overallAccuracy,
//       weakestTopic,
//       totalAttempts: attempts.length,
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     return NextResponse.json(
//       { error: `Failed to compute skill stats: ${error instanceof Error ? error.message : "Unknown error"}` },
//       { status: 500 }
//     );
//   }
// }

export async function GET(): Promise<NextResponse> {
  try {
    const [totals, corrects] = await Promise.all([
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

    const correctMap = new Map(
      corrects.map(c => [c.topic, c._count._all])
    );

    const topicSkills = totals.map(stat => {
      const totalAttempts = stat._count._all;
      const correctAttempts = correctMap.get(stat.topic) ?? 0;

      const accuracy =
        totalAttempts > 0
          ? parseFloat(((correctAttempts / totalAttempts) * 100).toFixed(1))
          : 0;

      return {
        topic: stat.topic,
        skill: accuracy / 10,
        totalAttempts,
        correctAttempts,
        accuracy,
      };
    });

    const overallAttempts = topicSkills.reduce(
      (sum, t) => sum + t.totalAttempts,
      0
    );

    const overallCorrect = topicSkills.reduce(
      (sum, t) => sum + t.correctAttempts,
      0
    );

    const overallAccuracy =
      overallAttempts > 0
        ? parseFloat(((overallCorrect / overallAttempts) * 100).toFixed(1))
        : 0;

    const weakestTopic =
      topicSkills.length > 0
        ? topicSkills.sort((a, b) => a.skill - b.skill)[0].topic
        : null;

    return NextResponse.json({
      topicSkills,
      overallAccuracy,
      weakestTopic,
      totalAttempts: overallAttempts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to compute skill stats" },
      { status: 500 }
    );
  }
}