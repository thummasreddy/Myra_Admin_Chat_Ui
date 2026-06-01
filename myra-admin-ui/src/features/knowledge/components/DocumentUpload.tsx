import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DocumentUpload({
  disabled,
  onUpload
}: {
  disabled?: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Knowledge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm font-medium text-slate-950">{fileName || "PDF, DOCX, TXT, or CSV"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Files are sent to knowledge-service for indexing.</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              onUpload(file);
              event.target.value = "";
            }}
          />
        </div>
        <Button type="button" className="w-full" disabled={disabled} onClick={() => inputRef.current?.click()}>
          Choose file
        </Button>
      </CardContent>
    </Card>
  );
}
