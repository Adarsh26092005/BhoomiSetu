import type { ProjectStatus } from './project'
import type { UserRole, OrganizationType } from './auth'

export type WorkflowTaskStatus = 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED' | 'ON_HOLD'

export type WorkflowPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type WorkflowSlaStatus = 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED'

export type WorkflowActionType = 'APPROVE' | 'REJECT' | 'HOLD' | 'REASSIGN' | 'COMMENT'

export interface WorkflowHistoryEvent {
    id: string
    workflowTaskId: string
    action: string
    fromStatus?: ProjectStatus | WorkflowTaskStatus
    toStatus?: ProjectStatus | WorkflowTaskStatus
    performedBy: string
    performedByRole: UserRole | string
    organization: OrganizationType | string
    timestamp: string
    remarks?: string
}

export interface WorkflowComment {
    id: string
    workflowTaskId: string
    author: string
    authorRole: UserRole | string
    comment: string
    createdAt: string
}

export interface WorkflowTask {
    id: string
    projectId: string
    projectName: string
    projectCode: string
    currentStage: ProjectStatus
    targetStage?: ProjectStatus
    taskType: string
    title: string
    description: string
    assignedRole: UserRole
    assignedOfficer: string
    assignedOrganization: OrganizationType | string
    status: WorkflowTaskStatus
    priority: WorkflowPriority
    createdAt: string
    dueAt: string
    completedAt?: string
    slaDays: number
    slaStatus: WorkflowSlaStatus
    remarks?: string
    availableActions: WorkflowActionType[]
    history: WorkflowHistoryEvent[]
    comments: WorkflowComment[]
}

export const WORKFLOW_TRANSITION_MAP: Record<ProjectStatus, ProjectStatus[]> = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['UNDER_SCRUTINY'],
    UNDER_SCRUTINY: ['DOCUMENT_VERIFICATION', 'REJECTED', 'ON_HOLD'],
    DOCUMENT_VERIFICATION: ['DISTRICT_APPROVAL', 'REJECTED', 'ON_HOLD'],
    DISTRICT_APPROVAL: ['STATE_APPROVAL', 'REJECTED', 'ON_HOLD'],
    STATE_APPROVAL: ['CENTRAL_APPROVAL', 'REJECTED', 'ON_HOLD'],
    CENTRAL_APPROVAL: ['NOTIFICATION_ISSUED', 'REJECTED', 'ON_HOLD'],
    NOTIFICATION_ISSUED: ['AWARD_DECLARED', 'REJECTED', 'ON_HOLD'],
    AWARD_DECLARED: ['COMPENSATION_ASSESSED', 'ON_HOLD'],
    COMPENSATION_ASSESSED: ['COMPENSATION_DISBURSED', 'ON_HOLD'],
    COMPENSATION_DISBURSED: ['POSSESSION_PENDING', 'ON_HOLD'],
    POSSESSION_PENDING: ['POSSESSION_COMPLETED', 'ON_HOLD'],
    POSSESSION_COMPLETED: ['R_AND_R_IN_PROGRESS', 'COMPLETED'],
    R_AND_R_IN_PROGRESS: ['COMPLETED', 'ON_HOLD'],
    COMPLETED: [],
    REJECTED: ['SUBMITTED'],
    ON_HOLD: ['UNDER_SCRUTINY', 'DOCUMENT_VERIFICATION', 'DISTRICT_APPROVAL', 'STATE_APPROVAL', 'CENTRAL_APPROVAL'],
}
