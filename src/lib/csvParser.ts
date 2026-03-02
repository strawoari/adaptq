import Papa from "papaparse";

export interface CSVRow {
  questionId: string;
  question_content: string;
  topic: string;
  difficulty: number;
  correct: boolean;
}

export interface ParseResult {
  valid: CSVRow[];
  errors: string[];
}

export function parseCSV(csvText: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const valid: CSVRow[] = [];
  const errors: string[] = [];

  const requiredHeaders = ["questionId", "text", "topic", "difficulty", "correct"];
  const actualHeaders = result.meta.fields ?? [];
  const missingHeaders = requiredHeaders.filter(
    (h) => !actualHeaders.includes(h)
  );

  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(", ")}`);
    return { valid, errors };
  }

  result.data.forEach((row, index) => {
    const lineNum = index + 2;

    const questionId = row.questionId?.trim();
    const text = row.text?.trim();
    const topic = row.topic?.trim();
    const difficultyRaw = row.difficulty?.trim();
    const correctRaw = row.correct?.trim().toLowerCase();

    if (!questionId) {
      errors.push(`Row ${lineNum}: questionId is required`);
      return;
    }

    if (!text) {
      errors.push(`Row ${lineNum}: text is required`);
      return;
    }

    if (!topic) {
      errors.push(`Row ${lineNum}: topic is required`);
      return;
    }

    const difficulty = parseInt(difficultyRaw, 10);
    if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
      errors.push(`Row ${lineNum}: difficulty must be an integer between 1 and 5`);
      return;
    }

    // Any value other than "true" is treated as false rather than rejected,
    // so rows with a blank or unrecognised correct field are still stored.
    const correct = correctRaw === "true";

    valid.push({
      questionId,
      question_content: text,
      topic,
      difficulty,
      correct,
    });
  });

  return { valid, errors };
}
