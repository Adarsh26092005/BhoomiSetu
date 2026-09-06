import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/layouts/AppShell';
import { ROUTES } from '@/constants/routes';

// Public Pages
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { OfficerLoginPage } from '@/pages/auth/OfficerLoginPage';
import { AgencyLoginPage } from '@/pages/auth/AgencyLoginPage';
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage';
import { OfficerRegisterPage } from '@/pages/auth/OfficerRegisterPage';
import { PiaRegisterPage } from '@/pages/auth/PiaRegisterPage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';

// Administration & Onboarding Modules
import { OrganizationsPage } from '@/pages/organizations/OrganizationsPage';
import { OrganizationDetailPage } from '@/pages/organizations/OrganizationDetailPage';
import { PiaApprovalQueuePage } from '@/pages/organizations/PiaApprovalQueuePage';
import { UsersPage } from '@/pages/users/UsersPage';
import { UserDetailPage } from '@/pages/users/UserDetailPage';

// Domain Modules
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { ParcelsPage } from '@/pages/parcels/ParcelsPage';
import { ParcelDetailPage } from '@/pages/parcels/ParcelDetailPage';
import { DocumentsPage } from '@/pages/documents/DocumentsPage';
import { DocumentDetailPage } from '@/pages/documents/DocumentDetailPage';
import { GisPage } from '@/pages/gis/GisPage';
import { WorkflowPage } from '@/pages/workflow/WorkflowPage';
import { WorkflowDetailPage } from '@/pages/workflow/WorkflowDetailPage';
import { CompensationPage } from '@/pages/compensation/CompensationPage';
import { CompensationDetailPage } from '@/pages/compensation/CompensationDetailPage';
import { PossessionPage } from '@/pages/possession/PossessionPage';
import { PossessionDetailPage } from '@/pages/possession/PossessionDetailPage';
import { RehabilitationPage } from '@/pages/rehabilitation/RehabilitationPage';
import { RehabilitationDetailPage } from '@/pages/rehabilitation/RehabilitationDetailPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { AuditPage } from '@/pages/audit/AuditPage';
import { AiAssistantPage } from '@/pages/ai-assistant/AiAssistantPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Access & Portal Routes */}
      <Route path={ROUTES.home} element={<LandingPage />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.loginOfficer} element={<OfficerLoginPage />} />
      <Route path={ROUTES.loginAgency} element={<AgencyLoginPage />} />
      <Route path={ROUTES.loginAdmin} element={<AdminLoginPage />} />
      <Route path={ROUTES.registerOfficer} element={<OfficerRegisterPage />} />
      <Route path={ROUTES.registerAgency} element={<PiaRegisterPage />} />
      <Route path="/register" element={<Navigate to={ROUTES.registerOfficer} replace />} />
      <Route path="/register-agency" element={<Navigate to={ROUTES.registerAgency} replace />} />

      {/* Top-level aliases redirecting to dashboard namespace */}
      <Route path="/organizations" element={<Navigate to={ROUTES.organizations} replace />} />
      <Route path="/users" element={<Navigate to={ROUTES.users} replace />} />
      <Route path="/projects" element={<Navigate to={ROUTES.projects} replace />} />
      <Route path="/parcels" element={<Navigate to={ROUTES.parcels} replace />} />
      <Route path="/gis" element={<Navigate to={ROUTES.gis} replace />} />
      <Route path="/documents" element={<Navigate to={ROUTES.documents} replace />} />
      <Route path="/workflow" element={<Navigate to={ROUTES.workflow} replace />} />
      <Route path="/compensation" element={<Navigate to={ROUTES.compensation} replace />} />
      <Route path="/possession" element={<Navigate to={ROUTES.possession} replace />} />
      <Route path="/rehabilitation" element={<Navigate to={ROUTES.rehabilitation} replace />} />
      <Route path="/notifications" element={<Navigate to={ROUTES.notifications} replace />} />
      <Route path="/analytics" element={<Navigate to={ROUTES.analytics} replace />} />
      <Route path="/audit" element={<Navigate to={ROUTES.audit} replace />} />
      <Route path="/ai-assistant" element={<Navigate to={ROUTES.aiAssistant} replace />} />

      {/* Protected Routes inside AppShell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />

          {/* Administration Routes */}
          <Route path={ROUTES.organizations} element={<OrganizationsPage />} />
          <Route path="/dashboard/organizations/:id" element={<OrganizationDetailPage />} />
          <Route path={ROUTES.piaApprovals} element={<PiaApprovalQueuePage />} />
          <Route path={ROUTES.users} element={<UsersPage />} />
          <Route path="/dashboard/users/:id" element={<UserDetailPage />} />

          {/* Core Domain Routes */}
          <Route path={ROUTES.projects} element={<ProjectsPage />} />
          <Route path="/dashboard/projects/:id" element={<ProjectDetailPage />} />
          <Route path={ROUTES.parcels} element={<ParcelsPage />} />
          <Route path="/dashboard/parcels/:id" element={<ParcelDetailPage />} />
          <Route path={ROUTES.documents} element={<DocumentsPage />} />
          <Route path="/dashboard/documents/:id" element={<DocumentDetailPage />} />
          <Route path={ROUTES.workflow} element={<WorkflowPage />} />
          <Route path="/dashboard/workflow/:id" element={<WorkflowDetailPage />} />
          <Route path={ROUTES.compensation} element={<CompensationPage />} />
          <Route path="/dashboard/compensation/:id" element={<CompensationDetailPage />} />
          <Route path={ROUTES.possession} element={<PossessionPage />} />
          <Route path="/dashboard/possession/:id" element={<PossessionDetailPage />} />
          <Route path={ROUTES.gis} element={<GisPage />} />
          <Route path={ROUTES.rehabilitation} element={<RehabilitationPage />} />
          <Route path="/dashboard/rehabilitation/:id" element={<RehabilitationDetailPage />} />
          <Route path={ROUTES.notifications} element={<NotificationsPage />} />
          <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
          <Route path={ROUTES.audit} element={<AuditPage />} />
          <Route path={ROUTES.aiAssistant} element={<AiAssistantPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
