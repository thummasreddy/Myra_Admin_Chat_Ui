import { BarChart3, Bot, Code2, FileText, HelpCircle, LogOut, Palette, Settings } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { listTenants } from "@/features/tenants/tenant.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { cn, initials } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/customer/dashboard", icon: BarChart3 },
  { label: "Knowledge", href: "/customer/knowledge", icon: FileText },
  { label: "Embed Code", href: "/customer/embed", icon: Code2 },
  { label: "Assistant", href: "/customer/settings", icon: Palette },
  { label: "Support", href: "/customer/support", icon: HelpCircle }
];

export function CustomerLayout() {
  const navigate = useNavigate();
  const { user, logout, selectedTenantId, setSelectedTenantId } = useAuthStore();
  const tenantsQuery = useQuery({ queryKey: ["tenants", "customer-layout"], queryFn: () => listTenants() });
  const allowedTenants =
    user?.role === "TENANT_OWNER"
      ? (tenantsQuery.data ?? []).filter(
          (tenant) =>
            tenant.tenantId === selectedTenantId ||
            tenant.businessEmail === user.email ||
            tenant.supportEmail === user.email
        )
      : tenantsQuery.data ?? [];
  const tenantId = selectedTenantId && allowedTenants.some((tenant) => tenant.tenantId === selectedTenantId)
    ? selectedTenantId
    : allowedTenants[0]?.tenantId || "";

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <NavLink to="/customer/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Myra Customer</p>
              <p className="text-xs text-muted-foreground">Business dashboard</p>
            </div>
          </NavLink>

          <div className="ml-auto flex items-center gap-2">
            <Select
              className="hidden w-56 sm:block"
              value={tenantId}
              onChange={(event) => setSelectedTenantId(event.target.value || null)}
              aria-label="Business selector"
            >
              {allowedTenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.tenantName}
                </option>
              ))}
            </Select>
            <div className="hidden items-center gap-2 rounded-md border px-3 py-2 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {initials(user?.name ?? "Owner")}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-slate-950">{user?.name ?? "Tenant Owner"}</p>
                <p className="text-xs text-muted-foreground">{user?.role ?? "TENANT_OWNER"}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="rounded-lg border bg-white p-2 lg:sticky lg:top-24 lg:h-fit">
          <nav className="grid gap-1 sm:grid-cols-5 lg:grid-cols-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-muted-foreground">
            <div className="mb-1 flex items-center gap-2 font-medium text-slate-800">
              <Settings className="h-4 w-4" />
              Manual activation
            </div>
            Upload knowledge files, then wait for admin approval before installing the embed code.
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
