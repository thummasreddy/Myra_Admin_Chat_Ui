import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const lightAdminRoutePrefixes = [
  "/approvals",
  "/tenant-review",
  "/payments",
  "/knowledge-documents",
  "/subscriptions",
  "/email-notifications"
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const useLightTheme = lightAdminRoutePrefixes.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", useLightTheme ? "light" : "dark");
  }, [useLightTheme]);

  return (
    <div className="admin-shell min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
