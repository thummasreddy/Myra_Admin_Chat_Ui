import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  Building2,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tenants", href: "/tenants", icon: Building2 },
  { label: "Knowledge", href: "/knowledge", icon: FileText },
  { label: "Conversations", href: "/conversations", icon: MessageSquare },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={cn("fixed inset-0 z-30 bg-slate-950/40 lg:hidden", open ? "block" : "hidden")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-white transition-transform lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <NavLink to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Myra Admin</p>
              <p className="text-xs text-muted-foreground">AI SaaS Control</p>
            </div>
          </NavLink>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-950">Widget install</p>
            <p className="mt-1 text-xs text-muted-foreground">Create a tenant, publish config, then copy the embed script.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
