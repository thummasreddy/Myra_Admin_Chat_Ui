import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";

const plans = ["Starter", "Growth", "Pro", "Enterprise"] as const;

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const initialPlan = plans.find((plan) => plan === requestedPlan) ?? "Starter";
  const [form, setForm] = useState({
    businessName: "",
    ownerFullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    plan: initialPlan as string
  });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    document.title = "Register | Myra AI";
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(form.password === form.confirmPassword ? "" : "Passwords must match.");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 text-slate-950 dark:bg-myra-background dark:text-myra-text-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.12),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.2),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_42%)]" />
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <Card className="relative w-full max-w-lg border-slate-200 bg-white text-slate-950 shadow-2xl shadow-slate-950/10 dark:border-myra-border dark:bg-myra-card dark:text-myra-text-primary dark:shadow-black/40">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-4 flex w-fit items-center gap-3 text-left text-slate-950 dark:text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-myra-primary to-myra-accent font-bold text-white">M</span>
            <span>
              <span className="block text-lg font-bold">Myra AI</span>
              <span className="block text-xs font-normal text-slate-500 dark:text-myra-text-secondary">Assistant Platform</span>
            </span>
          </Link>
          <CardTitle className="text-2xl text-slate-950 dark:text-myra-text-primary">Create Account</CardTitle>
          <CardDescription className="text-slate-600 dark:text-myra-text-secondary">
            Register your business to get started with Myra AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-slate-700 dark:text-myra-text-primary">
                Business Name
              </Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Your business name"
                value={form.businessName}
                onChange={handleChange}
                required
                className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 dark:border-myra-border dark:bg-myra-surface dark:text-myra-text-primary dark:placeholder:text-myra-text-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerFullName" className="text-slate-700 dark:text-myra-text-primary">
                Owner Full Name
              </Label>
              <Input
                id="ownerFullName"
                name="ownerFullName"
                placeholder="Full name"
                value={form.ownerFullName}
                onChange={handleChange}
                required
                className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 dark:border-myra-border dark:bg-myra-surface dark:text-myra-text-primary dark:placeholder:text-myra-text-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-myra-text-primary">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 dark:border-myra-border dark:bg-myra-surface dark:text-myra-text-primary dark:placeholder:text-myra-text-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-myra-text-primary">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
                className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 dark:border-myra-border dark:bg-myra-surface dark:text-myra-text-primary dark:placeholder:text-myra-text-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-myra-text-primary">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 dark:border-myra-border dark:bg-myra-surface dark:text-myra-text-primary dark:placeholder:text-myra-text-muted"
              />
              {passwordError ? <p className="text-sm text-myra-error">{passwordError}</p> : null}
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-slate-700 dark:text-myra-text-primary">Select Plan</legend>
              <div className="grid grid-cols-2 gap-3">
                {plans.map((p) => (
                  <label
                    key={p}
                    className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                      form.plan === p
                        ? "border-myra-borderStrong bg-myra-primarySoft text-myra-primary ring-1 ring-myra-borderStrong dark:bg-myra-muted dark:text-myra-primaryBorder"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-myra-primaryBorder hover:bg-myra-primarySoft dark:border-myra-border dark:bg-myra-surface dark:text-myra-text-secondary dark:hover:border-myra-borderStrong dark:hover:bg-myra-muted"
                    }`}
                  >
                    <input type="radio" name="plan" value={p} checked={form.plan === p} onChange={handleChange} className="sr-only" />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>

            <Button type="submit" className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-myra-text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-myra-primary hover:text-myra-primaryHover dark:text-myra-primaryBorder">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
