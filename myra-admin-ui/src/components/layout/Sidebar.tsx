import { NavLink } from "react-router-dom";
import {
  BarChart3,
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
        className={cn("fixed inset-x-0 bottom-0 top-14 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden", open ? "block" : "hidden")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-14 z-40 flex w-[240px] flex-col border-r border-[#0A2A6B] bg-[#001235] transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-12 items-center justify-between border-b border-[#0A2A6B] px-3 lg:hidden">
          <p className="text-sm font-semibold text-white">Navigation</p>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:bg-[#0A2A6B] hover:text-white" onClick={onClose} aria-label="Close navigation">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[#C89A4B] bg-[#0A2A6B] text-white"
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
