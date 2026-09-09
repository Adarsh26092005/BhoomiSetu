import type {
  CreateOrganizationInput,
  OfficerRegistrationInput,
  OrganizationActionInput,
  OrganizationRecord,
  PaginatedOrganizationsResponse,
  PiaRegistrationInput,
  UpdateOrganizationInput,
} from '../types/organization';
import { apiClient } from './api-client';


export const organizationsService = {
  async list(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    state?: string;
    search?: string;
  }): Promise<PaginatedOrganizationsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.type && params.type !== 'ALL') query.set('type', params.type);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.state && params.state !== 'ALL') query.set('state', params.state);
    if (params?.search) query.set('search', params.search);

    try {
      const res = await apiClient.get<any>(`/organizations?${query.toString()}`);
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
      console.error('Failed to list organizations from API:', err);
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

  async getById(id: string): Promise<OrganizationRecord> {
    const res = await apiClient.get<any>(`/organizations/${id}`);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async create(input: CreateOrganizationInput): Promise<OrganizationRecord> {
    const res = await apiClient.post<any>('/organizations', input);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async update(id: string, input: UpdateOrganizationInput): Promise<OrganizationRecord> {
    const res = await apiClient.patch<any>(`/organizations/${id}`, input);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async registerPia(input: PiaRegistrationInput): Promise<{ message: string; organization: OrganizationRecord }> {
    const res = await apiClient.post<any>('/organizations/pia/register', input);
    if (res?.organization) return res;
    if (res?.data?.organization) return res.data;
    return res;
  },

  async registerOfficer(input: OfficerRegistrationInput): Promise<{ message: string; organization: OrganizationRecord; user: any }> {
    const res = await apiClient.post<any>('/organizations/officer/register', input);
    if (res?.organization) return res;
    if (res?.data?.organization) return res.data;
    return res;
  },

  async approvePia(id: string, action: OrganizationActionInput): Promise<OrganizationRecord> {
    const res = await apiClient.post<any>(`/organizations/${id}/approve`, action);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async rejectPia(id: string, action: OrganizationActionInput): Promise<OrganizationRecord> {
    const res = await apiClient.post<any>(`/organizations/${id}/reject`, action);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async suspend(id: string, action: OrganizationActionInput): Promise<OrganizationRecord> {
    const res = await apiClient.post<any>(`/organizations/${id}/suspend`, action);
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },

  async activate(id: string): Promise<OrganizationRecord> {
    const res = await apiClient.post<any>(`/organizations/${id}/activate`, {});
    if (res?.data) return res.data;
    if (res?.id) return res;
    return res;
  },
};
