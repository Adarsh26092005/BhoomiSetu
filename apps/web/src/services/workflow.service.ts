import { MOCK_WORKFLOW_TASKS } from '@/mock/workflow'
import type { WorkflowTask, ProjectStatus, UserRole, OrganizationType } from '@/types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

function delay<T>(value: T, ms = 300): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let workflowState: WorkflowTask[] = [...MOCK_WORKFLOW_TASKS]

export const workflowService = {
    async list(projectId?: string): Promise<WorkflowTask[]> {
        if (USE_MOCKS) {
            let filtered = [...workflowState]
            if (projectId) {
                filtered = filtered.filter((w) => w.projectId === projectId)
            }
            return delay(filtered)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getById(id: string): Promise<WorkflowTask | undefined> {
        if (USE_MOCKS) {
            return delay(workflowState.find((w) => w.id === id))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getByProjectId(projectId: string): Promise<WorkflowTask | undefined> {
        if (USE_MOCKS) {
            return delay(workflowState.find((w) => w.projectId === projectId))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async approve(id: string, remarks?: string): Promise<WorkflowTask> {
        if (USE_MOCKS) {
            const task = workflowState.find((w) => w.id === id)
            if (!task) throw new Error(`Workflow task ${id} not found`)

            const nextProjectStage: ProjectStatus = task.targetStage || 'COMPLETED'
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
                        action: 'APPROVED_AND_FORWARDED',
                        fromStatus: task.currentStage,
                        toStatus: nextProjectStage,
                        performedBy: 'Anand Kumar (LAO Officer)',
                        performedByRole: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        timestamp: new Date().toISOString(),
                        remarks: remarks || `Approved transition from ${task.currentStage} to ${nextProjectStage}`,
                    },
                ],
            }
            workflowState = workflowState.map((w) => (w.id === id ? updated : w))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async reject(id: string, remarks: string): Promise<WorkflowTask> {
        if (USE_MOCKS) {
            const task = workflowState.find((w) => w.id === id)
            if (!task) throw new Error(`Workflow task ${id} not found`)

            const updated: WorkflowTask = {
                ...task,
                status: 'REJECTED',
                remarks: remarks || 'Rejected by Competent Authority',
                history: [
                    ...task.history,
                    {
                        id: `h-${Date.now()}`,
                        workflowTaskId: id,
                        action: 'REJECTED_AND_REMANDED',
                        fromStatus: task.currentStage,
                        toStatus: 'REJECTED',
                        performedBy: 'Anand Kumar (LAO Officer)',
                        performedByRole: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        timestamp: new Date().toISOString(),
                        remarks,
                    },
                ],
            }
            workflowState = workflowState.map((w) => (w.id === id ? updated : w))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async putOnHold(id: string, remarks: string): Promise<WorkflowTask> {
        if (USE_MOCKS) {
            const task = workflowState.find((w) => w.id === id)
            if (!task) throw new Error(`Workflow task ${id} not found`)

            const updated: WorkflowTask = {
                ...task,
                status: 'ON_HOLD',
                remarks: remarks || 'Placed on hold pending enquiry',
                history: [
                    ...task.history,
                    {
                        id: `h-${Date.now()}`,
                        workflowTaskId: id,
                        action: 'PLACED_ON_HOLD',
                        fromStatus: task.currentStage,
                        toStatus: 'ON_HOLD',
                        performedBy: 'Anand Kumar (LAO Officer)',
                        performedByRole: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        timestamp: new Date().toISOString(),
                        remarks,
                    },
                ],
            }
            workflowState = workflowState.map((w) => (w.id === id ? updated : w))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async reassign(
        id: string,
        newOfficer: string,
        newRole: UserRole,
        newOrg: OrganizationType | string,
        remarks?: string,
    ): Promise<WorkflowTask> {
        if (USE_MOCKS) {
            const task = workflowState.find((w) => w.id === id)
            if (!task) throw new Error(`Workflow task ${id} not found`)

            const updated: WorkflowTask = {
                ...task,
                assignedOfficer: newOfficer,
                assignedRole: newRole,
                assignedOrganization: newOrg,
                history: [
                    ...task.history,
                    {
                        id: `h-${Date.now()}`,
                        workflowTaskId: id,
                        action: 'REASSIGNED',
                        performedBy: 'Anand Kumar (LAO Officer)',
                        performedByRole: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        timestamp: new Date().toISOString(),
                        remarks: remarks || `Reassigned responsibility to ${newOfficer} (${newRole})`,
                    },
                ],
            }
            workflowState = workflowState.map((w) => (w.id === id ? updated : w))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async addComment(id: string, comment: string): Promise<WorkflowTask> {
        if (USE_MOCKS) {
            const task = workflowState.find((w) => w.id === id)
            if (!task) throw new Error(`Workflow task ${id} not found`)

            const newComment = {
                id: `c-${Date.now()}`,
                workflowTaskId: id,
                author: 'Anand Kumar',
                authorRole: 'LAND_ACQUISITION_OFFICER' as UserRole,
                comment,
                createdAt: new Date().toISOString(),
            }

            const updated: WorkflowTask = {
                ...task,
                comments: [...task.comments, newComment],
                history: [
                    ...task.history,
                    {
                        id: `h-${Date.now()}`,
                        workflowTaskId: id,
                        action: 'COMMENT_ADDED',
                        performedBy: 'Anand Kumar',
                        performedByRole: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        timestamp: new Date().toISOString(),
                        remarks: `Comment: "${comment.slice(0, 50)}${comment.length > 50 ? '...' : ''}"`,
                    },
                ],
            }
            workflowState = workflowState.map((w) => (w.id === id ? updated : w))
            return delay(updated, 300)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },
}
