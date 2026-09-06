import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  MapPinned,
  Landmark,
  Map,
  FileStack,
  GitBranch,
  Wallet,
  ClipboardCheck,
  Home,
  Sparkles,
  BarChart3,
  Bell,
  ShieldCheck,
  Settings,
  Building2,
  UserCheck2,
  Users,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  roles?: string[];
}

export const ADMIN_NAV: NavItem[] = [
  {
    label: 'Organizations',
    path: ROUTES.organizations,
    icon: Building2,
  },
  {
    label: 'PIA Approvals',
    path: ROUTES.piaApprovals,
    icon: UserCheck2,
    badge: 'Pending',
  },
  {
    label: 'Users Directory',
    path: ROUTES.users,
    icon: Users,
  },
];

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', path: ROUTES.dashboard, icon: LayoutGrid },
  { label: 'Projects', path: ROUTES.projects, icon: Landmark },
  { label: 'Land Parcels', path: ROUTES.parcels, icon: MapPinned },
  { label: 'GIS Cadastre', path: ROUTES.gis, icon: Map },
  { label: 'Documents', path: ROUTES.documents, icon: FileStack },
  { label: 'Workflow & Approvals', path: ROUTES.workflow, icon: GitBranch },
  { label: 'Compensation', path: ROUTES.compensation, icon: Wallet },
  { label: 'Possession', path: ROUTES.possession, icon: ClipboardCheck },
  { label: 'Rehabilitation & R&R', path: ROUTES.rehabilitation, icon: Home },
  { label: 'AI Assistant', path: ROUTES.aiAssistant, icon: Sparkles, badge: 'AI' },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: 'Analytics & Reports', path: ROUTES.analytics, icon: BarChart3 },
  { label: 'Notifications', path: ROUTES.notifications, icon: Bell, badge: '4' },
  { label: 'Audit Trail', path: ROUTES.audit, icon: ShieldCheck },
  { label: 'Settings', path: ROUTES.settings, icon: Settings },
];