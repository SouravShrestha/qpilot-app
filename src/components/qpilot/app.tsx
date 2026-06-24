"use client";

import { useState, useCallback, useEffect } from "react";
import { SidebarIcon } from "../icons/SidebarIcon";

import { cn } from "@/lib/utils";
import { checkHealth } from "@/lib/qpilot/api";
import { useSession } from "@/hooks/use-session";
import { useAppState } from "@/lib/qpilot/state";

import { AppSidebar } from "./sidebar";
import { SettingsDialog } from "./settings-dialog";
import { FavoritesView } from "./favorites-view";
import { WelcomeScreen } from "./welcome-screen";
import { ErrorEmptyState } from "./error-empty-state";
import { QuestionsFeed } from "./questions-feed";
import { ChatHeader } from "./chat-header";

const ENV_SUGGESTIONS = (
  process.env.NEXT_PUBLIC_SUGGESTIONS ||
  "React Hooks,ASP.NET Core,Docker,Redis,SOLID Principles,Microservices"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function QPilotApp() {
  const session = useSession();
  const {
    appKey,
    difficulty,
    setDifficulty,
    favorites,
    isFavorite,
    renameRecent,
    removeRecent,
    recommendations,
    topicInput,
    setTopicInput,
    loading,
    loadingMore,
    questions,
    activeTopic,
    validationNote,
    error,
    activeRecent,
    canGenerate,
    hasResults,
    isFavoriteSession,
    scrollRef,
    handleSubmit,
    handleNewSession,
    handleRegenerate,
    handleLoadMore,
    handleSelectRecent,
    handleSelectTopicFavorites,
    handleToggleFavorite,
  } = session;

  const [activeView, setActiveView] = useState<"chat" | "favorites">("chat");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"appearance" | "models" | "privacy" | "about">(
    "appearance",
  );

  const handleOpenSettings = useCallback(
    (tab: "appearance" | "models" | "privacy" | "about" = "appearance") => {
      setSettingsTab(tab);
      setSettingsOpen(true);
    },
    [],
  );

  useEffect(() => {
    let mounted = true;
    checkHealth().then((ok) => {
      if (mounted && !ok) console.warn("QPilot API health check failed");
    });
    return () => {
      mounted = false;
    };
  }, []);

  const suggestions = recommendations.length > 0 ? recommendations.slice(0, 5) : ENV_SUGGESTIONS;

  const showWelcome = !hasResults && !loading && !error;



  const handleSelectRecentWithView = (r: Parameters<typeof handleSelectRecent>[0]) => {
    setActiveView("chat");
    handleSelectRecent(r);
  };

  const { renameFavorite, removeFavoriteFolder } = useAppState();

  const handleSelectTopicFavoritesWithView = (topic: string) => {
    setActiveView("chat");
    handleSelectTopicFavorites(topic);
  };

  return (
    <div className="flex h-dvh w-full bg-background text-foreground">
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
        onNewSession={() => {
          setActiveView("chat");
          handleNewSession();
        }}
        onSelectRecent={handleSelectRecentWithView}
        onViewFavorites={() => setActiveView("favorites")}
        activeTopic={activeView === "chat" ? activeTopic : undefined}
      />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <main ref={scrollRef} className="qp-scroll flex-1 overflow-y-auto">
          {/* Mobile-only top bar */}
          <div className="flex h-12 shrink-0 items-center px-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <SidebarIcon color="currentColor" className="size-5" />
            </button>
          </div>

          {activeView === "chat" && activeTopic && (hasResults || loading) && (
            <div className="z-10 bg-background sm:px-4 pt-4 sm:pt-5">
              <ChatHeader
                activeTopic={activeTopic}
                activeRecent={activeRecent}
                validationNote={validationNote}
                loading={loading}
                hasResults={hasResults}
                showRegenerate={!isFavoriteSession}
                onRegenerate={handleRegenerate}
                onRename={(newName) => {
                  if (activeRecent) {
                    renameRecent(activeRecent.timestamp, newName);
                  } else if (isFavoriteSession && activeTopic) {
                    renameFavorite(activeTopic, newName);
                    handleSelectTopicFavorites(newName);
                  }
                }}
                onDelete={() => {
                  if (activeRecent) {
                    removeRecent(activeRecent.timestamp);
                  } else if (isFavoriteSession && activeTopic) {
                    removeFavoriteFolder(activeTopic);
                  }
                  handleNewSession();
                }}
              />
            </div>
          )}

          <div
            className={cn(
              "mx-auto w-full max-w-3xl px-4 sm:px-8",
              showWelcome &&
                activeView === "chat" &&
                "flex min-h-full flex-col justify-center py-16",
              (!showWelcome || activeView !== "chat") && "py-8",
            )}
          >
            {activeView === "favorites" ? (
              <FavoritesView
                favorites={favorites}
                onSelectTopic={handleSelectTopicFavoritesWithView}
                onNewChat={() => {
                  setActiveView("chat");
                  handleNewSession();
                }}
              />
            ) : (
              <>
                {showWelcome && (
                  <WelcomeScreen
                    topicInput={topicInput}
                    setTopicInput={setTopicInput}
                    onSubmit={handleSubmit}
                    canGenerate={canGenerate}
                    loading={loading}
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                    appKey={appKey}
                    onOpenSettings={() => handleOpenSettings()}
                    suggestions={suggestions}
                  />
                )}

                {error && !loading && !hasResults && (
                  <ErrorEmptyState
                    onOpenSettings={() => handleOpenSettings("models")}
                    onNewChat={() => handleNewSession()}
                  />
                )}

                {(hasResults || loading) && (
                  <QuestionsFeed
                    activeTopic={activeTopic}
                    questions={questions}
                    loading={loading}
                    loadingMore={loadingMore}
                    hasResults={hasResults}
                    isFavoriteSession={isFavoriteSession}
                    isFavorite={isFavorite}
                    onToggleFavorite={handleToggleFavorite}
                    onLoadMore={handleLoadMore}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} defaultTab={settingsTab} />
    </div>
  );
}
