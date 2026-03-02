import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeSkillPerTopic } from "@/lib/skillEngine";
import { generateRecommendations } from "@/lib/recommendationEngine";
import { RecommendationsResponse } from "@/types";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const [attempts, questions] = await Promise.all([
      prisma.studentAttempt.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.question.findMany(),
    ]);

    const topicSkills = computeSkillPerTopic(attempts);
    const recommendations = generateRecommendations(
      questions,
      attempts,
      topicSkills,
      10
    );

    const response: RecommendationsResponse = { recommendations };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to generate recommendations: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
