import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Question, QuestionDifficulty } from "@/lib/qpilot/types";
import { Markdown } from "./markdown";
import { HeartOutlineIcon } from "../icons/HeartOutlineIcon";
import { HeartFilledIcon } from "../icons/HeartFilledIcon";

const diffStyle: Record<QuestionDifficulty, string> = {
  easy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  hard: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export function DifficultyBadge({
  level,
  className,
}: {
  level: QuestionDifficulty | string;
  className?: string;
}) {
  const key = (level as QuestionDifficulty) in diffStyle ? (level as QuestionDifficulty) : "medium";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide",
        diffStyle[key],
        className,
      )}
    >
      {level}
    </span>
  );
}

export function QuestionMessage({
  question,
  index,
  favorited,
  onToggleFavorite,
}: {
  question: Question;
  index: number;
  favorited: boolean;
  onToggleFavorite: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-border border-b overflow-hidden transition-all">
      {/* Collapsible header — entire row is the toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-col sm:px-5 pt-4 pb-6 text-left group"
      >
        {/* Row 1: "Question N" + icons */}
        <div className="flex w-full items-center justify-between">
          <span className="text-[14px] font-uber tracking-wide text-muted-foreground select-none">
            Question {index}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite();
                }
              }}
              aria-label={favorited ? "Remove favorite" : "Favorite"}
              aria-pressed={favorited}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground cursor-pointer",
                favorited && "text-foreground",
              )}
            >
              {favorited ? (
                <HeartFilledIcon className="size-[14px]" />
              ) : (
                <HeartOutlineIcon color="currentColor" className="size-[14px]" />
              )}
            </span>
          </div>
        </div>

        {/* Row 2: Question text + difficulty badge */}
        <div className="mt-1.5">
          <p className="text-[16px] leading-relaxed text-foreground group-hover:text-foreground/90 transition-colors font-uber tracking-wide">
            {question.question}
          </p>
        </div>
      </button>

      {/* Answer */}
      {open && (
        <div className="sm:px-5 pb-5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="space-y-4">
            <div className="text-[16px] leading-relaxed text-foreground/90 font-lato tracking-wide">
              <Markdown>
                {question.answer?.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').replace(/```(\w+)?\s+(?=.)/g, '```$1\n')}
              </Markdown>
            </div>

            {question.example && (
              question.example.type === "code" ? (
                <div className="mt-4 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-uber tracking-wide uppercase text-muted-foreground">
                      Example
                    </span>
                  </div>
                  <div className="text-[16px] text-foreground/90">
                    <Markdown>
                      {question.example.content?.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').replace(/```(\w+)?\s+(?=.)/g, '```$1\n')}
                    </Markdown>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-code-bg overflow-hidden mb-4 mt-4">
                  <div className="flex items-center px-3 pt-3 pb-1 justify-between">
                    <span className="text-[12px] font-uber tracking-wide uppercase text-muted-foreground">
                      Example
                    </span>
                  </div>
                  <div className="px-4 py-3 text-[16px] text-foreground/90">
                    <Markdown>
                      {question.example.content?.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').replace(/```(\w+)?\s+(?=.)/g, '```$1\n')}
                    </Markdown>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function QuestionMessageSkeleton() {
  return (
    <div className="border-border border-b overflow-hidden transition-all">
      <div className="flex w-full flex-col sm:px-5 pt-4 pb-6 text-left">
        <div className="flex w-full items-center justify-between">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4 animate-pulse rounded bg-muted shrink-0" />
        </div>
        <div className="mt-3 space-y-2.5">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
