export type Difficulty = "easy" | "medium" | "hard" | "mixed";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuestionExample {
  type: "code" | "text";
  content: string;
}

export interface Question {
  id: number;
  question: string;
  answer: string;
  difficulty: QuestionDifficulty;
  example?: QuestionExample | null;
}

export interface GenerateRequest {
  topic: string;
  difficulty: Difficulty;
  forceRefresh?: boolean;
  limit?: number;
  offset?: number;
  includeExamples?: boolean;
}

export interface GenerateSuccess {
  success: true;
  validation_reasoning: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  recommendations?: string[];
}

export type GenerateErrorCode =
  | "UNSUPPORTED_TOPIC"
  | "TOPIC_TOO_BROAD"
  | "INVALID_DIFFICULTY";

export interface GenerateError {
  success: false;
  validation_reasoning?: string;
  errorCode?: GenerateErrorCode;
  message: string;
  suggestions?: string[];
  status: number;
}

export interface RecentSession {
  topic: string;
  difficulty: Difficulty;
  questions: Question[];
  timestamp: number;
  validation_reasoning?: string;
  customName?: string;
  pinned?: boolean;
}

export type FavoriteMap = Record<string, Question[]>;