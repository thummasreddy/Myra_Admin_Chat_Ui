import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="rounded-full bg-blue-50 p-3 text-blue-600">
          <Inbox className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          {description ? <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
