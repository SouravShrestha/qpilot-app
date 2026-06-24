"use client";

import { Composer } from "./composer";
import type { Difficulty } from "@/lib/qpilot/types";

interface WelcomeScreenProps {
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
}

export function WelcomeScreen({
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
}: WelcomeScreenProps) {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-[28px] tracking-wide font-uber">What can I help with?</h1>
        <p className="mt-2 text-sm text-muted-foreground tracking-wide">
          Generate questions for any software topic.
        </p>
      </div>

      <Composer
        topicInput={topicInput}
        setTopicInput={setTopicInput}
        onSubmit={onSubmit}
        canGenerate={canGenerate}
        loading={loading}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        appKey={appKey}
        onOpenSettings={onOpenSettings}
        suggestions={suggestions}
      />

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTopicInput(s)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] text-foreground/70 transition-colors hover:border-foreground/20 hover:bg-white/5 font-uber tracking-wide"
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
