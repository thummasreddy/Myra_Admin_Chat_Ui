import { NavLink } from "react-router-dom";
import {
  BarChart2,
  Building2,
  ClipboardList,
  Flag,
  Headphones,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth.store";
import { isSuperAdmin } from "@/features/admin/admin.permissions";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/myra-admin/dashboard", icon: LayoutDashboard },
  { label: "Pending Approvals", href: "/myra-admin/approvals", icon: ShieldCheck },
  { label: "Tenants", href: "/myra-admin/tenants", icon: Building2 },
  { label: "Plans", href: "/myra-admin/plans", icon: ClipboardList, superOnly: true },
  { label: "Feature Flags", href: "/myra-admin/feature-flags", icon: Flag },
  { label: "Analytics", href: "/myra-admin/analytics", icon: BarChart2 },
  { label: "Audit Logs", href: "/myra-admin/audit-logs", icon: ScrollText },
  { label: "Support", href: "/myra-admin/support", icon: Headphones },
  { label: "Settings", href: "/myra-admin/settings", icon: Settings, superOnly: true }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((state) => state.user);
  const superAdmin = isSuperAdmin(user);

  return (
    <>
      <div
        className={cn("fixed inset-x-0 bottom-0 top-14 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden", open ? "block" : "hidden")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-14 z-40 flex w-[240px] flex-col border-r border-[#1f2937] bg-[#111827] transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-12 items-center justify-between border-b border-[#1f2937] px-3 lg:hidden">
          <p className="text-sm font-semibold text-white">Navigation</p>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:bg-[#1e3a5f] hover:text-white" onClick={onClose} aria-label="Close navigation">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navItems
            .filter((item) => !item.superOnly || superAdmin)
            .map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[#3b82f6] bg-[#1e3a5f] text-white"
                      : "border-transparent bg-transparent text-[#9ca3af] hover:bg-white/[0.05] hover:text-white"
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-none" aria-hidden="true" />
                <span className="min-w-0 truncate">{item.label}</span>
              </NavLink>
            ))}
        </nav>
      </aside>
    </>
  );
}
