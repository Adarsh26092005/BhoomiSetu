import type { UserRole, OrganizationType } from '@/types/auth'

export type RAndRStatus =
    | 'IDENTIFIED'
    | 'ASSESSMENT_PENDING'
    | 'ELIGIBILITY_REVIEW'
    | 'ENTITLEMENT_DEFINED'
    | 'PLAN_PREPARED'
    | 'APPROVAL_PENDING'
    | 'BENEFIT_APPROVED'
    | 'BENEFIT_IN_PROGRESS'
    | 'RELOCATION_IN_PROGRESS'
    | 'POST_RELOCATION_VERIFICATION'
    | 'COMPLETED'
    | 'ON_HOLD'
    | 'DISPUTED'

export type RAndREligibilityStatus =
    | 'PENDING'
    | 'UNDER_REVIEW'
    | 'ELIGIBLE'
    | 'NOT_ELIGIBLE'
    | 'REQUIRES_DOCUMENTATION'
    | 'DISPUTED'

export type RAndRBenefitStatus =
    | 'NOT_STARTED'
    | 'PLANNED'
    | 'APPROVAL_PENDING'
    | 'APPROVED'
    | 'IN_PROGRESS'
    | 'DELIVERED'
    | 'VERIFIED'
    | 'ON_HOLD'
    | 'DISPUTED'

export type RAndRBenefitType =
    | 'HOUSING_ASSISTANCE'
    | 'RESETTLEMENT_SITE'
    | 'LIVELIHOOD_ASSISTANCE'
    | 'TRANSPORT_ASSISTANCE'
    | 'TEMPORARY_ACCOMMODATION'
    | 'EMPLOYMENT_ASSISTANCE'
    | 'TRAINING_ASSISTANCE'
    | 'OTHER_ASSISTANCE'

export type RelocationStatus =
    | 'NOT_STARTED'
    | 'PLANNED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'NOT_REQUIRED'

export type PostRelocationVerificationResult =
    | 'VERIFIED'
    | 'REQUIRES_REVIEW'
    | 'BLOCKED'

export interface AffectedHousehold {
    id: string
    householdReference: string
    projectId: string
    parcelId: string
    village: string
    tehsil: string
    district: string
    familySize: number
    affectedMembers: number
    vulnerableMemberCount: number
    livelihoodType: string
    relocationRequired: boolean
    documentationStatus: 'COMPLETE' | 'PENDING' | 'DISCREPANCY'
}

export interface REntitlement {
    id: string
    rAndRCaseId: string
    entitlementType: RAndRBenefitType
    description: string
    quantityValue?: string
    status: 'DEFINED' | 'APPROVED' | 'IN_DELIVERY' | 'DELIVERED'
    approvalReference?: string
    approvedDate?: string
    deliveredDate?: string
    verificationDate?: string
    remarks?: string
}

export interface RAndRBenefit {
    id: string
    rAndRCaseId: string
    benefitType: RAndRBenefitType
    status: RAndRBenefitStatus
    plannedValue: number
    approvedValue: number
    deliveredValue: number
    deliveryDate?: string
    verificationDate?: string
    responsibleOfficer: string
    remarks?: string
}

export interface ResettlementSite {
    id: string
    siteReference: string
    location: string
    allocatedStatus: 'ALLOCATED' | 'PLANNED' | 'HANDED_OVER' | 'NOT_APPLICABLE'
    allocationDate?: string
    infrastructureReadiness: 'READY' | 'IN_PROGRESS' | 'PENDING'
    handoverStatus: 'PENDING' | 'HANDED_OVER'
}

export interface LivelihoodSupport {
    id: string
    livelihoodType: string
    supportCategory: string
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
    responsibleOfficer: string
    plannedCompletion?: string
    completionDate?: string
    remarks?: string
}

export interface RAndRTimelineEvent {
    id: string
    timestamp: string
    actor: string
    role: UserRole
    organization: OrganizationType
    action: string
    remarks?: string
}

export interface RAndRRemark {
    id: string
    author: string
    role: UserRole
    timestamp: string
    remark: string
}

export interface RAndRCase {
    id: string
    projectId: string
    projectName: string
    projectCode: string
    parcelId: string
    surveyNumber: string
    possessionId?: string
    compensationId?: string
    workflowTaskId?: string
    householdId: string
    household: AffectedHousehold
    rAndRStatus: RAndRStatus
    eligibilityStatus: RAndREligibilityStatus
    affectedAreaHectares: number
    affectedFamilyCount: number
    primaryContactReference: string
    village: string
    tehsil: string
    district: string
    state: string
    relocationRequired: boolean
    existingResidenceAffected: boolean
    livelihoodAffected: boolean
    entitlementSummary: string
    assignedOfficer: string
    assignedRole: UserRole
    organization: OrganizationType
    assessmentDate?: string
    assessingOfficer?: string
    approvalDate?: string
    relocationStatus: RelocationStatus
    relocationDate?: string
    resettlementSite?: ResettlementSite
    livelihoodSupport?: LivelihoodSupport
    postRelocationVerificationStatus?: PostRelocationVerificationResult
    postRelocationVerificationDate?: string
    postRelocationVerificationOfficer?: string
    postRelocationObservations?: string
    completionDate?: string
    holdReason?: string
    disputeReason?: string
    entitlements: REntitlement[]
    benefits: RAndRBenefit[]
    timeline: RAndRTimelineEvent[]
    remarksList: RAndRRemark[]
    createdAt: string
    updatedAt: string
}
