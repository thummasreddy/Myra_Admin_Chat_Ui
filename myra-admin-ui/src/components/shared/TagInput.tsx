import { X } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TagInput({
  value,
  onChange,
  placeholder = "Add item"
}: {
  value: string[];
  onChange: (nextValue: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const nextTag = draft.trim();
    if (!nextTag || value.includes(nextTag)) return;
    onChange([...value, nextTag]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} />
        <Button type="button" variant="outline" onClick={addTag}>
          Add
        </Button>
      </div>
      <div className="flex min-h-9 flex-wrap gap-2">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full border bg-[var(--color-bg-muted)] px-3 py-1 text-sm">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
