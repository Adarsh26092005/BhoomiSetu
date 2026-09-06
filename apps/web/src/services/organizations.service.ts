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

// Initial baseline mock data for frontend preview & resilience
const INITIAL_ORGS: OrganizationRecord[] = [
  {
    id: 'org-central-001',
    code: 'MORTH-CENTRAL',
    name: 'Ministry of Road Transport and Highways',
    type: 'CENTRAL_MINISTRY',
    status: 'ACTIVE',
    state: null,
    district: null,
    jurisdiction: {
      officeAddress: 'Transport Bhawan, 1 Parliament Street, New Delhi - 110001',
      nodalOfficerName: 'Dr. Alok Ranjan',
      nodalOfficerEmail: 'contact@morth.gov.in',
    },
    parentId: null,
    isActive: true,
    userCount: 14,
    projectCount: 6,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-04T00:00:00.000Z',
  },
  {
    id: 'org-state-mah-001',
    code: 'MSRDC-STATE',
    name: 'Maharashtra State Road Development Corporation',
    type: 'STATE_AUTHORITY',
    status: 'ACTIVE',
    state: 'Maharashtra',
    district: null,
    jurisdiction: {
      officeAddress: 'Nepean Sea Road, Priyadarshini Park, Mumbai - 400036',
      jurisdictionState: 'Maharashtra',
      nodalOfficerName: 'Radheshyam Mopalwar',
      nodalOfficerEmail: 'admin@msrdc.in',
    },
    parentId: 'org-central-001',
    isActive: true,
    userCount: 9,
    projectCount: 4,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-04T00:00:00.000Z',
  },
  {
    id: 'org-dist-pune-001',
    code: 'DIST-PUNE-01',
    name: 'District Collectorate & LAO Pune',
    type: 'DISTRICT_AUTHORITY',
    status: 'ACTIVE',
    state: 'Maharashtra',
    district: 'Pune',
    jurisdiction: {
      officeAddress: 'Collector Office, Station Road, Pune - 411001',
      jurisdictionState: 'Maharashtra',
      jurisdictionDistricts: ['Pune', 'Haveli', 'Maval', 'Khed'],
      nodalOfficerName: 'Dr. Suhas Diwase',
      nodalOfficerEmail: 'collector.pune@maharashtra.gov.in',
    },
    parentId: 'org-state-mah-001',
    isActive: true,
    userCount: 8,
    projectCount: 3,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-04T00:00:00.000Z',
  },
  {
    id: 'org-pia-lt-001',
    code: 'PIA-LT-001',
    name: 'Larsen & Toubro Infrastructure Projects Ltd',
    type: 'PROJECT_IMPLEMENTING_AGENCY',
    status: 'ACTIVE',
    state: 'Maharashtra',
    district: 'Mumbai City',
    jurisdiction: {
      officeAddress: 'L&T House, N.M. Marg, Ballard Estate, Mumbai - 400001',
      nodalOfficerName: 'S.N. Subrahmanyan',
      nodalOfficerEmail: 'infra.operations@lntecc.com',
    },
    parentId: null,
    isActive: true,
    userCount: 6,
    projectCount: 3,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-04T00:00:00.000Z',
  },
  {
    id: 'org-pia-pending-001',
    code: 'PIA-DILIP-2026',
    name: 'Dilip Buildcon Expressway Infrastructure Ltd',
    type: 'PROJECT_IMPLEMENTING_AGENCY',
    status: 'PENDING_APPROVAL',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    jurisdiction: {
      officeAddress: 'Plot No. 5, Inside Govind Narayan Singh Gate, Chuna Bhatti, Bhopal - 462016',
      nodalOfficerName: 'Dilip Suryavanshi',
      nodalOfficerEmail: 'compliance@dilipbuildcon.com',
      metadata: {
        cinNumber: 'L45201MP2006PLC018689',
        panNumber: 'AABCD1234E',
        authorizedBidRef: 'NHAI/Tech/2026/PKG-4',
      },
    },
    parentId: null,
    isActive: false,
    userCount: 1,
    projectCount: 0,
    createdAt: '2026-09-03T10:15:00.000Z',
    updatedAt: '2026-09-03T10:15:00.000Z',
  },
  {
    id: 'org-pia-pending-002',
    code: 'PIA-GMR-2026',
    name: 'GMR Highways Regional Concessionaire Pvt Ltd',
    type: 'PROJECT_IMPLEMENTING_AGENCY',
    status: 'PENDING_APPROVAL',
    state: 'Delhi',
    district: 'New Delhi',
    jurisdiction: {
      officeAddress: 'New Udaan Bhawan, Opp. Terminal 3, IGI Airport, New Delhi - 110037',
      nodalOfficerName: 'Kiran Kumar Grandhi',
      nodalOfficerEmail: 'approvals@gmrgroup.in',
      metadata: {
        cinNumber: 'U45203DL2007PTC160000',
        authorizedBidRef: 'DFCCIL/WDFC/2026/REV-1',
      },
    },
    parentId: null,
    isActive: false,
    userCount: 1,
    projectCount: 0,
    createdAt: '2026-09-04T08:30:00.000Z',
    updatedAt: '2026-09-04T08:30:00.000Z',
  },
];

