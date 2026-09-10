import { apiClient } from './api-client';
import { MOCK_WORKFLOW_TASKS } from '@/mock/workflow';
import type {
  WorkflowTask,
  ProjectStatus,
  UserRole,
  OrganizationType,
  WorkflowActionType,
} from '@/types';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

function mapBackendToWorkflowTask(raw: any): WorkflowTask {
  return {
    id: raw.id,
    projectId: raw.projectId,
    projectName: raw.project?.title || 'Land Acquisition Scheme',
    projectCode: raw.project?.code || 'NLAMS-PRJ',
    currentStage: raw.currentStage || raw.project?.status || 'SUBMITTED',
    targetStage: raw.targetStage || undefined,
    taskType: raw.taskType || 'SCRUTINY',
    title: raw.title || 'Statutory Action Item',
    description: raw.description || '',
    assignedRole: (raw.assignedRoleId || raw.assignedOfficer?.role || 'LAND_ACQUISITION_OFFICER') as UserRole,
    assignedOfficer: raw.assignedOfficer?.fullName || 'Assigned Competent Authority',
    assignedOrganization: (raw.assignedOrg?.type || raw.assignedOrg?.name || 'DISTRICT_AUTHORITY') as OrganizationType,
    status: raw.status || 'PENDING',
    priority: raw.priority || 'MEDIUM',
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    dueAt: raw.dueAt ? new Date(raw.dueAt).toISOString() : new Date().toISOString(),
    completedAt: raw.completedAt ? new Date(raw.completedAt).toISOString() : undefined,
    slaDays: raw.slaDays || 7,
    slaStatus: raw.slaStatus || 'ON_TRACK',
    remarks: raw.remarks || undefined,
    availableActions: Array.isArray(raw.availableActions)
      ? (raw.availableActions as WorkflowActionType[])
      : ['APPROVE', 'REJECT', 'HOLD'],
    history: Array.isArray(raw.history)
      ? raw.history.map((h: any) => ({
          id: h.id,
          workflowTaskId: h.taskId || raw.id,
          action: h.action,
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          performedBy: h.performedBy?.fullName || 'Officer',
          performedByRole: h.performedBy?.role || 'GOVERNMENT_OFFICER',
          organization: 'GOVERNMENT_AUTHORITY',
          timestamp: h.createdAt || new Date().toISOString(),
          remarks: h.remarks || undefined,
        }))
      : [],
    comments: Array.isArray(raw.comments)
      ? raw.comments.map((c: any) => ({
          id: c.id,
          workflowTaskId: c.taskId || raw.id,
          author: c.author?.fullName || 'Authorized Officer',
          authorRole: c.author?.role || 'GOVERNMENT_OFFICER',
          comment: c.comment,
          createdAt: c.createdAt || new Date().toISOString(),
        }))
      : [],
  };
}

let mockWorkflowState: WorkflowTask[] = [...MOCK_WORKFLOW_TASKS];

