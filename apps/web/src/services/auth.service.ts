import { apiClient } from './api-client';
import type { AuthSession, LoginPayload } from '@/types';

const MOCK_OFFICER_SESSION: AuthSession = {
  user: {
    id: 'usr-001',
    fullName: 'Ananya Rao',
    email: 'ananya.rao@nlams.gov.in',
    phone: '+91 98450 12233',
    accountType: 'GOVERNMENT_OFFICER',
    role: 'LAND_ACQUISITION_OFFICER',
    designation: 'Land Acquisition Officer, Kolar District',
    organization: {
      id: 'org-001',
      name: 'Kolar District Revenue Office',
      type: 'DISTRICT_AUTHORITY',
      state: 'Karnataka',
      district: 'Kolar',
    },
  },
  tokens: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  },
};

const MOCK_AGENCY_SESSION: AuthSession = {
  user: {
    id: 'usr-002',
    fullName: 'Vikramaditya Patil',
    email: 'liaison@nhai.gov.in',
    phone: '+91 98765 43210',
    accountType: 'PIA_USER',
    role: 'PROJECT_IMPLEMENTING_AGENCY',
    designation: 'Chief Project Manager',
    organization: {
      id: 'org-002',
      name: 'National Highways Authority of India (PIU Pune)',
      type: 'PROJECT_IMPLEMENTING_AGENCY',
      state: 'Maharashtra',
      district: 'Pune',
    },
  },
  tokens: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  },
};

const MOCK_ADMIN_SESSION: AuthSession = {
  user: {
    id: 'usr-003',
    fullName: 'Dr. Rajesh Sharma',
    email: 'superadmin@nlams.gov.in',
    phone: '+91 98111 22233',
    accountType: 'GOVERNMENT_OFFICER',
    role: 'SUPER_ADMIN',
    designation: 'Chief Land Acquisition Administrator',
    organization: {
      id: 'org-003',
      name: 'Department of Land Resources (Central Ministry)',
      type: 'CENTRAL_MINISTRY',
      state: 'Delhi',
      district: 'New Delhi',
    },
  },
  tokens: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  },
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    if (!payload.email || !payload.password) {
      throw new Error('Email and password are required');
    }

    try {
      const res = await apiClient.post<any>('/auth/login', payload);
      return {
        user: {
          id: res.user.id,
          fullName: res.user.fullName,
          email: res.user.email,
          phone: res.user.phone,
          accountType: res.user.accountType,
          role: res.user.role,
          designation: res.user.designation,
          organizationId: res.user.organizationId,
          organization: res.user.organization || {
            id: res.user.organizationId || 'org-default',
            name: 'Government Authority',
            type: 'DISTRICT_AUTHORITY',
          },
          avatarUrl: res.user.avatarUrl,
        },
        tokens: {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          expiresAt: res.expiresIn || new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        },
      };
    } catch (err: any) {
      if (import.meta.env.DEV) {
        // Fallback for development if API is not yet running
        if (payload.loginType === 'AGENCY') {
          return { ...MOCK_AGENCY_SESSION, user: { ...MOCK_AGENCY_SESSION.user, email: payload.email } };
        }
        if (payload.loginType === 'ADMIN') {
          return { ...MOCK_ADMIN_SESSION, user: { ...MOCK_ADMIN_SESSION.user, email: payload.email } };
        }
        return { ...MOCK_OFFICER_SESSION, user: { ...MOCK_OFFICER_SESSION.user, email: payload.email } };
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout errors
    }
  },
};