import { Bell, Cpu, Grid3X3, LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth.store";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  function handleLogout() {
    logout();
    navigate("/myra-admin/login", { replace: true });
  }

  return (
    <header className="admin-header fixed inset-x-0 top-0 z-50 h-14 border-b border-slate-200 bg-white text-slate-950 dark:border-myra-border dark:bg-myra-background dark:text-myra-text-primary">
      <div className="flex h-full items-center gap-3 px-3 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border border-border bg-background text-muted-foreground shadow-none hover:bg-muted hover:text-foreground lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex min-w-[180px] items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-myra-primary text-white shadow-sm shadow-blue-500/20">
            <Grid3X3 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground">Myra Admin</p>
            <p className="text-xs text-muted-foreground">AI SaaS Control</p>
          </div>
        </div>

        <div className="mx-auto hidden w-full max-w-[500px] items-center gap-2 rounded-md border border-border bg-background px-3 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Search tenants, leads, conversations"
            aria-label="Search tenants, leads, conversations"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 border-border bg-card text-card-foreground shadow-none hover:bg-muted xl:inline-flex"
          >
            <Cpu className="h-4 w-4" />
            AI Ops
          </Button>

          <select
            className="hidden h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-myra-borderStrong lg:block"
            defaultValue="all"
            aria-label="Tenant filter"
          >
            <option value="all">All tenants</option>
            <option value="active">Active tenants</option>
            <option value="pending">Pending tenants</option>
            <option value="inactive">Inactive tenants</option>
          </select>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border border-border bg-background text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <ThemeToggle className="hidden sm:inline-flex" />

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-myra-primary text-xs font-bold text-white">MA</div>
            <div className="hidden leading-tight xl:block">
              <p className="text-sm font-semibold text-foreground">Myra Admin</p>
              <p className="text-xs text-muted-foreground">ADMIN</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border border-border bg-background text-muted-foreground shadow-none hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-300"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
