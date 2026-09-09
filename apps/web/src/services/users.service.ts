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
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.accountType && params.accountType !== 'ALL') query.set('accountType', params.accountType);
    if (params?.role && params.role !== 'ALL') query.set('role', params.role);
    if (params?.organizationId && params.organizationId !== 'ALL') query.set('organizationId', params.organizationId);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.search) query.set('search', params.search);

    try {
      const res = await apiClient.get<any>(`/users?${query.toString()}`);
      if (res?.items) return res;
      if (res?.data?.items) return res.data;
      if (Array.isArray(res)) {
        return {
          items: res,
          total: res.length,
          page: params?.page || 1,
          limit: params?.limit || 20,
          totalPages: Math.ceil(res.length / (params?.limit || 20)) || 1,
        };
      }
    } catch (err) {
      console.error('Failed to list users from API:', err);
      throw err;
    }

    return {
      items: [],
      total: 0,
      page: params?.page || 1,
      limit: params?.limit || 20,
      totalPages: 1,
    };
  },

  async getById(id: string): Promise<UserRecord> {
    const res = await apiClient.get<any>(`/users/${id}`);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async create(input: CreateUserInput): Promise<UserRecord> {
    const res = await apiClient.post<any>('/users', input);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async update(id: string, input: UpdateUserInput): Promise<UserRecord> {
    const res = await apiClient.patch<any>(`/users/${id}`, input);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async activate(id: string): Promise<UserRecord> {
    const res = await apiClient.post<any>(`/users/${id}/activate`, {});
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async deactivate(id: string): Promise<UserRecord> {
    const res = await apiClient.post<any>(`/users/${id}/deactivate`, {});
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  // Project Assignments
  async getProjectAssignments(userId: string): Promise<ProjectAssignmentSummary[]> {
    const res = await apiClient.get<any>(`/users/${userId}/project-assignments`);
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  },

  async assignProject(
    userId: string,
    input: CreateProjectAssignmentInput,
  ): Promise<ProjectAssignmentSummary> {
    const res = await apiClient.post<any>(`/users/${userId}/project-assignments`, input);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async updateProjectAssignment(
    userId: string,
    assignmentId: string,
    input: UpdateProjectAssignmentInput,
  ): Promise<ProjectAssignmentSummary> {
    const res = await apiClient.patch<any>(
      `/users/${userId}/project-assignments/${assignmentId}`,
      input,
    );
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async deactivateProjectAssignment(
    userId: string,
    assignmentId: string,
  ): Promise<ProjectAssignmentSummary> {
    const res = await apiClient.post<any>(
      `/users/${userId}/project-assignments/${assignmentId}/deactivate`,
      {},
    );
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },
};
