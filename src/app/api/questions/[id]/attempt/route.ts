import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AttemptRequest, AttemptResponse } from "@/types";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const body = (await request.json()) as AttemptRequest;
    const { correct, reflection_note = "", newSolution } = body;

    if (typeof correct !== "boolean") {
      return NextResponse.json(
        { error: "correct field must be a boolean" },
        { status: 400 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Record the attempt.
    const attempt = await prisma.studentAttempt.create({
      data: {
        questionId: question.id,
        topic: question.topic,
        difficulty: question.difficulty,
        correct,
        reflection_note,
      },
    });

    const isUpdatingSolution =
      typeof newSolution === "string" && newSolution.trim().length > 0;

    if (isUpdatingSolution) {
      // Student is supplying a new solution — reset stats to 1/1 as specified.
      await prisma.question.update({
        where: { id: question.id },
        data: {
          solution: newSolution.trim(),
          timesAttempted: 1,
          timesCorrect: 1,
        },
      });
    } else {
      // Normal stat increment.
      await prisma.question.update({
        where: { id: question.id },
        data: {
          timesAttempted: { increment: 1 },
          ...(correct && { timesCorrect: { increment: 1 } }),
        },
      });
    }

    const response: AttemptResponse = {
      success: true,
      attemptId: attempt.id,
      solutionUpdated: isUpdatingSolution,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to record attempt: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
