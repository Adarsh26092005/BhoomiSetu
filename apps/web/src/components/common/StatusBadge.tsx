import { cn } from '@/lib/utils'
import {
    PROJECT_STATUS_META,
    PARCEL_STATUS_META,
    COMPENSATION_STATUS_META,
    POSSESSION_STATUS_META,
    POSSESSION_TYPE_META,
    POSSESSION_SLA_STATUS_META,
    DOCUMENT_VERIFICATION_STATUS_META,
    WORKFLOW_TASK_STATUS_META,
    WORKFLOW_PRIORITY_META,
    WORKFLOW_SLA_STATUS_META,
    COMPENSATION_ASSESSMENT_STATUS_META,
    COMPENSATION_PAYMENT_STATUS_META,
    R_AND_R_STATUS_META,
    R_AND_R_ELIGIBILITY_STATUS_META,
    R_AND_R_BENEFIT_STATUS_META,
    R_AND_R_BENEFIT_TYPE_META,
    R_AND_R_RELOCATION_STATUS_META,
} from '@/constants/status'
import type {
    ProjectStatus,
    ParcelStatus,
    CompensationStatus,
    PossessionStatus,
    PossessionType,
    PossessionSlaStatus,
    VerificationStatus,
    WorkflowTaskStatus,
    WorkflowPriority,
    WorkflowSlaStatus,
    CompensationAssessmentStatus,
    CompensationPaymentStatus,
    RAndRStatus,
    RAndREligibilityStatus,
    RAndRBenefitStatus,
    RAndRBenefitType,
    RelocationStatus,
} from '@/types'

type AnyStatus =
    | ProjectStatus
    | ParcelStatus
    | CompensationStatus
    | PossessionStatus
    | PossessionType
    | PossessionSlaStatus
    | VerificationStatus
    | WorkflowTaskStatus
    | WorkflowPriority
    | WorkflowSlaStatus
    | CompensationAssessmentStatus
    | CompensationPaymentStatus
    | RAndRStatus
    | RAndREligibilityStatus
    | RAndRBenefitStatus
    | RAndRBenefitType
    | RelocationStatus

interface StatusBadgeProps {
    status: AnyStatus
    type?:
        | 'project'
        | 'parcel'
        | 'compensation'
        | 'possession'
        | 'possession-type'
        | 'possession-sla'
        | 'document'
        | 'workflow'
        | 'priority'
        | 'sla'
        | 'compensation-assessment'
        | 'compensation-payment'
        | 'randr'
        | 'randr-eligibility'
        | 'randr-benefit'
        | 'randr-benefit-type'
        | 'randr-relocation'
    className?: string
}

export function StatusBadge({ status, type = 'project', className }: StatusBadgeProps) {
    let meta: { label: string; tone: 'ink' | 'amber' | 'signal' | 'rust' | 'slate' } = {
        label: String(status),
        tone: 'slate',
    }

    if (type === 'project' && status in PROJECT_STATUS_META) {
        meta = PROJECT_STATUS_META[status as ProjectStatus]
    } else if (type === 'parcel' && status in PARCEL_STATUS_META) {
        meta = PARCEL_STATUS_META[status as ParcelStatus]
    } else if (type === 'compensation' && status in COMPENSATION_STATUS_META) {
        meta = COMPENSATION_STATUS_META[status as CompensationStatus]
    } else if (type === 'possession' && status in POSSESSION_STATUS_META) {
        meta = POSSESSION_STATUS_META[status as PossessionStatus]
    } else if (type === 'possession-type' && status in POSSESSION_TYPE_META) {
        meta = POSSESSION_TYPE_META[status as PossessionType]
    } else if (type === 'possession-sla' && status in POSSESSION_SLA_STATUS_META) {
        meta = POSSESSION_SLA_STATUS_META[status as PossessionSlaStatus]
    } else if (type === 'document' && status in DOCUMENT_VERIFICATION_STATUS_META) {
        meta = DOCUMENT_VERIFICATION_STATUS_META[status as VerificationStatus]
    } else if (type === 'workflow' && status in WORKFLOW_TASK_STATUS_META) {
        meta = WORKFLOW_TASK_STATUS_META[status as WorkflowTaskStatus]
    } else if (type === 'priority' && status in WORKFLOW_PRIORITY_META) {
        meta = WORKFLOW_PRIORITY_META[status as WorkflowPriority]
    } else if (type === 'sla' && status in WORKFLOW_SLA_STATUS_META) {
        meta = WORKFLOW_SLA_STATUS_META[status as WorkflowSlaStatus]
    } else if (type === 'compensation-assessment' && status in COMPENSATION_ASSESSMENT_STATUS_META) {
        meta = COMPENSATION_ASSESSMENT_STATUS_META[status as CompensationAssessmentStatus]
    } else if (type === 'compensation-payment' && status in COMPENSATION_PAYMENT_STATUS_META) {
        meta = COMPENSATION_PAYMENT_STATUS_META[status as CompensationPaymentStatus]
    } else if (type === 'randr' && status in R_AND_R_STATUS_META) {
        meta = R_AND_R_STATUS_META[status as RAndRStatus]
    } else if (type === 'randr-eligibility' && status in R_AND_R_ELIGIBILITY_STATUS_META) {
        meta = R_AND_R_ELIGIBILITY_STATUS_META[status as RAndREligibilityStatus]
    } else if (type === 'randr-benefit' && status in R_AND_R_BENEFIT_STATUS_META) {
        meta = R_AND_R_BENEFIT_STATUS_META[status as RAndRBenefitStatus]
    } else if (type === 'randr-benefit-type' && status in R_AND_R_BENEFIT_TYPE_META) {
        meta = R_AND_R_BENEFIT_TYPE_META[status as RAndRBenefitType]
    } else if (type === 'randr-relocation' && status in R_AND_R_RELOCATION_STATUS_META) {
        meta = R_AND_R_RELOCATION_STATUS_META[status as RelocationStatus]
    }

    const toneClasses = {
        signal: 'bg-signal-50 text-signal-800 border-signal-200',
        rust: 'bg-rust-50 text-rust-800 border-rust-200',
        amber: 'bg-amber-50 text-amber-800 border-amber-200',
        ink: 'bg-ink-100 text-ink-900 border-ink-300',
        slate: 'bg-slate-100 text-slate-700 border-slate-300',
    }[meta.tone]

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold border tracking-wide whitespace-nowrap',
                toneClasses,
                className,
            )}
        >
            <span
                className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    meta.tone === 'signal' && 'bg-signal-600',
                    meta.tone === 'rust' && 'bg-rust-600',
                    meta.tone === 'amber' && 'bg-amber-600',
                    meta.tone === 'ink' && 'bg-ink-800',
                    meta.tone === 'slate' && 'bg-slate-500',
                )}
            />
            <span>{meta.label}</span>
        </span>
    )
}
