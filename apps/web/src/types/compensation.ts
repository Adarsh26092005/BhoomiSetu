export type CompensationStatus = 'CALCULATED' | 'APPROVED' | 'DISBURSED' | 'DISPUTED'

export type CompensationAssessmentStatus =
    | 'ASSESSMENT_PENDING'
    | 'UNDER_ASSESSMENT'
    | 'ASSESSMENT_COMPLETED'
    | 'AWARD_PENDING'
    | 'AWARD_DECLARED'
    | 'PAYMENT_APPROVAL_PENDING'
    | 'PAYMENT_APPROVED'
    | 'DISBURSEMENT_PENDING'
    | 'PARTIALLY_DISBURSED'
    | 'DISBURSED'
    | 'ON_HOLD'
    | 'DISPUTED'

export type CompensationPaymentStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'PROCESSING'
    | 'PARTIALLY_DISBURSED'
    | 'DISBURSED'
    | 'FAILED'
    | 'ON_HOLD'
    | 'DISPUTED'

export interface LandownerCompensation {
    id: string
    compensationId: string
    parcelId: string
    landownerId: string
    displayName: string
    ownershipShare: number // e.g. 0.6 (60%)
    eligibleAreaHectares: number
    marketValueShareInr: number
    solatiumShareInr: number
    additionalBenefitsInr: number
    deductionsInr: number
    payableAmountInr: number
    disbursedAmountInr: number
    pendingAmountInr: number
    paymentStatus: CompensationPaymentStatus
    bankReferenceMasked: string // e.g. "SBI A/C •••• 4821 (PFMS Mapped)"
    remarks?: string
}

export interface CompensationPaymentTransaction {
    id: string
    compensationId: string
    landownerId?: string
    transactionReference: string
    date: string
    amountInr: number
    paymentStatus: CompensationPaymentStatus
    recordedBy: string
    remarks?: string
}

export interface CompensationTimelineEvent {
    id: string
    compensationId: string
    timestamp: string
    actor: string
    role: string
    organization: string
    action: string
    remarks?: string
}

export interface CompensationRecord {
    id: string
    projectId: string
    projectCode: string
    projectName: string
    parcelId: string
    surveyNumber: string
    awardId?: string
    awardDate?: string
    awardAuthority?: string
    assessmentId: string
    landownerCount: number
    landAreaHectares: number
    landClassification: string
    assessmentStatus: CompensationAssessmentStatus
    awardStatus?: string
    paymentStatus: CompensationPaymentStatus
    totalMarketValueInr: number
    solatiumAmountInr: number // 100% statutory solatium under RFCTLARR Sec 30(1)
    additionalCompensationInr: number // 12% annual interest under Sec 30(3)
    statutoryBenefitsInr: number // Structures, crops, rehabilitation allowance
    deductionsInr: number // Capital gains / statutory deductions
    totalAssessedAmountInr: number
    totalPayableAmountInr: number
    amountDisbursedInr: number
    amountPendingInr: number
    assessmentDate: string
    awardDeclaredDate?: string
    approvedDate?: string
    lastUpdatedAt: string
    assessingOfficer?: string
    holdReason?: string
    disputeReason?: string
    remarks?: string
    landowners: LandownerCompensation[]
    transactions: CompensationPaymentTransaction[]
    timeline: CompensationTimelineEvent[]
}
