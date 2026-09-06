import type { UserRole, OrgType } from '@/types/auth'

export type PossessionStatus =
    | 'READY_FOR_POSSESSION'
    | 'NOTICE_PREPARED'
    | 'NOTICE_ISSUED'
    | 'SCHEDULED'
    | 'SITE_VERIFICATION'
    | 'POSSESSION_PENDING'
    | 'POSSESSION_TAKEN'
    | 'CERTIFICATE_PENDING'
    | 'CERTIFICATE_ISSUED'
    | 'ON_HOLD'
    | 'DISPUTED'

export type PossessionType = 'VOLUNTARY' | 'STATUTORY' | 'PARTIAL' | 'FULL'

export type PossessionSlaStatus = 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED'

export type SiteVerificationResult = 'VERIFIED' | 'REQUIRES_REVIEW' | 'BLOCKED'

export interface PossessionReadinessItem {
    id: string
    label: string
    status: 'MET' | 'PENDING' | 'BLOCKED'
    supportingRef?: string
    isBlocking: boolean
    notes?: string
}

export interface PossessionTimelineEvent {
    id: string
    possessionId: string
    timestamp: string
    actor: string
    role: UserRole | string
    organization: OrgType | string
    action: string
    remarks?: string
}

export interface PossessionRemark {
    id: string
    possessionId: string
    author: string
    role: UserRole | string
    organization: OrgType | string
    timestamp: string
    remark: string
}

export interface PossessionRecord {
    id: string
    projectId: string
    projectCode: string
    projectName: string
    parcelId: string
    surveyNumber: string
    compensationId?: string
    workflowTaskId?: string
    possessionStatus: PossessionStatus
    possessionType: PossessionType
    slaStatus: PossessionSlaStatus
    landAreaHectares: number
    landClassification: string
    village: string
    tehsil: string
    district: string
    state: string
    assignedOfficer: string
    assignedRole: UserRole | string
    organization: OrgType | string
    scheduledDate?: string
    noticeDate?: string
    noticeReference?: string
    noticeDocumentId?: string
    siteVerificationDate?: string
    siteVerificationOfficer?: string
    siteVerificationResult?: SiteVerificationResult
    siteObservations?: string
    possessionDate?: string
    certificateId?: string
    certificateDocumentId?: string
    certificateDate?: string
    compensationStatus: string
    totalCompensationInr: number
    disbursedCompensationInr: number
    pendingCompensationInr: number
    readinessStatus: 'READY' | 'CONDITIONAL' | 'BLOCKED'
    holdReason?: string
    disputeReason?: string
    remarks?: string
    createdAt: string
    updatedAt: string
    readinessChecklist: PossessionReadinessItem[]
    timeline: PossessionTimelineEvent[]
    remarksList: PossessionRemark[]
}

export const POSSESSION_TRANSITION_MAP: Record<PossessionStatus, PossessionStatus[]> = {
    READY_FOR_POSSESSION: ['NOTICE_PREPARED', 'SCHEDULED', 'ON_HOLD', 'DISPUTED'],
    NOTICE_PREPARED: ['NOTICE_ISSUED', 'ON_HOLD', 'DISPUTED'],
    NOTICE_ISSUED: ['SCHEDULED', 'SITE_VERIFICATION', 'ON_HOLD', 'DISPUTED'],
    SCHEDULED: ['SITE_VERIFICATION', 'POSSESSION_PENDING', 'ON_HOLD', 'DISPUTED'],
    SITE_VERIFICATION: ['POSSESSION_PENDING', 'POSSESSION_TAKEN', 'ON_HOLD', 'DISPUTED'],
    POSSESSION_PENDING: ['POSSESSION_TAKEN', 'ON_HOLD', 'DISPUTED'],
    POSSESSION_TAKEN: ['CERTIFICATE_PENDING', 'CERTIFICATE_ISSUED'],
    CERTIFICATE_PENDING: ['CERTIFICATE_ISSUED'],
    CERTIFICATE_ISSUED: [],
    ON_HOLD: ['READY_FOR_POSSESSION', 'NOTICE_PREPARED', 'NOTICE_ISSUED', 'SCHEDULED', 'SITE_VERIFICATION', 'POSSESSION_PENDING'],
    DISPUTED: ['READY_FOR_POSSESSION', 'NOTICE_PREPARED', 'NOTICE_ISSUED', 'SCHEDULED', 'SITE_VERIFICATION', 'POSSESSION_PENDING', 'ON_HOLD'],
}
