import { Navigate, createBrowserRouter, useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthStore } from "@/features/auth/auth.store";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { AnalyticsPage } from "@/features/analytics/pages/AnalyticsPage";
import { ConversationsPage } from "@/features/conversations/pages/ConversationsPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { KnowledgeBasePage } from "@/features/knowledge/pages/KnowledgeBasePage";
import { LeadsPage } from "@/features/leads/pages/LeadsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { TenantCreateWizardPage } from "@/features/tenants/pages/TenantCreateWizardPage";
import { TenantDetailPage } from "@/features/tenants/pages/TenantDetailPage";
import { TenantListPage } from "@/features/tenants/pages/TenantListPage";
import { WidgetConfigPage } from "@/features/widget/pages/WidgetConfigPage";

function ProtectedRoutes() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AdminLayout />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <ProtectedRoutes />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "tenants", element: <TenantListPage /> },
      { path: "tenants/new", element: <TenantCreateWizardPage /> },
      { path: "tenants/:tenantId", element: <TenantDetailPage /> },
      { path: "knowledge", element: <KnowledgeBasePage /> },
      { path: "widget/:tenantId", element: <WidgetConfigPage /> },
      { path: "conversations", element: <ConversationsPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> }
]);
