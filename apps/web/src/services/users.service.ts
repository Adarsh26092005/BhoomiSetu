import type {
  CreateProjectAssignmentInput,
  CreateUserInput,
  PaginatedUsersResponse,
  ProjectAssignmentSummary,
  UpdateProjectAssignmentInput,
  UpdateUserInput,
  UserRecord,
} from '../types/user-admin';
import { apiClient } from './api-client';

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr-superadmin-001',
    email: 'superadmin@nlams.gov.in',
    fullName: 'Dr. Rajesh Sharma, IAS',
    phone: '+91-9876543210',
    accountType: 'GOVERNMENT_OFFICER',
    role: 'SUPER_ADMIN',
    designation: 'Principal Secretary & National Nodal Administrator',
    organizationId: 'org-central-001',
    organization: {
      id: 'org-central-001',
      name: 'Ministry of Road Transport and Highways',
      code: 'MORTH-CENTRAL',
      type: 'CENTRAL_MINISTRY',
      status: 'ACTIVE',
      isActive: true,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-04T00:00:00.000Z',
    },
    isActive: true,
    lastLoginAt: '2026-09-04T06:30:00.000Z',
    projectAssignments: [
      {
        id: 'pa-001',
        projectId: 'proj-001',
        project: {
          id: 'proj-001',
          code: 'NH-48-EXP',
          title: 'Delhi-Mumbai Expressway Package 4',
          status: 'IN_PROGRESS',
          state: 'Maharashtra',
        },
        userId: 'usr-superadmin-001',
        role: 'SUPER_ADMIN',
        isActive: true,
        assignedAt: '2026-09-01T00:00:00.000Z',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-04T00:00:00.000Z',
  },
  {
    id: 'usr-lao-001',
    email: 'lao.pune@nlams.gov.in',
    fullName: 'Shri Arun Deshmukh',
    phone: '+91-9423001122',
    accountType: 'GOVERNMENT_OFFICER',
    role: 'LAND_ACQUISITION_OFFICER',
    designation: 'Sub-Divisional Magistrate & Competent Authority (CALA)',
    organizationId: 'org-dist-pune-001',
    organization: {
      id: 'org-dist-pune-001',
      name: 'District Collectorate & LAO Pune',
      code: 'DIST-PUNE-01',
      type: 'DISTRICT_AUTHORITY',
      status: 'ACTIVE',
      state: 'Maharashtra',
      district: 'Pune',
      isActive: true,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-04T00:00:00.000Z',
    },
    isActive: true,
    lastLoginAt: '2026-09-04T05:15:00.000Z',
    projectAssignments: [
      {
        id: 'pa-002',
        projectId: 'proj-002',
        project: {
          id: 'proj-002',
          code: 'PMRDA-RING-P1',
          title: 'Pune Ring Road Eastern Bypass Phase 1',
          status: 'IN_PROGRESS',
          state: 'Maharashtra',
        },
        userId: 'usr-lao-001',
        role: 'LAND_ACQUISITION_OFFICER',
        isActive: true,
        assignedAt: '2026-09-01T00:00:00.000Z',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-04T00:00:00.000Z',
  },
  {
    id: 'usr-pia-001',
    email: 'liaison.nhai@lntecc.com',
    fullName: 'Shri Vikramaditya Patil',
    phone: '+91-9820033445',
    accountType: 'PIA_USER',
    role: 'PROJECT_IMPLEMENTING_AGENCY',
    designation: 'Chief Project Manager / Nodal Agency Liaison',
    organizationId: 'org-pia-lt-001',
    organization: {
      id: 'org-pia-lt-001',
      name: 'Larsen & Toubro Infrastructure Projects Ltd',
      code: 'PIA-LT-001',
      type: 'PROJECT_IMPLEMENTING_AGENCY',
      status: 'ACTIVE',
      state: 'Maharashtra',
      district: 'Mumbai City',
      isActive: true,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-04T00:00:00.000Z',
    },
    isActive: true,
    lastLoginAt: '2026-09-03T18:40:00.000Z',
    projectAssignments: [
      {
        id: 'pa-003',
        projectId: 'proj-001',
        project: {
          id: 'proj-001',
          code: 'NH-48-EXP',
          title: 'Delhi-Mumbai Expressway Package 4',
          status: 'IN_PROGRESS',
          state: 'Maharashtra',
        },
        userId: 'usr-pia-001',
        role: 'PROJECT_IMPLEMENTING_AGENCY',
        isActive: true,
        assignedAt: '2026-09-01T00:00:00.000Z',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-04T00:00:00.000Z',
  },
  {
    id: 'usr-survey-001',
    email: 'survey.pune@nlams.gov.in',
    fullName: 'Smt. Ananya Kulkarni',
    phone: '+91-9871122334',
    accountType: 'GOVERNMENT_OFFICER',
    role: 'SURVEY_OFFICER',
    designation: 'District Inspector of Land Records (DILR)',
    organizationId: 'org-dist-pune-001',
    organization: {
      id: 'org-dist-pune-001',
      name: 'District Collectorate & LAO Pune',
      code: 'DIST-PUNE-01',
      type: 'DISTRICT_AUTHORITY',
      status: 'ACTIVE',
      state: 'Maharashtra',
      district: 'Pune',
      isActive: true,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-04T00:00:00.000Z',
    },
    isActive: true,
    lastLoginAt: '2026-09-04T04:00:00.000Z',
    projectAssignments: [],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-04T00:00:00.000Z',
  },
];

let inMemoryUsers = [...INITIAL_USERS];

export const usersService = {
  async list(params?: {
    page?: number;
    limit?: number;
    accountType?: string;
    role?: string;
    organizationId?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<PaginatedUsersResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.accountType) query.set('accountType', params.accountType);
      if (params?.role) query.set('role', params.role);
      if (params?.organizationId) query.set('organizationId', params.organizationId);
      if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
      if (params?.search) query.set('search', params.search);

      const res = await apiClient.get<any>(`/users?${query.toString()}`);
      if (res?.data?.items) return res.data;
      if (res?.items) return res;
    } catch {
      // fallback
    }

    let filtered = [...inMemoryUsers];
    if (params?.accountType && params.accountType !== 'ALL') {
      filtered = filtered.filter((u) => u.accountType === params.accountType);
    }
    if (params?.role && params.role !== 'ALL') {
      filtered = filtered.filter((u) => u.role === params.role);
    }
    if (params?.organizationId && params.organizationId !== 'ALL') {
      filtered = filtered.filter((u) => u.organizationId === params.organizationId);
    }
    if (params?.isActive !== undefined) {
      filtered = filtered.filter((u) => u.isActive === params.isActive);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.fullName.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.designation.toLowerCase().includes(s),
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      items,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  },

  async getById(id: string): Promise<UserRecord> {
    try {
      const res = await apiClient.get<any>(`/users/${id}`);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const user = inMemoryUsers.find((u) => u.id === id);
    if (!user) throw new Error(`User with ID "${id}" not found`);
    return user;
  },

  async create(input: CreateUserInput): Promise<UserRecord> {
    try {
      const res = await apiClient.post<any>('/users', input);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const newUser: UserRecord = {
      id: `usr-custom-${Date.now()}`,
      email: input.email,
      fullName: input.fullName,
      phone: input.phone || null,
      accountType: input.accountType || 'GOVERNMENT_OFFICER',
      role: input.role,
      designation: input.designation,
      organizationId: input.organizationId,
      avatarUrl: input.avatarUrl || null,
      isActive: input.isActive !== undefined ? input.isActive : true,
      lastLoginAt: null,
      projectAssignments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryUsers.unshift(newUser);
    return newUser;
  },

  async update(id: string, input: UpdateUserInput): Promise<UserRecord> {
    try {
      const res = await apiClient.patch<any>(`/users/${id}`, input);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const idx = inMemoryUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    inMemoryUsers[idx] = {
      ...inMemoryUsers[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryUsers[idx];
  },

  async activate(id: string): Promise<UserRecord> {
    try {
      const res = await apiClient.post<any>(`/users/${id}/activate`, {});
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const idx = inMemoryUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    inMemoryUsers[idx] = {
      ...inMemoryUsers[idx],
      isActive: true,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryUsers[idx];
  },

  async deactivate(id: string): Promise<UserRecord> {
    try {
      const res = await apiClient.post<any>(`/users/${id}/deactivate`, {});
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const idx = inMemoryUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    inMemoryUsers[idx] = {
      ...inMemoryUsers[idx],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryUsers[idx];
  },

  // Project Assignments
  async getProjectAssignments(userId: string): Promise<ProjectAssignmentSummary[]> {
    try {
      const res = await apiClient.get<any>(`/users/${userId}/project-assignments`);
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res)) return res;
    } catch {
      // fallback
    }

    const user = inMemoryUsers.find((u) => u.id === userId);
    return user?.projectAssignments || [];
  },

  async assignProject(
    userId: string,
    input: CreateProjectAssignmentInput,
  ): Promise<ProjectAssignmentSummary> {
    try {
      const res = await apiClient.post<any>(`/users/${userId}/project-assignments`, input);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const assignment: ProjectAssignmentSummary = {
      id: `pa-${Date.now()}`,
      projectId: input.projectId,
      project: {
        id: input.projectId,
        code: `PRJ-${input.projectId.slice(-4).toUpperCase()}`,
        title: `Assigned Infrastructure Project (${input.projectId})`,
        status: 'IN_PROGRESS',
        state: 'Maharashtra',
      },
      userId,
      role: input.role,
      isActive: input.isActive !== undefined ? input.isActive : true,
      assignedAt: new Date().toISOString(),
    };

    const user = inMemoryUsers.find((u) => u.id === userId);
    if (user) {
      if (!user.projectAssignments) user.projectAssignments = [];
      user.projectAssignments.unshift(assignment);
    }

    return assignment;
  },

  async updateProjectAssignment(
    userId: string,
    assignmentId: string,
    input: UpdateProjectAssignmentInput,
  ): Promise<ProjectAssignmentSummary> {
    try {
      const res = await apiClient.patch<any>(
        `/users/${userId}/project-assignments/${assignmentId}`,
        input,
      );
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const user = inMemoryUsers.find((u) => u.id === userId);
    if (user && user.projectAssignments) {
      const idx = user.projectAssignments.findIndex((a) => a.id === assignmentId);
      if (idx !== -1) {
        user.projectAssignments[idx] = {
          ...user.projectAssignments[idx],
          ...input,
        };
        return user.projectAssignments[idx];
      }
    }

    throw new Error('Assignment not found');
  },

  async deactivateProjectAssignment(
    userId: string,
    assignmentId: string,
  ): Promise<ProjectAssignmentSummary> {
    try {
      const res = await apiClient.post<any>(
        `/users/${userId}/project-assignments/${assignmentId}/deactivate`,
        {},
      );
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    return this.updateProjectAssignment(userId, assignmentId, { isActive: false });
  },
};