export const workflowService = {
  async list(projectId?: string): Promise<WorkflowTask[]> {
    if (USE_MOCKS) {
      let filtered = [...mockWorkflowState];
      if (projectId) {
        filtered = filtered.filter((w) => w.projectId === projectId);
      }
      return filtered;
    }

    try {
      const url = projectId ? `/workflow/tasks?projectId=${projectId}` : '/workflow/tasks';
      const res = await apiClient.get<any>(url);
      const rawList = res?.items || (Array.isArray(res) ? res : res?.data?.items || []);
      return rawList.map(mapBackendToWorkflowTask);
    } catch {
      // Fallback for mock preview
      let filtered = [...mockWorkflowState];
      if (projectId) {
        filtered = filtered.filter((w) => w.projectId === projectId);
      }
      return filtered;
    }
  },

  async getById(id: string): Promise<WorkflowTask | undefined> {
    if (USE_MOCKS) {
      return mockWorkflowState.find((w) => w.id === id);
    }

    try {
      const res = await apiClient.get<any>(`/workflow/tasks/${id}`);
      if (res?.id) return mapBackendToWorkflowTask(res);
      if (res?.data?.id) return mapBackendToWorkflowTask(res.data);
    } catch {
      return mockWorkflowState.find((w) => w.id === id);
    }

    return mockWorkflowState.find((w) => w.id === id);
  },

  async getByProjectId(projectId: string): Promise<WorkflowTask | undefined> {
    if (USE_MOCKS) {
      return mockWorkflowState.find((w) => w.projectId === projectId);
    }

    try {
      const res = await apiClient.get<any>(`/workflow/projects/${projectId}/active-task`);
      if (res?.id) return mapBackendToWorkflowTask(res);
      if (res?.data?.id) return mapBackendToWorkflowTask(res.data);
    } catch {
      return mockWorkflowState.find((w) => w.projectId === projectId);
    }

    return mockWorkflowState.find((w) => w.projectId === projectId);
  },

  async approve(id: string, remarks?: string): Promise<WorkflowTask> {
    if (USE_MOCKS) {
      const task = mockWorkflowState.find((w) => w.id === id);
      if (!task) throw new Error(`Workflow task ${id} not found`);
      const nextStage: ProjectStatus = task.targetStage || 'COMPLETED';
      const updated: WorkflowTask = {
        ...task,
        status: 'COMPLETED',
        slaStatus: 'COMPLETED',
        completedAt: new Date().toISOString().split('T')[0],
        remarks: remarks || task.remarks,
        history: [
          ...task.history,
          {
            id: `h-${Date.now()}`,
            workflowTaskId: id,
            action: 'COMPLETED',
            fromStatus: task.currentStage,
            toStatus: nextStage,
            performedBy: 'Authorized Officer',
            performedByRole: task.assignedRole,
            organization: 'GOVERNMENT_AUTHORITY',
            timestamp: new Date().toISOString(),
            remarks: remarks || `Completed task for ${task.currentStage}`,
          },
        ],
      };
      mockWorkflowState = mockWorkflowState.map((w) => (w.id === id ? updated : w));
      return updated;
    }

    const res = await apiClient.post<any>(`/workflow/tasks/${id}/complete`, { remarks });
    if (res?.id) return mapBackendToWorkflowTask(res);
    if (res?.data?.id) return mapBackendToWorkflowTask(res.data);
    return res;
  },

  async reject(id: string, remarks: string): Promise<WorkflowTask> {
    if (USE_MOCKS) {
      const task = mockWorkflowState.find((w) => w.id === id);
      if (!task) throw new Error(`Workflow task ${id} not found`);
      const updated: WorkflowTask = {
        ...task,
        status: 'REJECTED',
        remarks: remarks || 'Rejected by Competent Authority',
        history: [
          ...task.history,
          {
            id: `h-${Date.now()}`,
            workflowTaskId: id,
            action: 'REJECTED',
            fromStatus: task.currentStage,
            toStatus: 'REJECTED',
            performedBy: 'Authorized Officer',
            performedByRole: task.assignedRole,
            organization: 'GOVERNMENT_AUTHORITY',
            timestamp: new Date().toISOString(),
            remarks,
          },
        ],
      };
      mockWorkflowState = mockWorkflowState.map((w) => (w.id === id ? updated : w));
      return updated;
    }

    const res = await apiClient.post<any>(`/workflow/tasks/${id}/reject`, { remarks });
    if (res?.id) return mapBackendToWorkflowTask(res);
    if (res?.data?.id) return mapBackendToWorkflowTask(res.data);
    return res;
  },

  async putOnHold(id: string, remarks: string): Promise<WorkflowTask> {
    if (USE_MOCKS) {
      const task = mockWorkflowState.find((w) => w.id === id);
      if (!task) throw new Error(`Workflow task ${id} not found`);
      const updated: WorkflowTask = {
        ...task,
        status: 'ON_HOLD',
        remarks: remarks || 'Placed on hold',
        history: [
          ...task.history,
          {
            id: `h-${Date.now()}`,
            workflowTaskId: id,
            action: 'HOLD',
            fromStatus: task.currentStage,
            toStatus: 'ON_HOLD',
            performedBy: 'Authorized Officer',
            performedByRole: task.assignedRole,
            organization: 'GOVERNMENT_AUTHORITY',
            timestamp: new Date().toISOString(),
            remarks,
          },
        ],
      };
      mockWorkflowState = mockWorkflowState.map((w) => (w.id === id ? updated : w));
      return updated;
    }

    const res = await apiClient.post<any>(`/workflow/tasks/${id}/hold`, { remarks });
    if (res?.id) return mapBackendToWorkflowTask(res);
    if (res?.data?.id) return mapBackendToWorkflowTask(res.data);
    return res;
  },

  async reassign(
    id: string,
    newOfficer: string,
    _newRole?: UserRole,
    _newOrg?: OrganizationType | string,
    remarks?: string,
  ): Promise<WorkflowTask> {
    const res = await apiClient.patch<any>(`/workflow/tasks/${id}/reassign`, {
      newOfficerId: newOfficer,
      remarks,
    });
    if (res?.id) return mapBackendToWorkflowTask(res);
    if (res?.data?.id) return mapBackendToWorkflowTask(res.data);
    return res;
  },

  async addComment(id: string, comment: string): Promise<WorkflowTask> {
    const res = await apiClient.post<any>(`/workflow/tasks/${id}/comments`, {
      comment,
      isInternalOnly: true,
    });
    return res;
  },
};
