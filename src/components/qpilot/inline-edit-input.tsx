import { useRef, useEffect, type RefObject } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type InlineEditInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSave: (v: string) => void;
  onCancel: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
};

export function InlineEditInput({
  value,
  onChange,
  onSave,
  onCancel,
  inputRef,
  className,
}: InlineEditInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (value.trim()) onSave(value.trim());
    onCancel();
  };

  const handleCancel = () => {
    onCancel();
  };

  // Save when clicking anywhere outside the component
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div ref={containerRef} className="flex items-center gap-1 flex-1 min-w-0">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
          } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
          }
        }}
        className={cn(
          "w-full flex-1 min-w-0 bg-transparent outline-none ring-1 ring-white/20 rounded-md font-uber text-foreground",
          className,
        )}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleSave}
        className="shrink-0 p-1 rounded text-foreground/60 hover:text-green-400 hover:bg-green-400/10 transition-colors"
        aria-label="Save"
      >
        <Check className="size-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleCancel}
        className="shrink-0 p-1 rounded text-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        aria-label="Cancel"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
