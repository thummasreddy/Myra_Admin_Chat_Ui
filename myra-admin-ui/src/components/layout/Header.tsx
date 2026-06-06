import { useQuery } from "@tanstack/react-query";
import { Bell, Cpu, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { listTenants } from "@/features/tenants/tenant.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { initials } from "@/lib/utils";

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("myra-theme");
      return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "dark";
    }

    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("myra-theme", theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="border border-primary/10 bg-white/10 hover:bg-primary/10"
      onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { user, logout, selectedTenantId, setSelectedTenantId } = useAuthStore();
  const tenantsQuery = useQuery({ queryKey: ["tenants", "header"], queryFn: () => listTenants() });

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="admin-header sticky top-0 z-20 border-b backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button variant="ghost" size="icon" className="border border-transparent hover:border-primary/20 hover:bg-primary/10 lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden min-w-0 max-w-xl flex-1 items-center gap-2 rounded-md border border-primary/15 bg-[var(--color-bg-card)] px-3 shadow-sm shadow-primary/5 md:flex">
          <Search className="h-4 w-4 text-primary" />
          <Input className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" placeholder="Search tenants, leads, conversations" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-md border border-primary/15 bg-primary/10 px-3 py-2 text-sm font-medium text-primary xl:flex">
            <Cpu className="h-4 w-4" />
            AI Ops
          </div>
          <Select
            className="hidden w-52 border-primary/15 bg-[var(--color-bg-card)] shadow-sm shadow-primary/5 sm:block"
            value={selectedTenantId ?? ""}
            onChange={(event) => setSelectedTenantId(event.target.value || null)}
            aria-label="Tenant selector"
          >
            <option value="">All tenants</option>
            {tenantsQuery.data?.map((tenant) => (
              <option key={tenant.tenantId} value={tenant.tenantId}>
                {tenant.tenantName}
              </option>
            ))}
          </Select>

          <Button variant="ghost" size="icon" className="border border-primary/10 bg-white/10 hover:bg-primary/10" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          <div className="hidden items-center gap-3 rounded-md border border-white/10 bg-white/10 px-3 py-2 shadow-sm sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1591DC] text-xs font-semibold text-white shadow-sm">
              {initials(user?.name ?? "Admin")}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-white">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-slate-300">{user?.role ?? "ADMIN"}</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="border border-primary/10 bg-white/10 hover:bg-secondary/10 hover:text-secondary" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
