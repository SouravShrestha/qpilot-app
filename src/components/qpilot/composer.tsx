"use client";

import { Check, KeyRound, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowIcon } from "../icons/ArrowIcon";
import { ArrowDownIcon } from "../icons/ArrowDownIcon";
import { useTypewriter } from "@/hooks/use-typewriter";
import type { Difficulty } from "@/lib/qpilot/types";

const DIFFICULTIES: { value: Difficulty; label: string; subtitle: string }[] = [
  { value: "easy", label: "Easy", subtitle: "For beginners starting out" },
  { value: "medium", label: "Medium", subtitle: "Standard interview questions" },
  { value: "hard", label: "Hard", subtitle: "For your toughest challenges" },
  { value: "mixed", label: "Mixed", subtitle: "A mix of all difficulty levels" },
];

type ComposerProps = {
  topicInput: string;
  setTopicInput: (v: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  canGenerate: boolean;
  loading: boolean;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  appKey: string;
  onOpenSettings: () => void;
  suggestions: string[];
};

export function Composer({
  topicInput,
  setTopicInput,
  onSubmit,
  canGenerate,
  loading,
  difficulty,
  setDifficulty,
  appKey,
  onOpenSettings,
  suggestions,
}: ComposerProps) {
  const typed = useTypewriter(suggestions, topicInput.length === 0 && !loading);
  const placeholder =
    topicInput.length === 0 ? `${typed}` : "Topic, technology, or job description…";

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="rounded-2xl border border-border bg-card">
        <div className="relative flex items-center">
          <input
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder={placeholder}
            aria-label="Topic"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            className="w-full rounded-t-2xl bg-transparent px-5 py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground font-uber tracking-wide"
          />
        </div>
        <div className="flex items-center justify-end gap-3 px-4 py-3">
          {!appKey && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300"
            >
              <KeyRound className="size-3" />
              Add API key
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Difficulty"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-1.5 text-[13px] font-uber text-foreground hover:bg-secondary/80 transition-colors tracking-wide"
              >
                {DIFFICULTIES.find((d) => d.value === difficulty)?.label ?? "Medium"}
                <ArrowDownIcon color="currentColor" className="size-4 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px] p-2 rounded-2xl">
              {DIFFICULTIES.map((d) => (
                <DropdownMenuItem
                  key={d.value}
                  onSelect={() => setDifficulty(d.value)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-uber tracking-wide">{d.label}</span>
                    <span className="text-[12px] text-muted-foreground tracking-wide">
                      {d.subtitle}
                    </span>
                  </div>
                  {difficulty === d.value && (
                    <Check className="size-5 text-foreground shrink-0 ml-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="submit"
            disabled={!canGenerate}
            aria-label="Generate"
            className="grid h-8 w-8 place-items-center rounded-lg bg-send-btn text-send-btn-foreground transition-opacity hover:opacity-85 disabled:opacity-30"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowIcon color="currentColor" className="size-[13px] -rotate-90" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
