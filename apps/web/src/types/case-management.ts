
export type RehabilitationCaseStatus = 'REGISTERED' | 'PLAN_APPROVED' | 'RELOCATED' | 'CLOSED'

export interface RehabilitationCase {
    id: string
    projectId: string
    familyHeadName: string
    displacedFrom: string
    householdSize: number
    status: RehabilitationCaseStatus
    allotmentSiteId?: string
}

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface AppNotification {
    id: string
    title: string
    message: string
    severity: NotificationSeverity
    isRead: boolean
    createdAt: string
    projectId?: string
}

export interface AuditLogEntry {
    id: string
    actorName: string
    actorRole: string
    action: string
    entityType: string
    entityId: string
    timestamp: string
}