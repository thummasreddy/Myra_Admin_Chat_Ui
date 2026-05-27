import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const faqSchema = z.object({
  question: z.string().min(5, "Question is too short"),
  answer: z.string().min(10, "Answer is too short")
});

type FaqFormValues = z.infer<typeof faqSchema>;

export function FaqEditor({
  disabled,
  onSubmit
}: {
  disabled?: boolean;
  onSubmit: (values: FaqFormValues) => void;
}) {
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: ""
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            onSubmit(values);
            form.reset();
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea id="question" {...form.register("question")} />
            {form.formState.errors.question ? <p className="text-sm text-red-600">{form.formState.errors.question.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea id="answer" className="min-h-32" {...form.register("answer")} />
            {form.formState.errors.answer ? <p className="text-sm text-red-600">{form.formState.errors.answer.message}</p> : null}
          </div>
          <Button type="submit" disabled={disabled}>
            Add FAQ
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
