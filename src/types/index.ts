export interface UploadResponse {
  success: boolean;
  inserted: number;
  skipped: number;
  errors: string[];
}

export interface SkillStatsResponse {
  topicSkills: Array<{
    topic: string;
    skill: number;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
  }>;
  overallAccuracy: number;
  weakestTopic: string | null;
  totalAttempts: number;
}

export interface QuestionSummary {
  id: string;
  questionId: string;
  question_content: string;
  topic: string;
  difficulty: number;
  solution: string;
  origin_set: string;
  timesAttempted: number;
  timesCorrect: number;
  successRate: number;
  createdAt: string;
}

export interface QuestionBankResponse {
  questions: QuestionSummary[];
  topics: string[];
}

export interface AttemptSummary {
  id: string;
  correct: boolean;
  reflection_note: string;
  createdAt: string;
}

export interface QuestionDetailResponse {
  question: QuestionSummary;
  attempts: AttemptSummary[];
}

export interface AttemptRequest {
  correct: boolean;
  reflection_note?: string;
  newSolution?: string;
}

export interface AttemptResponse {
  success: boolean;
  attemptId: string;
  solutionUpdated: boolean;
}

export interface RecommendationsResponse {
  recommendations: Array<{
    id: string;
    questionId: string;
    question_content: string;
    topic: string;
    difficulty: number;
    solution: string;
    timesAttempted: number;
    successRate: number;
    relevanceScore: number;
  }>;
}
