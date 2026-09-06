export type ProjectStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'UNDER_SCRUTINY'
    | 'DOCUMENT_VERIFICATION'
    | 'DISTRICT_APPROVAL'
    | 'STATE_APPROVAL'
    | 'CENTRAL_APPROVAL'
    | 'NOTIFICATION_ISSUED'
    | 'AWARD_DECLARED'
    | 'COMPENSATION_ASSESSED'
    | 'COMPENSATION_DISBURSED'
    | 'POSSESSION_PENDING'
    | 'POSSESSION_COMPLETED'
    | 'R_AND_R_IN_PROGRESS'
    | 'COMPLETED'
    | 'REJECTED'
    | 'ON_HOLD'

export type ProjectCategory =
    | 'HIGHWAY'
    | 'RAILWAY'
    | 'IRRIGATION'
    | 'INDUSTRIAL_CORRIDOR'
    | 'URBAN_INFRASTRUCTURE'
    | 'ENERGY'
    | 'DEFENCE'

export interface ProjectTimelineEvent {
    id: string
    stage: ProjectStatus
    label: string
    date: string
    completed: boolean
}

export interface ProjectAssignmentItem {
    id: string
    userId: string
    userName: string
    userEmail: string
    role: string
    assignedAt: string
    isActive: boolean
}

export interface AcquisitionProject {
    id: string
    code: string
    title: string
    description?: string | null
    category: ProjectCategory
    status: ProjectStatus
    implementingAgencyOrgId?: string
    implementingAgency: string
    state: string
    districts: string[]
    totalAreaHectares: number
    parcelCount: number
    affectedLandowners: number
    affectedHouseholdCount?: number
    documentCount?: number
    workflowTaskCount?: number
    estimatedCompensationInr: number
    disbursedCompensationInr: number
    notifiedOn: string
    targetCompletionOn: string
    timeline: ProjectTimelineEvent[]
    assignments?: ProjectAssignmentItem[]
    createdAt?: string
    updatedAt?: string
}

export interface CreateProjectPayload {
    code: string
    title: string
    description?: string
    category?: ProjectCategory
    implementingAgencyOrgId?: string
    state: string
    districts: string[]
    totalAreaHectares?: number
    estimatedCompensationInr?: number
    notifiedOn?: string
    targetCompletionOn?: string
    metadata?: Record<string, any>
}

export interface UpdateProjectPayload {
    title?: string
    description?: string
    category?: ProjectCategory
    state?: string
    districts?: string[]
    totalAreaHectares?: number
    estimatedCompensationInr?: number
    notifiedOn?: string
    targetCompletionOn?: string
    metadata?: Record<string, any>
}

export interface UpdateProjectStatusPayload {
    status: ProjectStatus
    remarks?: string
    rejectionReason?: string
    holdReason?: string
}

export interface ProjectQueryParams {
    page?: number
    limit?: number
    search?: string
    status?: ProjectStatus | 'ALL'
    category?: ProjectCategory | 'ALL'
    state?: string
    district?: string
    implementingAgencyOrgId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface PaginatedProjectsResponse {
    items: AcquisitionProject[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface ProjectSummaryKpis {
    totalProjects: number
    inStatutoryProcess: number
    completedHandover: number
    totalAreaHectares: number
    totalEstimatedCompensationInr: number
    totalDisbursedCompensationInr: number
}

export const PROJECT_STATUS_SEQUENCE: ProjectStatus[] = [
    'DRAFT',
    'SUBMITTED',
    'UNDER_SCRUTINY',
    'DOCUMENT_VERIFICATION',
    'DISTRICT_APPROVAL',
    'STATE_APPROVAL',
    'CENTRAL_APPROVAL',
    'NOTIFICATION_ISSUED',
    'AWARD_DECLARED',
    'COMPENSATION_ASSESSED',
    'COMPENSATION_DISBURSED',
    'POSSESSION_PENDING',
    'POSSESSION_COMPLETED',
    'R_AND_R_IN_PROGRESS',
    'COMPLETED',
]