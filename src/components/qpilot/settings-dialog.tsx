import { useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff, Monitor, Moon, Sun, Trash2, ChevronDown } from "lucide-react";
import pkg from "../../../package.json";
import { ThemeIcon } from "../icons/ThemeIcon";
import { HeartIcon } from "../icons/HeartIcon";
import { PrivacyIcon } from "../icons/PrivacyIcon";
import { CoffeeIcon } from "../icons/CoffeeIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/qpilot/state";
import { useTheme, type ThemeMode } from "@/lib/qpilot/theme";
import { ModelsIcon } from "../icons/ModelsIcon";

function maskKey(k: string) {
  if (!k) return "";
  if (k.length <= 8) return "•".repeat(k.length);
  return `${k.slice(0, 4)}${"•".repeat(Math.max(4, k.length - 8))}${k.slice(-4)}`;
}

function KeyField({
  id,
  label,
  description,
  value,
  onSave,
}: {
  id: string;
  label: string;
  description: ReactNode;
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(!value);
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (!value) setEditing(true);
  }, [value]);

  if (!editing) {
    return (
      <div>
        <div className="space-y-1.5">
          <Label htmlFor={id} className="font-uber tracking-wide">
            {label}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id={id}
              readOnly
              value={reveal ? value : maskKey(value)}
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setReveal((r) => !r)}
              aria-label={reveal ? "Hide key" : "Reveal key"}
            >
              {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDraft("");
                setEditing(true);
              }}
            >
              Update
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onSave("")}
              aria-label="Remove key"
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-uber tracking-wide mt-4 w-full text-right">
          {description}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={id} className="font-uber tracking-wide">
            {label}
          </Label>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-[280px] shrink-0">
          <Input
            id={id}
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste your key"
            className="font-mono text-xs"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (!draft.trim()) return;
              onSave(draft.trim());
              setEditing(false);
              setDraft("");
            }}
            disabled={!draft.trim()}
          >
            Save
          </Button>
          {value && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setDraft("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-uber tracking-wide mt-4 w-full text-right">
        {description}
      </p>
    </div>
  );
}

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const envModelsStr = process.env.NEXT_PUBLIC_MODELS || "llama-3.3-70b-versatile";
const availableModels = envModelsStr
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

type TabId = "appearance" | "models" | "privacy" | "about";

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: "appearance", label: "Appearance", icon: <ThemeIcon className="size-3 shrink-0 mr-1" /> },
  { id: "models", label: "Models", icon: <ModelsIcon className="size-4 mr-1 shrink-0" /> },
  { id: "privacy", label: "Privacy", icon: <PrivacyIcon className="size-3.5 shrink-0 mr-1" /> },
  { id: "about", label: "About", icon: <HeartIcon className="size-3 shrink-0 mr-1" /> },
];

export function SettingsDialog({
  open,
  onOpenChange,
  defaultTab = "appearance",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: TabId;
}) {
  const { groqKey, setGroqKey, model, setModel } = useAppState();
  const { mode, setMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  useEffect(() => {
    if (!model && availableModels.length > 0) {
      setModel(availableModels[0]);
    }
  }, [model, setModel]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 overflow-hidden flex flex-col md:flex-row h-[85dvh] max-h-[800px] md:h-[500px] gap-0 [&>button.absolute]:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-3 border-b border-border md:hidden shrink-0">
          <div className="font-uber text-[15px] font-semibold tracking-wide px-1">Settings</div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm font-uber tracking-wide text-muted-foreground hover:text-foreground px-2 py-1 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-border p-2 md:p-4 flex md:flex-col gap-1 shrink-0 overflow-x-auto scrollbar-none">
          <div className="hidden md:block font-uber text-[15px] font-semibold tracking-wide mb-4 px-2">
            Settings
          </div>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 md:px-2 py-2 rounded-md text-[13px] font-uber tracking-wide transition-colors text-left whitespace-nowrap mb-2",
                activeTab === tab.id
                  ? "bg-sidebar-hover text-foreground"
                  : "text-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 md:p-8 overflow-y-auto">
          {activeTab === "appearance" && (
            <div className="space-y-8">
              <p className="text-sm text-muted-foreground leading-relaxed font-uber tracking-wide">
                Customize the look and feel of the application.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Label className="text-sm font-uber tracking-wide">Theme</Label>
                <div className="w-full sm:w-[280px] shrink-0">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 capitalize">
                        <span>{mode}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[340px] sm:w-[280px]">
                      {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <DropdownMenuItem
                            key={opt.value}
                            onClick={() => setMode(opt.value)}
                            className="cursor-pointer flex items-center gap-2 font-uber tracking-wide"
                          >
                            <Icon className="size-4" />
                            {opt.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}

          {activeTab === "models" && (
            <div className="space-y-8">
              <p className="text-sm text-muted-foreground leading-relaxed font-uber tracking-wide">
                This is a Bring Your Own Model (BYOM) application
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed font-uber tracking-wide">
                Built-in AI credits are limited, so please provide your own Groq API key to continue
                using the app without interruptions.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Label className="text-sm font-uber tracking-wide">AI Model</Label>
                <div className="w-full sm:w-[280px] shrink-0">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                        <span>{model || "Select a model..."}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[340px] sm:w-[280px]">
                      {availableModels.map((m) => (
                        <DropdownMenuItem
                          key={m}
                          onClick={() => setModel(m)}
                          className="cursor-pointer font-uber tracking-wide"
                        >
                          {m}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <KeyField
                id="groq-key"
                label="Groq API Key"
                description={
                  <>
                    To get your Groq API key,{" "}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-primary hover:text-primary/80"
                    >
                      click here
                    </a>
                  </>
                }
                value={groqKey}
                onSave={setGroqKey}
              />
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-8">
              <p className="text-sm text-muted-foreground leading-relaxed font-uber tracking-wide">
                Your data & safe AI
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-uber tracking-wide">Data Storage</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All your chats, favorites, settings, and API keys are stored{" "}
                    <strong>locally in your browser</strong>. <br />
                    We do not store any of this information on our servers. <br />
                    Clearing your browser data will result in the permanent loss of this
                    information.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-uber tracking-wide">AI Limitations</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI can occasionally make mistakes or hallucinate facts. <br />
                    Please verify important information and avoid sharing sensitive personal data in
                    your queries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-6">
              <a
                href="https://buymeachai.ezee.li/cbsdev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-max items-center gap-2 text-base font-uber tracking-wide text-foreground transition hover:text-blue-500"
              >
                <CoffeeIcon className="h-4 mr-1 w-auto text-[#FFDD00]" />
                Buy me a coffee
              </a>
              <div className="space-y-3">
                <p className="text-sm text-foreground font-uber tracking-wide">
                  Made with ꨄ︎ by Sourav Shrestha
                </p>
                <a
                  href="https://www.cbsdev.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline font-uber tracking-wide"
                >
                  https://www.cbsdev.me
                </a>
                <p className="text-sm text-muted-foreground mt-4 font-uber tracking-wide">
                  App version {pkg.version}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
