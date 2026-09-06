import type { AccountType, OrganizationStatus, OrganizationType, UserRole } from './auth';

export type { AccountType, OrganizationStatus, OrganizationType, UserRole };

export interface ProjectAssignmentSummary {
  id: string;
  projectId: string;
  project?: {
    id: string;
    code: string;
    title: string;
    status: string;
    state: string;
  };
  userId: string;
  role: UserRole;
  assignedById?: string | null;
  isActive: boolean;
  assignedAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  accountType: AccountType;
  role: UserRole;
  designation: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    code?: string | null;
    type: OrganizationType;
    status: OrganizationStatus;
    state?: string | null;
    district?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  avatarUrl?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  projectAssignments?: ProjectAssignmentSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsersResponse {
  items: UserRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserInput {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  accountType?: AccountType;
  role: UserRole;
  designation: string;
  organizationId: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  accountType?: AccountType;
  role?: UserRole;
  designation?: string;
  organizationId?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface CreateProjectAssignmentInput {
  projectId: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateProjectAssignmentInput {
  role?: UserRole;
  isActive?: boolean;
}
