import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied"
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
}) {
  async function copy() {
    await navigator.clipboard.writeText(value);
    toast({ title: copiedLabel, variant: "success" });
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy}>
      <Copy className="h-4 w-4" />
      {label}
    </Button>
  );
}
