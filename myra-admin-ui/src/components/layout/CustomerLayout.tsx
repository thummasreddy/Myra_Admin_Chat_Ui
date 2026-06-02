import { BarChart3, Bot, Code2, CreditCard, FileText, HelpCircle, LogOut, Palette, Settings, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { listTenants } from "@/features/tenants/tenant.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { cn, initials } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/customer/dashboard", icon: BarChart3 },
  { label: "Assistant Setup", href: "/customer/settings", icon: Palette },
  { label: "Knowledge Base", href: "/customer/knowledge", icon: FileText },
  { label: "Leads", href: "/customer/leads", icon: Users },
  { label: "Analytics", href: "/customer/analytics", icon: BarChart3 },
  { label: "Subscription", href: "/customer/subscription", icon: CreditCard },
  { label: "Embed Code", href: "/customer/embed", icon: Code2 },
  { label: "Settings", href: "/customer/support", icon: HelpCircle }
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
    <div className="customer-shell">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0F172A]/90 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <NavLink to="/customer/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#14B8A6,#8B5CF6)] text-white shadow-lg shadow-teal-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Myra Customer</p>
              <p className="text-xs text-slate-300">Business dashboard</p>
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-400/15 text-xs font-semibold text-teal-200">
                {initials(user?.name ?? "Owner")}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-white">{user?.name ?? "Tenant Owner"}</p>
                <p className="text-xs text-slate-300">{user?.role ?? "TENANT_OWNER"}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="rounded-lg border border-white/10 bg-[#0F172A] p-2 shadow-2xl shadow-slate-950/20 backdrop-blur lg:sticky lg:top-24 lg:h-fit">
          <nav className="grid gap-1 sm:grid-cols-4 lg:grid-cols-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-teal-300/30 bg-white/15 text-white shadow-lg shadow-teal-500/10"
                      : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-2 rounded-md border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-300">
            <div className="mb-1 flex items-center gap-2 font-medium text-white">
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
