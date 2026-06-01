import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { listTenants } from "@/features/tenants/tenant.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { initials } from "@/lib/utils";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { user, logout, selectedTenantId, setSelectedTenantId } = useAuthStore();
  const tenantsQuery = useQuery({ queryKey: ["tenants", "header"], queryFn: () => listTenants() });

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-md border bg-slate-50 px-3 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" placeholder="Search tenants, leads, conversations" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Select
            className="hidden w-48 sm:block"
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

          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="hidden items-center gap-3 rounded-md border px-3 py-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials(user?.name ?? "Admin")}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-950">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? "admin@myra.ai"}</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
