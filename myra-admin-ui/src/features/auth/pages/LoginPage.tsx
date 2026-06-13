import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Bot, Lock, Mail, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { login } from "@/features/auth/auth.api";
import { useAuthStore } from "@/features/auth/auth.store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@myra.ai",
      password: "password123"
    }
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session.token, session.user);
      toast({
        title: "Welcome back",
        description: `Signed in as ${session.user.role}.`,
        variant: "success"
      });
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Check your credentials and try again.";
      toast({
        title: message.includes("permission") ? "Access denied" : "Login failed",
        description: message.includes("permission") ? "You do not have permission to access this." : message,
        variant: "error"
      });
    }
  });

  useEffect(() => {
    document.title = "Login | Myra Admin";
  }, []);

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <main className="grid min-h-screen bg-[var(--color-bg-main)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-primary px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/15">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Myra AI</p>
            <p className="text-sm text-white/80">Internal platform administration</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-4xl font-semibold tracking-normal">Operate tenants, approvals, limits, analytics, and support workflows.</p>
          <p className="mt-4 text-white/80">This console is restricted to Myra internal admins. Business owners use the separate tenant admin app.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/80">
          <ShieldCheck className="h-4 w-4" />
          Permission checked by backend admin APIs
        </div>
      </section>

      <section className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white lg:hidden">
              <Bot className="h-6 w-6" />
            </div>
            <CardTitle>Myra Admin Login</CardTitle>
            <CardDescription>Use a MYRA_SUPER_ADMIN or MYRA_SUPPORT_ADMIN account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    className="pl-9"
                    type="email"
                    autoComplete="email"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    className="pl-9"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(form.formState.errors.password)}
                    {...form.register("password")}
                  />
                </div>
                {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
              </div>

              <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
