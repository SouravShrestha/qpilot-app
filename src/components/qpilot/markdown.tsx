import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { CodeBlock } from "../ui/code-block";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "leading-relaxed",
        "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:my-1",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_em]:italic [&_em]:text-foreground/80",
        "[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-foreground/30",
        // We remove global & pre and & code styles because we use CodeBlock
        "[&>code]:rounded [&>code]:border [&>code]:border-code-border [&>code]:bg-code-bg [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:text-[0.83em] [&>code]:font-mono [&>code]:text-foreground",
        "[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-foreground",
        "[&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground",
        "[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-foreground",
        "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic",
        "[&_hr]:my-3 [&_hr]:border-border",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            // If there's a language, we assume it's a code block (inside <pre>)
            if (match) {
              return (
                <CodeBlock
                  language={match[1]}
                  code={String(children).replace(/\n$/, "")}
                />
              );
            }
            // Otherwise it's inline code
            return (
              <code className={cn("rounded border border-code-border bg-code-bg px-1.5 py-0.5 text-[0.83em] font-mono text-foreground", className)} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
