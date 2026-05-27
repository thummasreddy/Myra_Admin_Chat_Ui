import { Bot, Send } from "lucide-react";
import type { WidgetConfig } from "@/features/widget/widget.types";
import { cn } from "@/lib/utils";

export function WidgetPreview({ config }: { config: WidgetConfig }) {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-lg border bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="rounded-md bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-950">Website preview</p>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className="h-28 rounded bg-slate-100" />
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-6 w-[min(340px,calc(100%-3rem))]",
          config.chatPosition === "bottom-left" ? "left-6" : "right-6"
        )}
      >
        <div className="overflow-hidden rounded-lg border bg-white shadow-xl">
          <div className="flex items-center gap-3 p-4 text-white" style={{ backgroundColor: config.brandColor }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{config.assistantName}</p>
              <p className="text-xs opacity-90">Typically replies instantly</p>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="max-w-[85%] rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{config.welcomeMessage}</div>
            {config.enableSuggestedPrompts ? (
              <div className="flex flex-wrap gap-2">
                {["What can you help with?", "Contact support"].map((prompt) => (
                  <span key={prompt} className="rounded-full border px-3 py-1 text-xs text-slate-600">
                    {prompt}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex items-center gap-2 rounded-md border px-3 py-2">
              <span className="flex-1 text-sm text-muted-foreground">Ask a question...</span>
              <Send className="h-4 w-4" style={{ color: config.brandColor }} />
            </div>
          </div>
        </div>
        <button
          type="button"
          className={cn("mt-4 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg", config.chatPosition === "bottom-left" ? "mr-auto" : "ml-auto block")}
          style={{ backgroundColor: config.brandColor }}
        >
          {config.launcherLabel}
        </button>
      </div>
    </div>
  );
}
