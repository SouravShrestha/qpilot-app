import React from "react";
import { EmptyMachineIcon } from "../icons/EmptyMachineIcon";

interface ErrorEmptyStateProps {
  onOpenSettings: () => void;
  onNewChat?: () => void;
}

export function ErrorEmptyState({ onOpenSettings, onNewChat }: ErrorEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-in fade-in zoom-in duration-300 h-full my-auto mt-20">
      <EmptyMachineIcon color="currentColor" className="w-24 h-24 mb-6 opacity-60" />
      <h2 className="text-lg font-uber tracking-wide text-foreground mb-2">
        We couldn&apos;t fetch your data.
      </h2>
      <p className="text-[14px] font-uber tracking-wide mb-1">
        This might be a temporary issue on our end.
      </p>
      <p className="text-[14px] font-uber tracking-wide mb-6">
        If you&apos;ve reached your usage limit, you can add your own API key{" "}
        <button
          onClick={onOpenSettings}
          className="text-foreground underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          here
        </button>
      </p>
      {onNewChat && (
        <button
          onClick={onNewChat}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-uber text-background hover:opacity-90 transition-opacity mt-2"
        >
          Start a new chat
        </button>
      )}
    </div>
  );
}
