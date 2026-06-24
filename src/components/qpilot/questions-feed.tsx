"use client";

import { Loader2 } from "lucide-react";

import { QuestionMessage, QuestionMessageSkeleton } from "./question-card";
import type { Question } from "@/lib/qpilot/types";

interface QuestionsFeedProps {
  activeTopic: string;
  questions: Question[];
  loading: boolean;
  loadingMore: boolean;
  hasResults: boolean;
  isFavoriteSession: boolean;
  isFavorite: (topic: string, id: number) => boolean;
  onToggleFavorite: (q: Question) => void;
  onLoadMore: () => void;
}

export function QuestionsFeed({
  activeTopic,
  questions,
  loading,
  loadingMore,
  hasResults,
  isFavoriteSession,
  isFavorite,
  onToggleFavorite,
  onLoadMore,
}: QuestionsFeedProps) {
  return (
    <div className="space-y-3">
      {loading && Array.from({ length: 4 }).map((_, i) => <QuestionMessageSkeleton key={i} />)}

      {questions.map((q, i) => (
        <QuestionMessage
          key={q.id}
          question={q}
          index={i + 1}
          favorited={isFavorite(activeTopic, q.id)}
          onToggleFavorite={() => onToggleFavorite(q)}
        />
      ))}

      {loadingMore &&
        Array.from({ length: 2 }).map((_, i) => <QuestionMessageSkeleton key={`more-${i}`} />)}

      {hasResults && !loading && !isFavoriteSession && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-1.5 border-b-px border-borderpx-1 py-1.5 text-xs font-uber tracking-wide text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="size-3.5 animate-spin" /> : "Load more questions"}
          </button>
        </div>
      )}
    </div>
  );
}
