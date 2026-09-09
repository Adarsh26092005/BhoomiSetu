export type UserRole =
  | 'SUPER_ADMIN'
  | 'CENTRAL_OFFICER'
  | 'STATE_OFFICER'
  | 'DISTRICT_OFFICER'
  | 'PROJECT_IMPLEMENTING_AGENCY'
  | 'LAND_ACQUISITION_OFFICER'
  | 'SURVEY_OFFICER'
  | 'REVENUE_OFFICER'
  | 'VERIFICATION_OFFICER'
  | 'FINANCE_OFFICER'
  | 'R_AND_R_OFFICER'
  | 'VIEWER';

export type Role = UserRole;

export type AccountType = 'GOVERNMENT_OFFICER' | 'PIA_USER';

export type OrganizationType =
  | 'CENTRAL_MINISTRY'
  | 'STATE_AUTHORITY'
  | 'DISTRICT_AUTHORITY'
  | 'PROJECT_IMPLEMENTING_AGENCY';

export type OrgType = OrganizationType;

export type OrganizationStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED';

export interface Organization {
  id: string;
  name: string;
  code?: string | null;
  type: OrganizationType;
  status?: OrganizationStatus;
  state?: string | null;
  district?: string | null;
  isActive?: boolean;
}

export interface AdministrativeArea {
  id: string;
  code: string;
  name: string;
  state: string;
  description?: string | null;
  districts?: string[];
}

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
  isNational?: boolean;
  isStateArea: boolean;
  isStateScoped: boolean;
  isDistrictScoped: boolean;
  isProjectRestricted: boolean;
  state?: string | null;
  districts: string[];
  district?: string | null;
  administrativeAreaId?: string | null;
  administrativeAreaCode?: string | null;
  administrativeAreaName?: string | null;
  areaCode?: string | null;
  areaName?: string | null;
  administrativeArea?: AdministrativeArea | null;
  adminJurisdictionLevel?: string | null;
  organizationId?: string | null;
  organizationType?: string | null;
  organizationState?: string | null;
  organizationDistrict?: string | null;
  assignedProjectIds: string[];
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  accountType?: AccountType;
  role: Role;
  designation: string;
  organizationId?: string;
  organization: Organization;
  avatarUrl?: string | null;
  effectiveScope?: EffectiveJurisdictionScope | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
  loginType?: 'OFFICER' | 'AGENCY' | 'ADMIN';
}