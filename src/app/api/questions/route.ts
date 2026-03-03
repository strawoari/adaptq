// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { QuestionBankResponse } from "@/types";

// export const runtime = "nodejs";

// export async function GET(request: NextRequest): Promise<NextResponse> {
//   try {
//     const { searchParams } = new URL(request.url);
//     const topic = searchParams.get("topic");
//     const difficulty = searchParams.get("difficulty");

//     const where: Record<string, unknown> = {};
//     if (topic && topic !== "all") where.topic = topic;
//     if (difficulty && difficulty !== "all") where.difficulty = parseInt(difficulty, 10);

//     const questions = await prisma.question.findMany({
//       where,
//       orderBy: { createdAt: "desc" },
//     });

//     const allTopics = await prisma.question.findMany({
//       select: { topic: true },
//       distinct: ["topic"],
//     });

//     const response: QuestionBankResponse = {
//       questions: questions.map((q) => ({
//         id: q.id,
//         questionId: q.questionId,
//         question_content: q.question_content,
//         topic: q.topic,
//         difficulty: q.difficulty,
//         solution: q.solution,
//         origin_set: q.origin_set,
//         timesAttempted: q.timesAttempted,
//         timesCorrect: q.timesCorrect,
//         successRate:
//           q.timesAttempted > 0
//             ? parseFloat(((q.timesCorrect / q.timesAttempted) * 100).toFixed(1))
//             : 0,
//         createdAt: q.createdAt.toISOString(),
//       })),
//       topics: allTopics.map((t) => t.topic),
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     return NextResponse.json(
//       { error: `Failed to fetch questions: ${error instanceof Error ? error.message : "Unknown error"}` },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuestionBankResponse } from "@/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");

    const where: Record<string, unknown> = {};
    if (topic && topic !== "all") where.topic = topic;
    if (difficulty && difficulty !== "all") where.difficulty = parseInt(difficulty, 10);

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { attempts: true } },
        attempts: { select: { correct: true } },
      },
    });

    const allTopics = await prisma.question.findMany({
      select: { topic: true },
      distinct: ["topic"],
    });

    const response: QuestionBankResponse = {
      questions: questions.map((q) => {
        const actualAttempted = q._count.attempts;
        const actualCorrect = q.attempts.filter((a) => a.correct).length;
        const successRate =
          actualAttempted > 0
            ? parseFloat(((actualCorrect / actualAttempted) * 100).toFixed(1))
            : 0;
        return {
          id: q.id,
          questionId: q.questionId,
          question_content: q.question_content,
          topic: q.topic,
          difficulty: q.difficulty,
          solution: q.solution,
          origin_set: q.origin_set,
          timesAttempted: actualAttempted,
          timesCorrect: actualCorrect,
          successRate,
          createdAt: q.createdAt.toISOString(),
        };
      }),
      topics: allTopics.map((t) => t.topic),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch questions: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}