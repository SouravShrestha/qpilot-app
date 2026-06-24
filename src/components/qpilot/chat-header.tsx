"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { EditIcon } from "../icons/EditIcon";
import { RefreshIcon } from "../icons/RefreshIcon";
import { BinIcon } from "../icons/BinIcon";
import { InlineEditInput } from "./inline-edit-input";
import { ConfirmDialog } from "../ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RecentSession } from "@/lib/qpilot/types";

interface ChatHeaderProps {
  activeTopic: string;
  activeRecent: RecentSession | undefined;
  validationNote: string;
  loading: boolean;
  hasResults: boolean;
  showRegenerate: boolean;
  onRegenerate: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

export function ChatHeader({
  activeTopic,
  activeRecent,
  loading,
  hasResults,
  showRegenerate,
  onRegenerate,
  onRename,
  onDelete,
}: ChatHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div className="sm:mb-4 px-5 sm:px-8">
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete chat?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={onDelete}
      />
      <div className="flex items-center gap-2">
        {editing ? (
          <div className="w-48 sm:w-64">
            <InlineEditInput
              inputRef={inputRef}
              value={editValue}
              onChange={setEditValue}
              onSave={(v) => {
                onRename(v);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              className="text-[15px] font-semibold px-2 py-0.5"
            />
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 group hover:bg-white/5 px-2 py-1 -ml-2 rounded-md transition-colors outline-none">
                <span className="text-[15px] font-uber tracking-wide text-foreground">
                  {activeRecent?.customName || activeTopic}
                </span>
                <ChevronDown className="size-4 text-foreground/60 group-hover:text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 bg-card border-border text-foreground"
            >
              <DropdownMenuItem
                onClick={() => {
                  setEditValue(activeRecent?.customName || activeTopic);
                  setEditing(true);
                }}
                className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 font-uber tracking-wide"
              >
                <EditIcon className="mr-1 size-3" />
                Rename chat
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
              <DropdownMenuItem
                onClick={() => setTimeout(() => setConfirmDelete(true), 150)}
                className="cursor-pointer text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-500/10 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 font-uber tracking-wide"
              >
                <BinIcon className="mr-1 size-3" />
                Delete chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {showRegenerate && !loading && hasResults && (
          <button
            type="button"
            onClick={onRegenerate}
            className="ml-auto inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors font-uber tracking-wide"
          >
            <RefreshIcon color="currentColor" className="size-3" />
            Regenerate
          </button>
        )}
      </div>
    </div>
  );
}
