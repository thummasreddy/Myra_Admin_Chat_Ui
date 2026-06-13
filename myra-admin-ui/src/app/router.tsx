import { type ReactNode, useEffect } from "react";
import { Navigate, createBrowserRouter, useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthStore } from "@/features/auth/auth.store";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { AuditLogsPage } from "@/features/admin/pages/AuditLogsPage";
import { FeatureFlagsPage } from "@/features/admin/pages/FeatureFlagsPage";
import { PlansPage } from "@/features/admin/pages/PlansPage";
import { SupportDebugPage } from "@/features/admin/pages/SupportDebugPage";
import { AnalyticsPage } from "@/features/analytics/pages/AnalyticsPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { AdminApprovalsPage } from "@/features/onboarding/pages/AdminApprovalsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { TenantDetailPage } from "@/features/tenants/pages/TenantDetailPage";
import { TenantListPage } from "@/features/tenants/pages/TenantListPage";
import { isMyraAdmin, isSuperAdmin } from "@/features/admin/admin.permissions";

function ThemeRoute({ theme, children, useStoredTheme }: { theme: "light" | "dark"; children: ReactNode; useStoredTheme?: boolean }) {
  useEffect(() => {
    const storedTheme = useStoredTheme ? localStorage.getItem("myra-theme") : null;
    const nextTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : theme;
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, [theme, useStoredTheme]);

  return <>{children}</>;
}

function withTheme(theme: "light" | "dark", element: ReactNode, useStoredTheme = false) {
  return (
    <ThemeRoute theme={theme} useStoredTheme={useStoredTheme}>
      {element}
    </ThemeRoute>
  );
}

function ProtectedAdminRoutes() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/myra-admin/login" state={{ from: location }} replace />;
  }

  if (!isMyraAdmin(user)) {
    return <Navigate to="/myra-admin/login" replace />;
  }

  return <AdminLayout />;
}

function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!isSuperAdmin(user)) return <Navigate to="/myra-admin/dashboard" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/myra-admin/login" replace /> },
  { path: "/myra-admin", element: <Navigate to="/myra-admin/dashboard" replace /> },
  { path: "/myra-admin/login", element: withTheme("dark", <LoginPage />, true) },
  {
    path: "/myra-admin",
    element: <ProtectedAdminRoutes />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "tenants", element: <TenantListPage /> },
      { path: "tenants/:tenantId", element: <TenantDetailPage /> },
      { path: "approvals", element: <AdminApprovalsPage /> },
      {
        path: "plans",
        element: (
          <RequireSuperAdmin>
            <PlansPage />
          </RequireSuperAdmin>
        )
      },
      { path: "feature-flags", element: <FeatureFlagsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "audit-logs", element: <AuditLogsPage /> },
      { path: "support", element: <SupportDebugPage /> },
      {
        path: "settings",
        element: (
          <RequireSuperAdmin>
            <SettingsPage />
          </RequireSuperAdmin>
        )
      }
    ]
  },
  { path: "*", element: <Navigate to="/myra-admin/login" replace /> }
]);
