"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import type { FavoriteMap } from "@/lib/qpilot/types";
import { useAppState } from "@/lib/qpilot/state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditIcon } from "../icons/EditIcon";
import { BinIcon } from "../icons/BinIcon";
import { InlineEditInput } from "./inline-edit-input";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { EmptyBottleIcon } from "../icons/EmptyBottleIcon";

type FavoritesViewProps = {
  favorites: FavoriteMap;
  onSelectTopic: (topic: string) => void;
  onNewChat: () => void;
};

export function FavoritesView({ favorites, onSelectTopic, onNewChat }: FavoritesViewProps) {
  const { renameFavorite, removeFavoriteFolder } = useAppState();
  const [search, setSearch] = useState("");
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTopic) inputRef.current?.focus();
  }, [editingTopic]);

  const topics = Object.keys(favorites).filter((t) =>
    t.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-uber tracking-wide">Favorites</h1>
        <button
          onClick={onNewChat}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-uber text-background hover:opacity-90 transition-opacity"
        >
          New chat
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search favorites"
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30 transition-colors font-uber tracking-wide"
        />
      </div>

      <div className="flex flex-col">
        {topics.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-in fade-in zoom-in duration-300">
            <EmptyBottleIcon
              color="currentColor"
              className="w-24 h-24 sm:w-28 sm:h-28 mb-5 opacity-50"
            />
            <p className="text-sm sm:text-sm font-uber tracking-wide sm:leading-6">
              {Object.keys(favorites).length === 0 ? (
                <>
                  No favorites yet.
                  <br />
                  Save answers to see them here.
                </>
              ) : (
                "No favorites match your search."
              )}
            </p>
          </div>
        )}
        {topics.map((topic) => {
          const qCount = favorites[topic].length;
          return (
            <div
              key={topic}
              className="group relative flex w-full items-center justify-between border-b border-border py-2 px-4 hover:bg-white/5 transition-colors"
            >
              {editingTopic === topic ? (
                <InlineEditInput
                  inputRef={inputRef}
                  value={editValue}
                  onChange={setEditValue}
                  onSave={(v) => {
                    renameFavorite(topic, v);
                    setEditingTopic(null);
                  }}
                  onCancel={() => setEditingTopic(null)}
                  className="text-[15px] px-2 py-1"
                />
              ) : (
                <button
                  onClick={() => onSelectTopic(topic)}
                  className="flex flex-1 items-center justify-between text-left h-full py-2"
                >
                  <span className="text-[15px] font-uber text-foreground tracking-wide truncate pr-4">
                    {topic}
                  </span>
                  <span className="text-[13px] font-uber text-muted-foreground tracking-wide shrink-0">
                    {qCount} {qCount === 1 ? "question" : "questions"}
                  </span>
                </button>
              )}

              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center pl-2 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors outline-none">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-46 bg-card border-border text-foreground"
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        setEditValue(topic);
                        setEditingTopic(topic);
                      }}
                      className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10"
                    >
                      <EditIcon className="mr-1 size-4" />
                      Rename favorite
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => setTimeout(() => setFolderToDelete(topic), 150)}
                      className="cursor-pointer text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-500/10 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <BinIcon className="mr-1 size-4" />
                      Delete favorite
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
      <ConfirmDialog
        open={folderToDelete !== null}
        onOpenChange={(open) => !open && setFolderToDelete(null)}
        title="Delete Folder?"
        description="All favorites inside will be removed."
        confirmText="Delete"
        onConfirm={() => {
          if (folderToDelete !== null) {
            removeFavoriteFolder(folderToDelete);
            setFolderToDelete(null);
          }
        }}
      />
    </div>
  );
}
