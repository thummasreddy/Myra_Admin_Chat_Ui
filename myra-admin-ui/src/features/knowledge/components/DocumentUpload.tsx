import { FileText, Globe, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DocumentUpload({
  disabled,
  onUpload,
  onWebsiteUrl
}: {
  disabled?: boolean;
  onUpload: (file: File) => void;
  onWebsiteUrl?: (websiteUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function queueFile(file?: File) {
    if (!file || disabled) return;
    setFileName(file.name);
    onUpload(file);
  }

  function submitWebsiteUrl() {
    const value = websiteUrl.trim();
    if (!value || disabled || !onWebsiteUrl) return;
    onWebsiteUrl(value);
    setWebsiteUrl("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Knowledge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "rounded-lg border border-dashed bg-slate-50 p-6 text-center transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-slate-300"
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            queueFile(event.dataTransfer.files?.[0]);
          }}
        >
          <UploadCloud className="mx-auto h-9 w-9 text-primary" />
          <p className="mt-3 text-sm font-medium text-slate-950">{fileName || "Drop PDF, DOCX, TXT, or CSV files"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Uploads move through UPLOADED, PROCESSING, READY, or FAILED states.</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv"
            className="hidden"
            onChange={(event) => {
              queueFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
        <Button type="button" className="w-full" disabled={disabled} onClick={() => inputRef.current?.click()}>
          <FileText className="h-4 w-4" />
          Choose file
        </Button>

        {onWebsiteUrl ? (
          <div className="space-y-2 rounded-md border bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Globe className="h-4 w-4 text-primary" />
              Website URL content
            </div>
            <div className="flex gap-2">
              <Input
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="https://yourbusiness.com/faqs"
              />
              <Button type="button" variant="outline" disabled={disabled || !websiteUrl.trim()} onClick={submitWebsiteUrl}>
                Add
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
