import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function EmbedCodeBox({ tenantId }: { tenantId: string }) {
  const embedCode = `<script src="https://cdn.myra.ai/widget.js" data-tenant-id="${tenantId}"></script>`;

  async function copyEmbedCode() {
    await navigator.clipboard.writeText(embedCode);
    toast({ title: "Embed code copied", variant: "success" });
  }

  return (
    <div className="rounded-lg border bg-slate-950 p-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <pre className="min-w-0 whitespace-pre-wrap break-all text-sm text-blue-100">{embedCode}</pre>
        <Button type="button" variant="secondary" size="sm" onClick={copyEmbedCode}>
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      </div>
    </div>
  );
}