let inMemoryOrgs = [...INITIAL_ORGS];

export const organizationsService = {
  async list(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    state?: string;
    search?: string;
  }): Promise<PaginatedOrganizationsResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.type) query.set('type', params.type);
      if (params?.status) query.set('status', params.status);
      if (params?.state) query.set('state', params.state);
      if (params?.search) query.set('search', params.search);

      const res = await apiClient.get<any>(`/organizations?${query.toString()}`);
      if (res?.data?.items) {
        return res.data;
      }
      if (res?.items) {
        return res;
      }
    } catch {
      // fallback to in-memory filter
    }

    let filtered = [...inMemoryOrgs];
    if (params?.type && params.type !== 'ALL') {
      filtered = filtered.filter((o) => o.type === params.type);
    }
    if (params?.status && params.status !== 'ALL') {
      filtered = filtered.filter((o) => o.status === params.status);
    }
    if (params?.state && params.state !== 'ALL') {
      filtered = filtered.filter((o) => o.state === params.state);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.name.toLowerCase().includes(s) ||
          (o.code && o.code.toLowerCase().includes(s)) ||
          (o.district && o.district.toLowerCase().includes(s)),
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

  async getById(id: string): Promise<OrganizationRecord> {
    try {
      const res = await apiClient.get<any>(`/organizations/${id}`);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const org = inMemoryOrgs.find((o) => o.id === id);
    if (!org) throw new Error(`Organization with ID "${id}" not found`);
    return org;
  },

  async create(input: CreateOrganizationInput): Promise<OrganizationRecord> {
    try {
      const res = await apiClient.post<any>('/organizations', input);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const newOrg: OrganizationRecord = {
      id: `org-custom-${Date.now()}`,
      code: input.code || `ORG-${Date.now().toString().slice(-4)}`,
      name: input.name,
      type: input.type,
      status: 'ACTIVE',
      state: input.state || null,
      district: input.district || null,
      jurisdiction: {
        officeAddress: input.officeAddress,
        jurisdictionDistricts: input.jurisdictionDistricts,
      },
      parentId: input.parentId || null,
      isActive: true,
      userCount: 0,
      projectCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryOrgs.unshift(newOrg);
    return newOrg;
  },

  async update(id: string, input: UpdateOrganizationInput): Promise<OrganizationRecord> {
    try {
      const res = await apiClient.patch<any>(`/organizations/${id}`, input);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const idx = inMemoryOrgs.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Organization not found');
    inMemoryOrgs[idx] = {
      ...inMemoryOrgs[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryOrgs[idx];
  },

  async registerPia(input: PiaRegistrationInput): Promise<{ message: string; organization: OrganizationRecord }> {
    try {
      const res = await apiClient.post<any>('/organizations/pia/register', input);
      if (res?.data?.organization) return res.data;
    } catch {
      // fallback
    }

    const newPiaOrg: OrganizationRecord = {
      id: `org-pia-${Date.now()}`,
      code: input.registrationCode || `PIA-${Date.now().toString().slice(-4)}`,
      name: input.organizationName,
      type: 'PROJECT_IMPLEMENTING_AGENCY',
      status: 'PENDING_APPROVAL',
      state: input.state || null,
      district: input.district || null,
      jurisdiction: {
        officeAddress: input.officeAddress,
        nodalOfficerName: input.adminFullName,
        nodalOfficerEmail: input.adminEmail,
      },
      parentId: null,
      isActive: false,
      userCount: 1,
      projectCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryOrgs.unshift(newPiaOrg);

    return {
      message: 'Registration submitted successfully. Application is pending government administrative verification.',
      organization: newPiaOrg,
    };
  },

  async registerOfficer(input: OfficerRegistrationInput): Promise<{ message: string; organization: OrganizationRecord; user: any }> {
    try {
      const res = await apiClient.post<any>('/organizations/officer/register', input);
      if (res?.organization) return res;
      if (res?.data?.organization) return res.data;
    } catch (err) {
      if (!import.meta.env.DEV) throw err;
    }

    const newOfficerOrg: OrganizationRecord = {
      id: `org-gov-${Date.now()}`,
      code: `GOV-${Date.now().toString().slice(-4)}`,
      name: input.departmentName,
      type: input.organizationType,
      status: 'PENDING_APPROVAL',
      state: input.state || null,
      district: input.district || null,
      jurisdiction: {
        officeAddress: input.officeAddress,
        nodalOfficerName: input.fullName,
        nodalOfficerEmail: input.email,
        metadata: input.jurisdiction || {},
      },
      parentId: null,
      isActive: false,
      userCount: 1,
      projectCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryOrgs.unshift(newOfficerOrg);

    return {
      message: 'Officer access request submitted successfully. Application is pending administrative verification.',
      organization: newOfficerOrg,
      user: {
        id: `usr-${Date.now()}`,
        email: input.email,
        fullName: input.fullName,
        role: input.requestedRole,
        accountType: 'GOVERNMENT_OFFICER',
        isActive: false,
      },
    };
  },

  async approvePia(id: string, action: OrganizationActionInput): Promise<OrganizationRecord> {
    try {
      const res = await apiClient.post<any>(`/organizations/${id}/approve`, action);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const idx = inMemoryOrgs.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Organization not found');
    inMemoryOrgs[idx] = {
      ...inMemoryOrgs[idx],
      status: 'ACTIVE',
      isActive: true,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryOrgs[idx];
  },

  async rejectPia(id: string, action: OrganizationActionInput): Promise<OrganizationRecord> {
    try {
      const res = await apiClient.post<any>(`/organizations/${id}/reject`, action);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const idx = inMemoryOrgs.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Organization not found');
    inMemoryOrgs[idx] = {
      ...inMemoryOrgs[idx],
      status: 'REJECTED',
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryOrgs[idx];
  },

  async suspend(id: string, action: OrganizationActionInput): Promise<OrganizationRecord> {
    try {
      const res = await apiClient.post<any>(`/organizations/${id}/suspend`, action);
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const idx = inMemoryOrgs.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Organization not found');
    inMemoryOrgs[idx] = {
      ...inMemoryOrgs[idx],
      status: 'SUSPENDED',
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryOrgs[idx];
  },

  async activate(id: string): Promise<OrganizationRecord> {
    try {
      const res = await apiClient.post<any>(`/organizations/${id}/activate`, {});
      if (res?.data) return res.data;
      if (res?.id) return res;
    } catch {
      // fallback
    }

    const idx = inMemoryOrgs.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Organization not found');
    inMemoryOrgs[idx] = {
      ...inMemoryOrgs[idx],
      status: 'ACTIVE',
      isActive: true,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryOrgs[idx];
  },
};
