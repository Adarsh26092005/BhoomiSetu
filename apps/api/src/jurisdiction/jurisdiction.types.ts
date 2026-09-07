import { AccountType, AdminJurisdictionLevel, UserRole } from '@prisma/client';

export type JurisdictionScopeLevel =
  | 'CENTRAL'
  | 'STATE_AREA'
  | 'STATE'
  | 'DISTRICT'
  | 'PROJECT_RESTRICTED';

export interface EffectiveJurisdictionScope {
  userId: string;
  role: UserRole;
  accountType: AccountType;
  level: JurisdictionScopeLevel;
  jurisdictionLevel?: string;
  isCentral: boolean;
  isStateArea: boolean;
  isStateScoped: boolean;
  isDistrictScoped: boolean;
  isProjectRestricted: boolean;
  state?: string | null;
  districts: string[]; // List of permitted district names (e.g. ['Pune', 'Satara', 'Kolhapur'])
  administrativeAreaId?: string | null;
  administrativeAreaCode?: string | null;
  administrativeAreaName?: string | null;
  administrativeArea?: {
    id: string;
    code: string;
    name: string;
    state: string;
  } | null;
  adminJurisdictionLevel?: AdminJurisdictionLevel | null;
  organizationId?: string | null;
  organizationType?: string | null;
  organizationState?: string | null;
  organizationDistrict?: string | null;
  assignedProjectIds: string[];
}

export interface AdministrativeAreaResponse {
  id: string;
  code: string;
  name: string;
  state: string;
  description?: string | null;
  active: boolean;
  districts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SuperAdminAssignmentResponse {
  id: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  administrativeAreaId?: string | null;
  administrativeAreaCode?: string | null;
  administrativeAreaName?: string | null;
  jurisdictionLevel: AdminJurisdictionLevel;
  isPrimary: boolean;
  isActive: boolean;
  assignedAt: Date;
  assignedById?: string | null;
}
