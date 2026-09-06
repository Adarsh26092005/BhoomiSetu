import { MOCK_PROJECTS } from '@/mock/projects';
import type {
  AcquisitionProject,
  CreateProjectPayload,
  KpiSummary,
  ProjectQueryParams,
  ProjectSummaryKpis,
  ProjectTimelineEvent,
  UpdateProjectPayload,
  UpdateProjectStatusPayload,
} from '@/types';
import { apiClient } from './api-client';

const IS_DEV = import.meta.env.DEV;

// In-memory fallback dataset for offline development / preview
let inMemoryProjects: AcquisitionProject[] = [...MOCK_PROJECTS];

function mapBackendToAcquisitionProject(raw: any): AcquisitionProject {
  const agencyName =
    typeof raw.implementingAgency === 'object' && raw.implementingAgency?.name
      ? raw.implementingAgency.name
      : typeof raw.implementingAgency === 'string'
        ? raw.implementingAgency
        : raw.implementingAgencyOrg?.name || 'Implementing Agency';

  const defaultTimeline: ProjectTimelineEvent[] = [
    { id: '1', stage: 'DRAFT', label: 'Section 4 SIA Draft Initiated', date: raw.createdAt || '2026-03-01', completed: true },
    { id: '2', stage: 'SUBMITTED', label: 'Proposal Submitted for Review', date: '2026-03-10', completed: raw.status !== 'DRAFT' },
    { id: '3', stage: 'UNDER_SCRUTINY', label: 'Preliminary Scrutiny', date: '2026-03-20', completed: raw.status !== 'DRAFT' && raw.status !== 'SUBMITTED' },
    { id: '4', stage: 'DOCUMENT_VERIFICATION', label: 'Cadastral & Title Verification', date: '2026-04-05', completed: false },
    { id: '5', stage: 'DISTRICT_APPROVAL', label: 'Collectorate Statutory Clearance', date: '2026-04-20', completed: false },
    { id: '6', stage: 'NOTIFICATION_ISSUED', label: 'Section 11 Preliminary Notification Issued', date: raw.notifiedOn || '2026-05-01', completed: false },
    { id: '7', stage: 'AWARD_DECLARED', label: 'Section 23 Statutory Award Declared', date: '2026-08-15', completed: false },
    { id: '8', stage: 'COMPENSATION_DISBURSED', label: 'PFMS Direct Benefit Disbursement', date: '2026-11-30', completed: false },
    { id: '9', stage: 'POSSESSION_COMPLETED', label: 'Section 38 Statutory Land Handover', date: raw.targetCompletionOn || '2027-06-30', completed: false },
  ];

  return {
    id: raw.id,
    code: raw.code,
    title: raw.title,
    description: raw.description || null,
    category: raw.category,
    status: raw.status,
    implementingAgencyOrgId: raw.implementingAgencyOrgId,
    implementingAgency: agencyName,
    state: raw.state,
    districts: Array.isArray(raw.districts) ? raw.districts : [],
    totalAreaHectares: Number(raw.totalAreaHectares) || 0,
    parcelCount: raw.parcelCount ?? raw._count?.parcels ?? 0,
    affectedLandowners: raw.affectedLandowners ?? raw.affectedHouseholdCount ?? raw._count?.affectedHouseholds ?? 0,
    affectedHouseholdCount: raw.affectedHouseholdCount ?? raw._count?.affectedHouseholds ?? 0,
    documentCount: raw.documentCount ?? raw._count?.documents ?? 0,
    workflowTaskCount: raw.workflowTaskCount ?? raw._count?.workflowTasks ?? 0,
    estimatedCompensationInr: Number(raw.estimatedCompensationInr) || 0,
    disbursedCompensationInr: Number(raw.disbursedCompensationInr) || 0,
    notifiedOn: raw.notifiedOn ? new Date(raw.notifiedOn).toISOString().split('T')[0] : '2026-03-01',
    targetCompletionOn: raw.targetCompletionOn ? new Date(raw.targetCompletionOn).toISOString().split('T')[0] : '2028-12-31',
    timeline: Array.isArray(raw.timeline) && raw.timeline.length > 0 ? raw.timeline : defaultTimeline,
    assignments: raw.assignments || [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export type ProjectListResult = AcquisitionProject[] & {
  items: AcquisitionProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const projectsService = {
  async list(params?: ProjectQueryParams): Promise<ProjectListResult> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.search) query.set('search', params.search);
      if (params?.status && params.status !== 'ALL') query.set('status', params.status);
      if (params?.category && params.category !== 'ALL') query.set('category', params.category);
      if (params?.state && params.state !== 'ALL') query.set('state', params.state);
      if (params?.district) query.set('district', params.district);
      if (params?.implementingAgencyOrgId) query.set('implementingAgencyOrgId', params.implementingAgencyOrgId);
      if (params?.sortBy) query.set('sortBy', params.sortBy);
      if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

      const res = await apiClient.get<any>(`/projects?${query.toString()}`);
      if (res?.items) {
        const items = res.items.map(mapBackendToAcquisitionProject);
        return Object.assign(items, {
          items,
          total: res.total,
          page: res.page,
          limit: res.limit,
          totalPages: res.totalPages,
        });
      }
      if (res?.data?.items) {
        const items = res.data.items.map(mapBackendToAcquisitionProject);
        return Object.assign(items, {
          items,
          total: res.data.total,
          page: res.data.page,
          limit: res.data.limit,
          totalPages: res.data.totalPages,
        });
      }
    } catch (err) {
      if (!IS_DEV) {
        throw err;
      }
      console.warn('[ProjectsService] Backend unreachable in DEV mode, using fallback data.', err);
    }

    // Dev-only fallback
    let filtered = [...inMemoryProjects];
    if (params?.status && params.status !== 'ALL') {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params?.category && params.category !== 'ALL') {
      filtered = filtered.filter((p) => p.category === params.category);
    }
    if (params?.state && params.state !== 'ALL') {
      filtered = filtered.filter((p) => p.state === params.state);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.implementingAgency.toLowerCase().includes(q) ||
          p.districts.some((d) => d.toLowerCase().includes(q)),
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return Object.assign(items, {
      items,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    });
  },

  async getById(id: string): Promise<AcquisitionProject> {
    try {
      const res = await apiClient.get<any>(`/projects/${id}`);
      if (res?.id) return mapBackendToAcquisitionProject(res);
      if (res?.data?.id) return mapBackendToAcquisitionProject(res.data);
    } catch (err) {
      if (!IS_DEV) {
        throw err;
      }
      console.warn(`[ProjectsService] Backend unreachable for project ID "${id}" in DEV, falling back.`, err);
    }

    const found = inMemoryProjects.find((p) => p.id === id);
    if (!found) {
      throw new Error(`Project with ID "${id}" not found`);
    }
    return found;
  },

  async create(payload: CreateProjectPayload): Promise<AcquisitionProject> {
    try {
      const res = await apiClient.post<any>('/projects', payload);
      if (res?.id) {
        const created = mapBackendToAcquisitionProject(res);
        inMemoryProjects.unshift(created);
        return created;
      }
      if (res?.data?.id) {
        const created = mapBackendToAcquisitionProject(res.data);
        inMemoryProjects.unshift(created);
        return created;
      }
    } catch (err) {
      if (!IS_DEV) {
        throw err;
      }
      console.warn('[ProjectsService] Backend create failed in DEV mode, creating local mock.', err);
    }

    const defaultTimeline: ProjectTimelineEvent[] = [
      { id: '1', stage: 'DRAFT', label: 'Section 4 SIA Draft Initiated', date: new Date().toISOString().split('T')[0], completed: true },
    ];

    const newProject: AcquisitionProject = {
      id: `proj-${Date.now()}`,
      code: payload.code.trim(),
      title: payload.title.trim(),
      description: payload.description || null,
      category: payload.category || 'HIGHWAY',
      status: 'DRAFT',
      implementingAgency: 'Implementing Agency',
      state: payload.state,
      districts: payload.districts,
      totalAreaHectares: payload.totalAreaHectares || 0,
      parcelCount: 0,
      affectedLandowners: 0,
      estimatedCompensationInr: payload.estimatedCompensationInr || 0,
      disbursedCompensationInr: 0,
      notifiedOn: payload.notifiedOn || new Date().toISOString().split('T')[0],
      targetCompletionOn: payload.targetCompletionOn || '',
      timeline: defaultTimeline,
    };
    inMemoryProjects.unshift(newProject);
    return newProject;
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<AcquisitionProject> {
    try {
      const res = await apiClient.patch<any>(`/projects/${id}`, payload);
      if (res?.id) return mapBackendToAcquisitionProject(res);
      if (res?.data?.id) return mapBackendToAcquisitionProject(res.data);
    } catch (err) {
      if (!IS_DEV) {
        throw err;
      }
    }

    const idx = inMemoryProjects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    inMemoryProjects[idx] = {
      ...inMemoryProjects[idx],
      ...payload,
    };
    return inMemoryProjects[idx];
  },

  async updateStatus(id: string, payload: UpdateProjectStatusPayload): Promise<AcquisitionProject> {
    try {
      const res = await apiClient.patch<any>(`/projects/${id}/status`, payload);
      if (res?.id) return mapBackendToAcquisitionProject(res);
      if (res?.data?.id) return mapBackendToAcquisitionProject(res.data);
    } catch (err) {
      if (!IS_DEV) {
        throw err;
      }
    }

    const idx = inMemoryProjects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    inMemoryProjects[idx] = {
      ...inMemoryProjects[idx],
      status: payload.status,
    };
    return inMemoryProjects[idx];
  },

  async getSummaryMetrics(): Promise<ProjectSummaryKpis> {
    try {
      const res = await apiClient.get<any>('/projects/summary');
      if (res?.totalProjects !== undefined) return res;
      if (res?.data?.totalProjects !== undefined) return res.data;
    } catch (err) {
      if (!IS_DEV) {
        throw err;
      }
    }

    const totalArea = inMemoryProjects.reduce((sum, p) => sum + p.totalAreaHectares, 0);
    const totalEstimated = inMemoryProjects.reduce((sum, p) => sum + p.estimatedCompensationInr, 0);
    const totalDisbursed = inMemoryProjects.reduce((sum, p) => sum + p.disbursedCompensationInr, 0);
    const inProcess = inMemoryProjects.filter((p) => p.status !== 'COMPLETED' && p.status !== 'REJECTED').length;
    const completed = inMemoryProjects.filter((p) => p.status === 'COMPLETED' || p.status === 'POSSESSION_COMPLETED').length;

    return {
      totalProjects: inMemoryProjects.length,
      inStatutoryProcess: inProcess,
      completedHandover: completed,
      totalAreaHectares: Math.round(totalArea * 100) / 100,
      totalEstimatedCompensationInr: totalEstimated,
      totalDisbursedCompensationInr: totalDisbursed,
    };
  },

  async getKpiSummary(): Promise<KpiSummary[]> {
    const summary = await this.getSummaryMetrics();
    const percentDisbursed =
      summary.totalEstimatedCompensationInr > 0
        ? Math.round((summary.totalDisbursedCompensationInr / summary.totalEstimatedCompensationInr) * 100)
        : 0;

    return [
      { label: 'Active Statutory Projects', value: summary.inStatutoryProcess, unit: 'COUNT', trend: 'UP', deltaPercent: 8 },
      { label: 'Total Land Under Acquisition', value: summary.totalAreaHectares, unit: 'HECTARE', trend: 'UP', deltaPercent: 5 },
      { label: 'Completed Handover Projects', value: summary.completedHandover, unit: 'COUNT', trend: 'UP', deltaPercent: 12 },
      {
        label: 'Statutory Compensation Disbursed',
        value: summary.totalDisbursedCompensationInr,
        unit: 'INR',
        trend: 'UP',
        deltaPercent: percentDisbursed,
      },
    ];
  },

  async getActivity(id: string): Promise<any[]> {
    try {
      const res = await apiClient.get<any>(`/projects/${id}/activity`);
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
    } catch (err) {
      if (!IS_DEV) {
        throw err;
      }
    }
    return [];
  },

  async getAssignments(id: string): Promise<any[]> {
    try {
      const res = await apiClient.get<any>(`/projects/${id}/assignments`);
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
    } catch (err) {
      if (!IS_DEV) {
        throw err;
      }
    }
    return [];
  },
};