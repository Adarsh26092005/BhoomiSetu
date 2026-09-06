import type { OrganizationStatus, OrganizationType } from './auth';

export type { OrganizationStatus, OrganizationType };

export interface OrganizationRecord {
  id: string;
  code?: string | null;
  name: string;
  type: OrganizationType;
  status: OrganizationStatus;
  state?: string | null;
  district?: string | null;
  jurisdiction?: {
    officeAddress?: string;
    jurisdictionState?: string;
    jurisdictionDistricts?: string[];
    nodalOfficerName?: string;
    nodalOfficerEmail?: string;
    metadata?: Record<string, any>;
  } | null;
  parentId?: string | null;
  parent?: {
    id: string;
    name: string;
    code?: string | null;
    type: OrganizationType;
  } | null;
  children?: Array<{
    id: string;
    name: string;
    code?: string | null;
    type: OrganizationType;
    status: OrganizationStatus;
  }>;
  isActive: boolean;
  userCount?: number;
  projectCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrganizationsResponse {
  items: OrganizationRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateOrganizationInput {
  name: string;
  code?: string;
  type: OrganizationType;
  state?: string;
  district?: string;
  parentId?: string;
  officeAddress?: string;
  jurisdictionDistricts?: string[];
}

export interface UpdateOrganizationInput {
  name?: string;
  code?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;
  state?: string;
  district?: string;
  parentId?: string;
  jurisdiction?: any;
}

export interface PiaRegistrationInput {
  organizationName: string;
  registrationCode?: string;
  state?: string;
  district?: string;
  officeAddress?: string;
  adminFullName: string;
  adminEmail: string;
  adminPhone?: string;
  adminDesignation: string;
  adminPassword: string;
}

export interface OfficerRegistrationInput {
  fullName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  designation: string;
  departmentName: string;
  organizationType: OrganizationType;
  state: string;
  district?: string;
  officeAddress?: string;
  requestedRole: string;
  password: string;
  jurisdiction?: Record<string, any>;
}

export interface OrganizationActionInput {
  remarks?: string;
  rejectionReason?: string;
  suspensionReason?: string;
}
