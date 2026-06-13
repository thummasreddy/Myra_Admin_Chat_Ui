import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PLANS = ["Starter", "Growth", "Pro", "Enterprise"] as const;

export function RegisterPage() {
  const [plan, setPlan] = useState<string>("Starter");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <Card className="w-full max-w-md border-slate-700 bg-slate-900">
        <CardHeader className="text-center">
          <Link to="/" className="mb-2 inline-block">
            <span className="text-lg font-bold text-white">Myra AI</span>
          </Link>
          <CardTitle className="text-2xl text-white">Create Account</CardTitle>
          <CardDescription className="text-slate-400">
            Register your business to get started with Myra AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label className="text-slate-300">Business Name</Label>
              <Input
                placeholder="Your business name"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Owner Full Name</Label>
              <Input
                placeholder="Full name"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email Address</Label>
              <Input
                type="email"
                placeholder="you@business.com"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Password</Label>
              <Input
                type="password"
                placeholder="Create a password"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm your password"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Select Plan</Label>
              <div className="grid grid-cols-2 gap-2">
                {PLANS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      plan === p
                        ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Create Account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
