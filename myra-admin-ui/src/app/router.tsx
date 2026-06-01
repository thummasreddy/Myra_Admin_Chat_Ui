import { Navigate, createBrowserRouter, useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { useAuthStore } from "@/features/auth/auth.store";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { AnalyticsPage } from "@/features/analytics/pages/AnalyticsPage";
import { ConversationsPage } from "@/features/conversations/pages/ConversationsPage";
import { CustomerAssistantSettingsPage } from "@/features/customer/pages/CustomerAssistantSettingsPage";
import { CustomerDashboardPage } from "@/features/customer/pages/CustomerDashboardPage";
import { CustomerEmbedPage } from "@/features/customer/pages/CustomerEmbedPage";
import { CustomerKnowledgePage } from "@/features/customer/pages/CustomerKnowledgePage";
import { CustomerSupportPage } from "@/features/customer/pages/CustomerSupportPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { KnowledgeBasePage } from "@/features/knowledge/pages/KnowledgeBasePage";
import { LeadsPage } from "@/features/leads/pages/LeadsPage";
import { AdminApprovalsPage } from "@/features/onboarding/pages/AdminApprovalsPage";
import { EmailNotificationsPage } from "@/features/onboarding/pages/EmailNotificationsPage";
import { KnowledgeDocumentsReviewPage } from "@/features/onboarding/pages/KnowledgeDocumentsReviewPage";
import { PaymentsPage } from "@/features/onboarding/pages/PaymentsPage";
import { SubscriptionsPage } from "@/features/onboarding/pages/SubscriptionsPage";
import { TenantReviewIndexPage } from "@/features/onboarding/pages/TenantReviewIndexPage";
import { TenantReviewPage } from "@/features/onboarding/pages/TenantReviewPage";
import { MockPaymentPage } from "@/features/public/pages/MockPaymentPage";
import { OnboardingSuccessPage } from "@/features/public/pages/OnboardingSuccessPage";
import { PricingPage } from "@/features/public/pages/PricingPage";
import { PublicLandingPage } from "@/features/public/pages/PublicLandingPage";
import { RegisterBusinessPage } from "@/features/public/pages/RegisterBusinessPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { TenantCreateWizardPage } from "@/features/tenants/pages/TenantCreateWizardPage";
import { TenantDetailPage } from "@/features/tenants/pages/TenantDetailPage";
import { TenantListPage } from "@/features/tenants/pages/TenantListPage";
import { WidgetConfigPage } from "@/features/widget/pages/WidgetConfigPage";

function ProtectedAdminRoutes() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role === "TENANT_OWNER") {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <AdminLayout />;
}

function ProtectedCustomerRoutes() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && user.role !== "TENANT_OWNER") {
    return <Navigate to="/dashboard" replace />;
  }

  return <CustomerLayout />;
}

export const router = createBrowserRouter([
  { path: "/", element: <PublicLandingPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/register", element: <RegisterBusinessPage /> },
  { path: "/mock-payment/:registrationId", element: <MockPaymentPage /> },
  { path: "/onboarding-success/:registrationId", element: <OnboardingSuccessPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedAdminRoutes />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "approvals", element: <AdminApprovalsPage /> },
      { path: "tenant-review", element: <TenantReviewIndexPage /> },
      { path: "tenant-review/:tenantId", element: <TenantReviewPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "knowledge-documents", element: <KnowledgeDocumentsReviewPage /> },
      { path: "subscriptions", element: <SubscriptionsPage /> },
      { path: "email-notifications", element: <EmailNotificationsPage /> },
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
  {
    path: "/customer",
    element: <ProtectedCustomerRoutes />,
    children: [
      { index: true, element: <Navigate to="/customer/dashboard" replace /> },
      { path: "dashboard", element: <CustomerDashboardPage /> },
      { path: "knowledge", element: <CustomerKnowledgePage /> },
      { path: "embed", element: <CustomerEmbedPage /> },
      { path: "settings", element: <CustomerAssistantSettingsPage /> },
      { path: "support", element: <CustomerSupportPage /> }
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);
