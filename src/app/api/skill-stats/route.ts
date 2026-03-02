import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeSkillPerTopic,
  computeOverallAccuracy,
} from "@/lib/skillEngine";
import { SkillStatsResponse } from "@/types";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const attempts = await prisma.studentAttempt.findMany({
      orderBy: { createdAt: "desc" },
    });

    const topicSkills = computeSkillPerTopic(attempts);
    const overallAccuracy = computeOverallAccuracy(attempts);
    const weakestTopic = topicSkills.length > 0 ? topicSkills[0].topic : null;

    const response: SkillStatsResponse = {
      topicSkills,
      overallAccuracy,
      weakestTopic,
      totalAttempts: attempts.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to compute skill stats: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
