import type {
    CompensationStatus,
    ParcelStatus,
    ProjectStatus,
    VerificationStatus,
    WorkflowTaskStatus,
    WorkflowPriority,
    WorkflowSlaStatus,
    CompensationAssessmentStatus,
    CompensationPaymentStatus,
    PossessionStatus,
    PossessionType,
    PossessionSlaStatus,
    RAndRStatus,
    RAndREligibilityStatus,
    RAndRBenefitStatus,
    RAndRBenefitType,
    RelocationStatus,
} from '@/types'

interface StatusMeta {
    label: string
    tone: 'ink' | 'amber' | 'signal' | 'rust' | 'slate'
}

export const PROJECT_STATUS_META: Record<ProjectStatus, StatusMeta> = {
    DRAFT: { label: 'Draft', tone: 'slate' },
    SUBMITTED: { label: 'Submitted', tone: 'ink' },
    UNDER_SCRUTINY: { label: 'Under Scrutiny', tone: 'amber' },
    DOCUMENT_VERIFICATION: { label: 'Document Verification', tone: 'amber' },
    DISTRICT_APPROVAL: { label: 'District Approval', tone: 'amber' },
    STATE_APPROVAL: { label: 'State Approval', tone: 'amber' },
    CENTRAL_APPROVAL: { label: 'Central Approval', tone: 'amber' },
    NOTIFICATION_ISSUED: { label: 'Notification Issued', tone: 'ink' },
    AWARD_DECLARED: { label: 'Award Declared', tone: 'ink' },
    COMPENSATION_ASSESSED: { label: 'Compensation Assessed', tone: 'amber' },
    COMPENSATION_DISBURSED: { label: 'Compensation Disbursed', tone: 'signal' },
    POSSESSION_PENDING: { label: 'Possession Pending', tone: 'amber' },
    POSSESSION_COMPLETED: { label: 'Possession Completed', tone: 'signal' },
    R_AND_R_IN_PROGRESS: { label: 'R&R In Progress', tone: 'amber' },
    COMPLETED: { label: 'Completed', tone: 'signal' },
    REJECTED: { label: 'Rejected', tone: 'rust' },
    ON_HOLD: { label: 'On Hold', tone: 'rust' },
}

export const PARCEL_STATUS_META: Record<ParcelStatus, StatusMeta> = {
    IDENTIFIED: { label: 'Identified', tone: 'slate' },
    VERIFICATION_PENDING: { label: 'Verification Pending', tone: 'amber' },
    VERIFIED: { label: 'Verified', tone: 'signal' },
    DISPUTED: { label: 'Disputed', tone: 'rust' },
    UNDER_ACQUISITION: { label: 'Under Acquisition', tone: 'amber' },
    AWARD_DECLARED: { label: 'Award Declared', tone: 'ink' },
    COMPENSATION_PENDING: { label: 'Compensation Pending', tone: 'amber' },
    COMPENSATION_PAID: { label: 'Compensation Paid', tone: 'signal' },
    POSSESSION_PENDING: { label: 'Possession Pending', tone: 'amber' },
    POSSESSION_TAKEN: { label: 'Possession Taken', tone: 'signal' },
}

export const COMPENSATION_STATUS_META: Record<CompensationStatus, StatusMeta> = {
    CALCULATED: { label: 'Calculated', tone: 'slate' },
    APPROVED: { label: 'Approved', tone: 'ink' },
    DISBURSED: { label: 'Disbursed', tone: 'signal' },
    DISPUTED: { label: 'Disputed', tone: 'rust' },
}

export const POSSESSION_STATUS_META: Record<PossessionStatus, StatusMeta> = {
    READY_FOR_POSSESSION: { label: 'Ready for Possession', tone: 'ink' },
    NOTICE_PREPARED: { label: 'Notice Prepared', tone: 'amber' },
    NOTICE_ISSUED: { label: 'Notice Issued', tone: 'amber' },
    SCHEDULED: { label: 'Possession Scheduled', tone: 'amber' },
    SITE_VERIFICATION: { label: 'Site Verification', tone: 'amber' },
    POSSESSION_PENDING: { label: 'Possession Pending', tone: 'amber' },
    POSSESSION_TAKEN: { label: 'Possession Taken', tone: 'signal' },
    CERTIFICATE_PENDING: { label: 'Certificate Pending', tone: 'amber' },
    CERTIFICATE_ISSUED: { label: 'Certificate Issued', tone: 'signal' },
    ON_HOLD: { label: 'Possession On Hold', tone: 'rust' },
    DISPUTED: { label: 'Possession Disputed', tone: 'rust' },
}

