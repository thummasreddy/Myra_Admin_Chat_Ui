import { Bell, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/features/auth/auth.store";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <PageHeader title="Settings" description="Manage admin profile, password, and notification preferences." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Admin Profile</CardTitle>
            </div>
            <CardDescription>Profile values are ready for auth-service integration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user?.name ?? "Myra Admin"} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? "admin@myra.ai"} readOnly />
            </div>
            <Button disabled>Save profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>Placeholder for secure password rotation through auth-service.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="password" placeholder="Current password" disabled />
            <Input type="password" placeholder="New password" disabled />
            <Button disabled>Update password</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Placeholder settings for operational alerts and lead notifications.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {["New leads", "Failed responses", "Tenant status changes"].map((label) => (
              <label key={label} className="flex items-center gap-2 rounded-md border p-3 text-sm font-medium">
                <Checkbox defaultChecked disabled />
                {label}
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
