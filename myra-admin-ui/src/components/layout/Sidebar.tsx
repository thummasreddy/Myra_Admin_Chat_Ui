import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  Building2,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pending Approvals", href: "/approvals", icon: ShieldCheck },
  { label: "Tenant Review", href: "/tenant-review", icon: UserCheck },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Knowledge Documents", href: "/knowledge-documents", icon: Inbox },
  { label: "Subscriptions", href: "/subscriptions", icon: FileText },
  { label: "Email Notifications", href: "/email-notifications", icon: Mail },
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
        className={cn("fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden", open ? "block" : "hidden")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r transition-transform lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <NavLink to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#EA5455] text-white shadow-lg shadow-red-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Myra Admin</p>
              <p className="text-xs text-slate-400">AI SaaS Control</p>
            </div>
          </NavLink>
          <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "border-red-300/35 bg-white/10 text-white shadow-lg shadow-red-500/10"
                    : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                )
              }
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.06] text-red-300 transition-colors group-hover:bg-white/10">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-md border border-white/10 bg-white/[0.06] p-3 shadow-inner">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-white">Activation Queue</p>
              <Badge variant="secondary">Manual</Badge>
            </div>
            <p className="text-xs leading-5 text-slate-400">Review payment, knowledge, approval, and embed delivery from one operations lane.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