export const POSSESSION_TYPE_META: Record<PossessionType, StatusMeta> = {
    VOLUNTARY: { label: 'Voluntary Handover', tone: 'signal' },
    STATUTORY: { label: 'Statutory RFCTLARR', tone: 'ink' },
    PARTIAL: { label: 'Partial Parcel', tone: 'amber' },
    FULL: { label: 'Full Plot Handover', tone: 'ink' },
}

export const POSSESSION_SLA_STATUS_META: Record<PossessionSlaStatus, StatusMeta> = {
    ON_TRACK: { label: 'Within Schedule', tone: 'signal' },
    DUE_SOON: { label: 'Due in <7 Days', tone: 'amber' },
    OVERDUE: { label: 'Schedule Overdue', tone: 'rust' },
    COMPLETED: { label: 'Handover Completed', tone: 'slate' },
}

export const DOCUMENT_VERIFICATION_STATUS_META: Record<VerificationStatus, StatusMeta> = {
    PENDING: { label: 'Pending Verification', tone: 'slate' },
    UNDER_REVIEW: { label: 'Under Review', tone: 'amber' },
    VERIFIED: { label: 'Statutory Verified', tone: 'signal' },
    REJECTED: { label: 'Rejected / Defective', tone: 'rust' },
    SUPERSEDED: { label: 'Superseded Version', tone: 'slate' },
}

export const WORKFLOW_TASK_STATUS_META: Record<WorkflowTaskStatus, StatusMeta> = {
    PENDING: { label: 'Pending Action', tone: 'slate' },
    IN_REVIEW: { label: 'In Scrutiny', tone: 'amber' },
    COMPLETED: { label: 'Approved & Passed', tone: 'signal' },
    REJECTED: { label: 'Rejected / Remanded', tone: 'rust' },
    ON_HOLD: { label: 'Stayed / On Hold', tone: 'rust' },
}

export const WORKFLOW_PRIORITY_META: Record<WorkflowPriority, StatusMeta> = {
    LOW: { label: 'Low', tone: 'slate' },
    MEDIUM: { label: 'Medium', tone: 'ink' },
    HIGH: { label: 'High Priority', tone: 'amber' },
    CRITICAL: { label: 'Critical / Urgent', tone: 'rust' },
}

export const WORKFLOW_SLA_STATUS_META: Record<WorkflowSlaStatus, StatusMeta> = {
    ON_TRACK: { label: 'Within SLA', tone: 'signal' },
    DUE_SOON: { label: 'Expiring Soon', tone: 'amber' },
    OVERDUE: { label: 'SLA Overdue', tone: 'rust' },
    COMPLETED: { label: 'Completed', tone: 'slate' },
}

export const COMPENSATION_ASSESSMENT_STATUS_META: Record<CompensationAssessmentStatus, StatusMeta> = {
    ASSESSMENT_PENDING: { label: 'Assessment Pending', tone: 'slate' },
    UNDER_ASSESSMENT: { label: 'Under Assessment', tone: 'amber' },
    ASSESSMENT_COMPLETED: { label: 'Assessment Completed', tone: 'ink' },
    AWARD_PENDING: { label: 'Award Pending', tone: 'amber' },
    AWARD_DECLARED: { label: 'Award Declared', tone: 'ink' },
    PAYMENT_APPROVAL_PENDING: { label: 'Payment Approval Pending', tone: 'amber' },
    PAYMENT_APPROVED: { label: 'Payment Approved', tone: 'signal' },
    DISBURSEMENT_PENDING: { label: 'Disbursement Pending', tone: 'amber' },
    PARTIALLY_DISBURSED: { label: 'Partially Disbursed', tone: 'amber' },
    DISBURSED: { label: 'Fully Disbursed', tone: 'signal' },
    ON_HOLD: { label: 'Payment On Hold', tone: 'rust' },
    DISPUTED: { label: 'Payment Disputed', tone: 'rust' },
}

export const COMPENSATION_PAYMENT_STATUS_META: Record<CompensationPaymentStatus, StatusMeta> = {
    PENDING: { label: 'Pending DBT', tone: 'slate' },
    APPROVED: { label: 'Approved for PFMS', tone: 'ink' },
    PROCESSING: { label: 'Processing DBT', tone: 'amber' },
    PARTIALLY_DISBURSED: { label: 'Partially Paid', tone: 'amber' },
    DISBURSED: { label: '100% Disbursed', tone: 'signal' },
    FAILED: { label: 'DBT Failed', tone: 'rust' },
    ON_HOLD: { label: 'Disbursement Stayed', tone: 'rust' },
    DISPUTED: { label: 'Disputed Share', tone: 'rust' },
}

