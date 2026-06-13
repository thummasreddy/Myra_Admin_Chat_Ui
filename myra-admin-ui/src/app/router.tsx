import { type ReactNode, useEffect } from "react";
import { Navigate, createBrowserRouter, useLocation, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthStore } from "@/features/auth/auth.store";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { AnalyticsPage } from "@/features/analytics/pages/AnalyticsPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { AdminApprovalsPage } from "@/features/onboarding/pages/AdminApprovalsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { TenantDetailPage } from "@/features/tenants/pages/TenantDetailPage";
import { TenantListPage } from "@/features/tenants/pages/TenantListPage";
import {
  ConversationsPage,
  EmailNotificationsPage,
  KnowledgeDocumentsPage,
  KnowledgePage,
  LeadsPage,
  PaymentsPage,
  SubscriptionsPage,
  TenantReviewPage
} from "@/features/admin/pages/MyraAdminOperationsPages";
import { isMyraAdmin } from "@/features/admin/admin.permissions";

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

function RedirectTenantDetailAlias() {
  const { tenantId } = useParams();
  return <Navigate to={`/tenants/${tenantId ?? ""}`} replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/myra-admin", element: <Navigate to="/dashboard" replace /> },
  { path: "/myra-admin/dashboard", element: <Navigate to="/dashboard" replace /> },
  { path: "/myra-admin/approvals", element: <Navigate to="/approvals" replace /> },
  { path: "/myra-admin/tenants", element: <Navigate to="/tenants" replace /> },
  { path: "/myra-admin/tenants/:tenantId", element: <RedirectTenantDetailAlias /> },
  { path: "/myra-admin/analytics", element: <Navigate to="/analytics" replace /> },
  { path: "/myra-admin/settings", element: <Navigate to="/settings" replace /> },
  { path: "/myra-admin/login", element: withTheme("dark", <LoginPage />, true) },
  {
    element: <ProtectedAdminRoutes />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "approvals", element: <AdminApprovalsPage /> },
      { path: "tenant-review", element: <TenantReviewPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "knowledge-documents", element: <KnowledgeDocumentsPage /> },
      { path: "subscriptions", element: <SubscriptionsPage /> },
      { path: "email-notifications", element: <EmailNotificationsPage /> },
      { path: "tenants", element: <TenantListPage /> },
      { path: "tenants/:tenantId", element: <TenantDetailPage /> },
      { path: "knowledge", element: <KnowledgePage /> },
      { path: "conversations", element: <ConversationsPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  },
  { path: "*", element: <Navigate to="/myra-admin/login" replace /> }
]);
