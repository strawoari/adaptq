import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuestionDetailResponse } from "@/types";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        attempts: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const successRate =
      question.timesAttempted > 0
        ? parseFloat(((question.timesCorrect / question.timesAttempted) * 100).toFixed(1))
        : 0;

    const response: QuestionDetailResponse = {
      question: {
        id: question.id,
        questionId: question.questionId,
        question_content: question.question_content,
        topic: question.topic,
        difficulty: question.difficulty,
        solution: question.solution,
        origin_set: question.origin_set,
        timesAttempted: question.timesAttempted,
        timesCorrect: question.timesCorrect,
        successRate,
        createdAt: question.createdAt.toISOString(),
      },
      attempts: question.attempts.map((a) => ({
        id: a.id,
        correct: a.correct,
        reflection_note: a.reflection_note,
        createdAt: a.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch question: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}