export const R_AND_R_STATUS_META: Record<RAndRStatus, StatusMeta> = {
    IDENTIFIED: { label: 'Identified', tone: 'slate' },
    ASSESSMENT_PENDING: { label: 'Assessment Pending', tone: 'amber' },
    ELIGIBILITY_REVIEW: { label: 'Eligibility Review', tone: 'amber' },
    ENTITLEMENT_DEFINED: { label: 'Entitlement Defined', tone: 'ink' },
    PLAN_PREPARED: { label: 'R&R Plan Prepared', tone: 'ink' },
    APPROVAL_PENDING: { label: 'Approval Pending', tone: 'amber' },
    BENEFIT_APPROVED: { label: 'Benefit Approved', tone: 'signal' },
    BENEFIT_IN_PROGRESS: { label: 'Benefits In Progress', tone: 'amber' },
    RELOCATION_IN_PROGRESS: { label: 'Relocation In Progress', tone: 'amber' },
    POST_RELOCATION_VERIFICATION: { label: 'Verification Pending', tone: 'amber' },
    COMPLETED: { label: 'R&R Completed', tone: 'signal' },
    ON_HOLD: { label: 'R&R On Hold', tone: 'rust' },
    DISPUTED: { label: 'R&R Disputed', tone: 'rust' },
}

export const R_AND_R_ELIGIBILITY_STATUS_META: Record<RAndREligibilityStatus, StatusMeta> = {
    PENDING: { label: 'Eligibility Pending', tone: 'slate' },
    UNDER_REVIEW: { label: 'Under Review', tone: 'amber' },
    ELIGIBLE: { label: 'Assessed Eligible', tone: 'signal' },
    NOT_ELIGIBLE: { label: 'Ineligible', tone: 'rust' },
    REQUIRES_DOCUMENTATION: { label: 'Docs Required', tone: 'amber' },
    DISPUTED: { label: 'Eligibility Disputed', tone: 'rust' },
}

export const R_AND_R_BENEFIT_STATUS_META: Record<RAndRBenefitStatus, StatusMeta> = {
    NOT_STARTED: { label: 'Not Started', tone: 'slate' },
    PLANNED: { label: 'Planned', tone: 'slate' },
    APPROVAL_PENDING: { label: 'Approval Pending', tone: 'amber' },
    APPROVED: { label: 'Approved', tone: 'ink' },
    IN_PROGRESS: { label: 'In Delivery', tone: 'amber' },
    DELIVERED: { label: 'Delivered', tone: 'signal' },
    VERIFIED: { label: 'Verified Delivery', tone: 'signal' },
    ON_HOLD: { label: 'Benefit On Hold', tone: 'rust' },
    DISPUTED: { label: 'Benefit Disputed', tone: 'rust' },
}

export const R_AND_R_BENEFIT_TYPE_META: Record<RAndRBenefitType, StatusMeta> = {
    HOUSING_ASSISTANCE: { label: 'Housing Assistance (PMAY/Site)', tone: 'ink' },
    RESETTLEMENT_SITE: { label: 'Resettlement Plot Allocation', tone: 'ink' },
    LIVELIHOOD_ASSISTANCE: { label: 'Livelihood Grant / Grant-in-Aid', tone: 'signal' },
    TRANSPORT_ASSISTANCE: { label: 'Shifting & Transport Allowance', tone: 'amber' },
    TEMPORARY_ACCOMMODATION: { label: 'Transit Accommodation', tone: 'amber' },
    EMPLOYMENT_ASSISTANCE: { label: 'Mandatory Project Employment', tone: 'signal' },
    TRAINING_ASSISTANCE: { label: 'Skill Development & Training', tone: 'ink' },
    OTHER_ASSISTANCE: { label: 'Special Vulnerability Support', tone: 'slate' },
}

export const R_AND_R_RELOCATION_STATUS_META: Record<RelocationStatus, StatusMeta> = {
    NOT_STARTED: { label: 'Not Started', tone: 'slate' },
    PLANNED: { label: 'Relocation Scheduled', tone: 'slate' },
    IN_PROGRESS: { label: 'Shifting In Progress', tone: 'amber' },
    COMPLETED: { label: 'Relocated & Settled', tone: 'signal' },
    NOT_REQUIRED: { label: 'No Relocation (In-situ)', tone: 'slate' },
}