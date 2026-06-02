import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Bot, Lock, Mail } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { login } from "@/features/auth/auth.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { trackUserAction } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";
  const isCustomerLogin = redirectTo.startsWith("/customer");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: isCustomerLogin ? "customer@myra.ai" : "admin@myra.ai",
      password: "password123"
    }
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session.token, session.user);
      trackUserAction("login_success", { role: session.user.role });
      toast({
        title: "Welcome back",
        description: isCustomerLogin ? "You are signed in to the Myra customer dashboard." : "You are signed in to Myra Admin.",
        variant: "success"
      });
      navigate(redirectTo, { replace: true });
    },
    onError: () => {
      toast({ title: "Login failed", description: "Check your credentials and try again.", variant: "error" });
    }
  });

  useEffect(() => {
    document.title = "Login | Myra Admin";
  }, []);

  if (token) return <Navigate to={user?.role === "TENANT_OWNER" ? "/customer/dashboard" : "/dashboard"} replace />;

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-primary px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/15">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Myra AI</p>
            <p className="text-sm text-white/80">Tenant control for conversational SaaS</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-4xl font-semibold tracking-normal">Launch and manage tenant chatbots without touching backend code.</p>
          <p className="mt-4 text-white/80">
            Configure tenant branding, AI behavior, knowledge, leads, analytics, and widget embeds from one clean operations console.
          </p>
        </div>
        <p className="text-sm text-white/80">VITE_API_BASE_URL powered gateway integration</p>
      </section>

      <section className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white lg:hidden">
              <Bot className="h-6 w-6" />
            </div>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              {isCustomerLogin
                ? "Use your business owner account. If the backend is offline, demo fallback login is used."
                : "Use your admin account. If the backend is offline, demo fallback login is used."}
            </CardDescription>
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
                    aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email ? (
                  <p id="email-error" className="text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
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
                    aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                    {...form.register("password")}
                  />
                </div>
                {form.formState.errors.password ? (
                  <p id="password-error" className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
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
