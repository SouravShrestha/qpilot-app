"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useAppState } from "@/lib/qpilot/state";
import { QPilotApiError, generateQuestions } from "@/lib/qpilot/api";
import type { Difficulty, GenerateError, Question, RecentSession } from "@/lib/qpilot/types";

const PAGE_SIZE = 5;

export function useSession() {
  const {
    appKey,
    groqKey,
    difficulty,
    setDifficulty,
    favorites,
    toggleFavorite,
    isFavorite,
    recents,
    addRecent,
    renameRecent,
    removeRecent,
    recommendations,
    addRecommendations,
  } = useAppState();

  const [topicInput, setTopicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTopic, setActiveTopic] = useState("");
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>("medium");
  const [validationNote, setValidationNote] = useState("");
  const [error, setError] = useState<GenerateError | null>(null);
  const [isFavoriteSession, setIsFavoriteSession] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeRecent = useMemo(
    () => recents.find((r) => r.topic === activeTopic),
    [recents, activeTopic],
  );

  const canGenerate = topicInput.trim().length > 0 && !loading;
  const hasResults = questions.length > 0;

  const runGenerate = useCallback(
    async (opts: {
      topic: string;
      difficulty: Difficulty;
      forceRefresh?: boolean;
      offset?: number;
      append?: boolean;
    }) => {
      if (!appKey) {
        toast.error("Add your App API Key to get started.");
        return false; // signals caller to open settings
      }

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const append = Boolean(opts.append);
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        setIsFavoriteSession(false);
        if (!opts.forceRefresh) setQuestions([]);
        setActiveTopic(opts.topic.trim());
      }

      try {
        const res = await generateQuestions(
          {
            topic: opts.topic.trim(),
            difficulty: opts.difficulty,
            forceRefresh: opts.forceRefresh,
            limit: PAGE_SIZE,
            offset: opts.offset ?? 0,
            includeExamples: true,
          },
          { appKey, groqKey: groqKey || undefined },
          ctrl.signal,
        );

        const next = append ? [...questions, ...res.questions] : res.questions;
        setQuestions(next);
        setActiveTopic(res.topic || opts.topic);
        setActiveDifficulty((res.difficulty as Difficulty) || opts.difficulty);
        setValidationNote(res.validation_reasoning || "");
        setError(null);

        if (res.recommendations?.length) addRecommendations(res.recommendations);

        if (!append) {
          addRecent({
            topic: res.topic || opts.topic,
            difficulty: (res.difficulty as Difficulty) || opts.difficulty,
            questions: res.questions,
            timestamp: Date.now(),
            validation_reasoning: res.validation_reasoning,
          });
        }
      } catch (e) {
        if (e instanceof QPilotApiError) {
          setError(e.payload);
          if (!append) setQuestions([]);
        } else {
          setError({
            success: false,
            status: 0,
            message: "Something went wrong. Please try again.",
          });
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }

      return true;
    },
    [appKey, groqKey, questions, addRecent, addRecommendations],
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!canGenerate) return;
      const ok = await runGenerate({ topic: topicInput, difficulty });
      if (ok !== false) setTopicInput("");
    },
    [canGenerate, runGenerate, topicInput, difficulty],
  );

  const handleNewSession = useCallback(() => {
    abortRef.current?.abort();
    setQuestions([]);
    setActiveTopic("");
    setTopicInput("");
    setError(null);
    setValidationNote("");
    setIsFavoriteSession(false);
  }, []);

  const handleRegenerate = useCallback(() => {
    if (!activeTopic) return;
    void runGenerate({ topic: activeTopic, difficulty: activeDifficulty, forceRefresh: true });
  }, [activeTopic, activeDifficulty, runGenerate]);

  const handleLoadMore = useCallback(() => {
    if (!activeTopic) return;
    void runGenerate({
      topic: activeTopic,
      difficulty: activeDifficulty,
      offset: questions.length,
      append: true,
    });
  }, [activeTopic, activeDifficulty, questions.length, runGenerate]);

  const handleSelectRecent = useCallback(
    (r: RecentSession) => {
      setIsFavoriteSession(false);
      setActiveTopic(r.topic);
      setActiveDifficulty(r.difficulty);
      setDifficulty(r.difficulty);
      setQuestions(r.questions);
      setValidationNote(r.validation_reasoning || "");
      setError(null);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      });
    },
    [setDifficulty],
  );

  const handleSelectTopicFavorites = useCallback(
    (topic: string) => {
      setIsFavoriteSession(true);
      setActiveTopic(topic);
      setQuestions(favorites[topic] || []);
      setValidationNote("");
      setError(null);
    },
    [favorites],
  );

  const handleToggleFavorite = useCallback(
    (q: Question) => {
      toggleFavorite(activeTopic, q);
    },
    [activeTopic, toggleFavorite],
  );

  return {
    // state
    appKey,
    difficulty,
    setDifficulty,
    favorites,
    isFavorite,
    recents,
    renameRecent,
    removeRecent,
    recommendations,
    topicInput,
    setTopicInput,
    loading,
    loadingMore,
    questions,
    activeTopic,
    activeDifficulty,
    validationNote,
    error,
    setError,
    activeRecent,
    canGenerate,
    hasResults,
    isFavoriteSession,
    // refs
    scrollRef,
    // handlers
    runGenerate,
    handleSubmit,
    handleNewSession,
    handleRegenerate,
    handleLoadMore,
    handleSelectRecent,
    handleSelectTopicFavorites,
    handleToggleFavorite,
  };
}
