"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/qpilot/state";
import type { RecentSession } from "@/lib/qpilot/types";
import { LogoIcon } from "../icons/LogoIcon";
import { SidebarIcon } from "../icons/SidebarIcon";
import { NewChatIcon } from "../icons/NewChatIcon";
import { HeartOutlineIcon } from "../icons/HeartOutlineIcon";
import { SettingsIcon } from "../icons/SettingsIcon";
import { BinIcon } from "../icons/BinIcon";
import { EditIcon } from "../icons/EditIcon";
import { PinIcon } from "../icons/PinIcon";
import { InlineEditInput } from "./inline-edit-input";
import { ConfirmDialog } from "../ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onOpenSettings: () => void;
  onNewSession: () => void;
  onSelectRecent: (r: RecentSession) => void;
  activeTopic?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onViewFavorites: () => void;
}

function SidebarBody({
  onOpenSettings,
  onSelectRecent,
  onMobileClose,
  onNewSession,
  activeTopic,
  isCollapsed,
  onToggleCollapse,
  onViewFavorites,
}: SidebarProps) {
  const { recents, removeRecent, renameRecent, togglePinRecent } = useAppState();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pinnedProjects = recents.filter((r) => r.pinned);
  const unpinnedProjects = recents.filter((r) => !r.pinned);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingId) {
      inputRef.current?.focus();
    }
  }, [editingId]);

  const renderRecentItem = (r: RecentSession, i: number) => {
    const active = r.topic === activeTopic;
    return (
      <li key={`${r.topic}-${r.timestamp}-${i}`} className="group relative">
        <div
          className={cn(
            "flex w-full items-center rounded-md transition-colors py-0.5",
            active
              ? "bg-white/8 text-foreground"
              : "text-foreground/70 hover:bg-sidebar-hover hover:text-foreground",
          )}
        >
          {editingId === r.timestamp ? (
            <InlineEditInput
              inputRef={inputRef}
              value={editValue}
              onChange={setEditValue}
              onSave={(v) => {
                renameRecent(r.timestamp, v);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              className="px-3 py-1.5 text-[13px]"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                onSelectRecent(r);
                onMobileClose();
              }}
              className="flex-1 min-w-0 px-3 py-1.5 text-left text-[14px] sm:text-[13px] whitespace-nowrap overflow-hidden rounded-md"
            >
              <span className="min-w-0 truncate font-uber tracking-wide block w-full">
                {r.customName || r.topic}
              </span>
            </button>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center pr-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors outline-none">
                  <MoreHorizontal className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-card border-border text-foreground"
              >
                <DropdownMenuItem
                  onClick={() => {
                    setEditValue(r.customName || "");
                    setEditingId(r.timestamp);
                  }}
                  className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 font-uber tracking-wide"
                >
                  <EditIcon className="mr-1 size-3" />
                  Rename chat
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                <DropdownMenuItem
                  onClick={() => togglePinRecent(r.timestamp)}
                  className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 font-uber tracking-wide"
                >
                  <PinIcon className="mr-1 size-3" />
                  {r.pinned ? "Unpin chat" : "Pin chat"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                <DropdownMenuItem
                  onClick={() => setTimeout(() => setChatToDelete(r.timestamp), 150)}
                  className="cursor-pointer text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-500/10 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 font-uber tracking-wide"
                >
                  <BinIcon className="mr-1 size-3" />
                  Delete chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </li>
    );
  };

  return (
    <>
      <ConfirmDialog
        open={chatToDelete !== null}
        onOpenChange={(open) => !open && setChatToDelete(null)}
        title="Delete chat"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (chatToDelete !== null) {
            removeRecent(chatToDelete);
            setChatToDelete(null);
          }
        }}
      />
      <div className="flex h-full flex-col bg-background text-foreground py-4 w-full">
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between px-[15px] overflow-hidden whitespace-nowrap">
          {/* Logo Area */}
          <div
            className={cn(
              "group relative flex items-center justify-center shrink-0",
              isCollapsed && "cursor-pointer",
            )}
            onClick={isCollapsed ? onToggleCollapse : undefined}
          >
            <LogoIcon
              color="currentColor"
              className={cn(
                "w-[24px] h-auto transition-opacity duration-150",
                isCollapsed && "group-hover:opacity-0",
              )}
            />
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 text-foreground/70 hover:text-foreground",
                isCollapsed && "group-hover:opacity-100",
              )}
            >
              <SidebarIcon color="currentColor" className="w-[18px] h-auto" />
            </div>
          </div>

          {/* Desktop Close Sidebar */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Close sidebar"
            className={cn(
              "hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/70 hover:bg-sidebar-hover hover:text-foreground transition-opacity duration-300 pt-0.5",
              isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100",
            )}
          >
            <SidebarIcon color="currentColor" className="w-[18px] h-auto" />
          </button>

          {/* Mobile Close Sidebar */}
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close sidebar"
            className="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/50 hover:bg-sidebar-hover hover:text-foreground"
          >
            <ChevronDown className="size-5 text-foreground/60 group-hover:text-foreground rotate-90" />
          </button>
        </div>

        {/* Nav links */}
        <div className="mt-6 flex flex-col gap-1 shrink-0 px-2.5">
          <button
            type="button"
            onClick={() => {
              onNewSession();
              onMobileClose();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 h-9 text-[14px] text-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors overflow-hidden whitespace-nowrap pt-1 pb-0.5"
          >
            <NewChatIcon color="currentColor" className="w-[16px] h-auto shrink-0" />
            <span
              className={cn(
                "transition-opacity duration-300 font-uber tracking-wide",
                isCollapsed ? "opacity-0" : "opacity-100",
              )}
            >
              New chat
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              onViewFavorites();
              onMobileClose();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 h-9 text-[14px] text-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors overflow-hidden whitespace-nowrap pt-0.5 mt-1"
          >
            <HeartOutlineIcon color="currentColor" className="w-[15px] h-auto shrink-0" />
            <span
              className={cn(
                "transition-opacity duration-300 font-uber tracking-wide",
                isCollapsed ? "opacity-0" : "opacity-100",
              )}
            >
              Favorites
            </span>
          </button>
        </div>

        {/* Recents */}
        <div
          className={cn(
            "qp-scroll flex-1 overflow-y-auto pt-5 transition-opacity duration-300",
            isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
        >
          <div className="px-3">
            {pinnedProjects.length > 0 && (
              <div className="mb-2">
                <span className="text-[12px] text-foreground whitespace-nowrap font-uber tracking-wide px-3">
                  Pinned
                </span>
                <ul className="space-y-0.5 mt-2">{pinnedProjects.map(renderRecentItem)}</ul>
              </div>
            )}
            {unpinnedProjects.length > 0 && (
              <div className={cn("mb-2", pinnedProjects.length > 0 && "mt-6")}>
                <span className="text-[13px] sm:text-[12px] text-foreground whitespace-nowrap font-uber tracking-wide px-3">
                  Recents
                </span>
                <ul className="space-y-0.5 mt-2">{unpinnedProjects.map(renderRecentItem)}</ul>
              </div>
            )}
          </div>
        </div>

        {/* Settings at bottom */}
        <div className="shrink-0 px-2.5 pb-2">
          <button
            type="button"
            onClick={() => {
              onMobileClose();
              onOpenSettings();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 h-9 text-[14px] text-foreground hover:bg-sidebar-hover transition-colors overflow-hidden whitespace-nowrap pt-0.5"
          >
            <SettingsIcon color="currentColor" className="w-[18px] h-auto shrink-0 -ml-px" />
            <span
              className={cn(
                "transition-opacity duration-300 font-uber tracking-wide",
                isCollapsed ? "opacity-0" : "opacity-100",
              )}
            >
              Settings
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

export function AppSidebar(props: Omit<SidebarProps, "isCollapsed" | "onToggleCollapse">) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <aside
        className={cn(
          "hidden h-full shrink-0 lg:block transition-all duration-300 border-r border-border overflow-hidden",
          isCollapsed ? "w-14" : "w-72",
        )}
      >
        <SidebarBody
          {...props}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onMobileClose={() => {}}
        />
      </aside>

      {props.mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={props.onMobileClose} />
          <div className="absolute inset-y-0 left-0 w-72 shadow-xl animate-in slide-in-from-left border-r border-border">
            <SidebarBody {...props} isCollapsed={false} onToggleCollapse={() => {}} />
          </div>
        </div>
      )}
    </>
  );
}
