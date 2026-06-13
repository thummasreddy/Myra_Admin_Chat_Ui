import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const plans = ["Starter", "Growth", "Pro", "Enterprise"] as const;

export function RegisterPage() {
  const [form, setForm] = useState({
    businessName: "",
    ownerFullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    plan: "Starter" as string
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Registration logic will be wired up later
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900 text-gray-100">
        <CardHeader className="text-center">
          <Link to="/" className="mb-4 inline-block text-xl font-bold text-white">
            Myra AI
          </Link>
          <CardTitle className="text-2xl text-white">Create Account</CardTitle>
          <CardDescription className="text-gray-400">
            Register your business to get started with Myra AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-gray-300">Business Name</Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Your business name"
                value={form.businessName}
                onChange={handleChange}
                required
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerFullName" className="text-gray-300">Owner Full Name</Label>
              <Input
                id="ownerFullName"
                name="ownerFullName"
                placeholder="Full name"
                value={form.ownerFullName}
                onChange={handleChange}
                required
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-gray-300">Select Plan</legend>
              <div className="grid grid-cols-2 gap-3">
                {plans.map((p) => (
                  <label
                    key={p}
                    className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                      form.plan === p
                        ? "border-indigo-500 bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500"
                        : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p}
                      checked={form.plan === p}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>

            <Button type="submit" className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/myra-admin/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
