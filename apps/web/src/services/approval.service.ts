import { apiClient } from './api-client';

export interface ApprovalRequestRecord {
  id: string;
  requestType: 'OFFICER_REGISTRATION' | 'PIA_REGISTRATION' | 'LAND_ACQUISITION_REQUEST';
  requesterUserId?: string | null;
  requesterUser?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: string;
    designation: string;
  } | null;
  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
    code?: string | null;
    type: string;
    status: string;
    state?: string | null;
    district?: string | null;
  } | null;
  state: string;
  district?: string | null;
  administrativeAreaId?: string | null;
  administrativeArea?: {
    id: string;
    code: string;
    name: string;
    state: string;
  } | null;
  assignedApproverId?: string | null;
  reviewedById?: string | null;
  reviewedBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ON_HOLD';
  submittedAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequestsResponse {
  items: ApprovalRequestRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const approvalService = {
  async listApprovalRequests(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApprovalRequestsResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = queryString ? `/approval-requests?${queryString}` : '/approval-requests';
    return apiClient.get<ApprovalRequestsResponse>(endpoint);
  },

  async getApprovalRequest(id: string): Promise<ApprovalRequestRecord> {
    return apiClient.get<ApprovalRequestRecord>(`/approval-requests/${id}`);
  },

  async approveRequest(
    id: string,
    dto: { remarks?: string },
  ): Promise<ApprovalRequestRecord> {
    return apiClient.post<ApprovalRequestRecord>(`/approval-requests/${id}/approve`, dto);
  },

  async rejectRequest(
    id: string,
    dto: { rejectionReason?: string; remarks?: string },
  ): Promise<ApprovalRequestRecord> {
    return apiClient.post<ApprovalRequestRecord>(`/approval-requests/${id}/reject`, dto);
  },

  async holdRequest(
    id: string,
    dto: { remarks?: string; rejectionReason?: string },
  ): Promise<ApprovalRequestRecord> {
    return apiClient.post<ApprovalRequestRecord>(`/approval-requests/${id}/hold`, dto);
  },
};
