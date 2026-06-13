import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({
  title = "Something went wrong",
  description = "Refresh the page or try again in a moment."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="rounded-full bg-[var(--color-error-bg)] p-3 text-[var(--color-error)]">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text-main)]">{title}</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
