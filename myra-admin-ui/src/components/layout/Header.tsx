import { Bell, Cpu, Grid3X3, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth.store";

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
      className="h-9 w-9 border border-[#1f2937] bg-[#0d1117] text-gray-300 shadow-none hover:bg-[#1e3a5f] hover:text-white"
      onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  function handleLogout() {
    logout();
    navigate("/myra-admin/login", { replace: true });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-[#1f2937] bg-[#111827] text-white">
      <div className="flex h-full items-center gap-3 px-3 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border border-[#1f2937] bg-[#0d1117] text-gray-300 shadow-none hover:bg-[#1e3a5f] hover:text-white lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex min-w-[180px] items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#3b82f6] text-white shadow-sm shadow-blue-500/20">
            <Grid3X3 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Myra Admin</p>
            <p className="text-xs text-gray-400">AI SaaS Control</p>
          </div>
        </div>

        <div className="mx-auto hidden w-full max-w-[500px] items-center gap-2 rounded-md border border-[#1f2937] bg-[#0d1117] px-3 md:flex">
          <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <input
            className="h-9 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            placeholder="Search tenants, leads, conversations"
            aria-label="Search tenants, leads, conversations"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 border-[#1f2937] bg-[#111827] text-gray-200 shadow-none hover:bg-[#1e3a5f] hover:text-white xl:inline-flex"
          >
            <Cpu className="h-4 w-4" />
            AI Ops
          </Button>

          <select
            className="hidden h-9 rounded-md border border-[#1f2937] bg-[#0d1117] px-3 text-sm text-gray-200 outline-none focus:border-[#3b82f6] lg:block"
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
            className="h-9 w-9 border border-[#1f2937] bg-[#0d1117] text-gray-300 shadow-none hover:bg-[#1e3a5f] hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <ThemeToggle />

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3b82f6] text-xs font-bold text-white">MA</div>
            <div className="hidden leading-tight xl:block">
              <p className="text-sm font-semibold text-white">Myra Admin</p>
              <p className="text-xs text-gray-400">ADMIN</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border border-[#1f2937] bg-[#0d1117] text-gray-300 shadow-none hover:bg-red-950/50 hover:text-red-300"
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
