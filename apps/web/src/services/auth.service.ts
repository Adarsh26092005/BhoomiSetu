import { apiClient } from './api-client';
import type { AuthSession, EffectiveJurisdictionScope, LoginPayload } from '@/types';

export const authService = {
  async getMyScope(): Promise<EffectiveJurisdictionScope> {
    return apiClient.get<EffectiveJurisdictionScope>('/jurisdiction/my-scope');
  },

  async login(payload: LoginPayload): Promise<AuthSession> {
    if (!payload.email || !payload.password) {
      throw new Error('Email and password are required');
    }

    try {
      const res = await apiClient.post<any>('/auth/login', payload);

      // Save token temporarily so subsequent scope request is authenticated
      if (res.accessToken) {
        localStorage.setItem('nlams_access_token', res.accessToken);
      }

      let effectiveScope: EffectiveJurisdictionScope | null = null;
      try {
        effectiveScope = await this.getMyScope();
      } catch (scopeErr) {
        console.warn('Could not retrieve effective jurisdiction scope immediately:', scopeErr);
      }

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
            name: effectiveScope?.isStateArea
              ? `${effectiveScope.state} Authority`
              : 'Government Authority',
            type: 'DISTRICT_AUTHORITY',
            state: effectiveScope?.state || null,
          },
          avatarUrl: res.user.avatarUrl,
          effectiveScope,
        },
        tokens: {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          expiresAt: res.expiresIn || new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        },
      };
    } catch (err: any) {
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('nlams_access_token');
    }
  },
};