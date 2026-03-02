import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCSV } from "@/lib/csvParser";
import { UploadResponse } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, inserted: 0, skipped: 0, errors: ["No file provided"] },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { success: false, inserted: 0, skipped: 0, errors: ["Only CSV files are accepted"] },
        { status: 400 }
      );
    }

    const origin_set = file.name;
    const text = await file.text();
    const { valid, errors } = parseCSV(text);

    if (errors.length > 0 && valid.length === 0) {
      return NextResponse.json(
        { success: false, inserted: 0, skipped: 0, errors },
        { status: 422 }
      );
    }

    let inserted = 0;
    let skipped = 0;

    for (const row of valid) {
      // Step 1: Upsert Question — create if new, update question_content if changed.
      let question = await prisma.question.findUnique({
        where: { questionId: row.questionId },
      });

      if (!question) {
        question = await prisma.question.create({
          data: {
            questionId: row.questionId,
            question_content: row.question_content,
            origin_set,
            topic: row.topic,
            difficulty: row.difficulty,
            solution: "",
            timesAttempted: 0,
            timesCorrect: 0,
          },
        });
      } else if (question.question_content !== row.question_content) {
        question = await prisma.question.update({
          where: { id: question.id },
          data: { question_content: row.question_content },
        });
      }

      // Step 2: Record attempt via FK to Question.id (UUID).
      // Every row from the CSV is stored unconditionally.
      await prisma.studentAttempt.create({
        data: {
          questionId: question.id,
          topic: row.topic,
          difficulty: row.difficulty,
          correct: row.correct,
          reflection_note: "",
        },
      });

      // Step 4: Increment aggregate stats.
      await prisma.question.update({
        where: { id: question.id },
        data: {
          timesAttempted: { increment: 1 },
          ...(row.correct && { timesCorrect: { increment: 1 } }),
        },
      });

      inserted++;
    }

    const response: UploadResponse = { success: true, inserted, skipped, errors };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        inserted: 0,
        skipped: 0,
        errors: [`Server error: ${error instanceof Error ? error.message : "Unknown error"}`],
      },
      { status: 500 }
    );
  }
}
