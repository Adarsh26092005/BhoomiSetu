import * as React from 'react'
import { ShieldCheck, XCircle, PauseCircle, PlayCircle, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import type { CompensationRecord } from '@/types'
import {
    useApproveAssessment,
    useReturnAssessment,
    usePlaceCompensationOnHold,
    useResumeCompensationReview,
} from '@/hooks/use-compensation'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'

interface CompensationAssessmentPanelProps {
    record: CompensationRecord
}

export function CompensationAssessmentPanel({ record }: CompensationAssessmentPanelProps) {
    const { mutate: approve, isPending: isApproving } = useApproveAssessment()
    const { mutate: returnAssessment, isPending: isReturning } = useReturnAssessment()
    const { mutate: placeOnHold, isPending: isHolding } = usePlaceCompensationOnHold()
    const { mutate: resumeReview, isPending: isResuming } = useResumeCompensationReview()

    const [remarks, setRemarks] = React.useState('')
    const [actionModal, setActionModal] = React.useState<'NONE' | 'APPROVE' | 'RETURN' | 'HOLD' | 'RESUME'>('NONE')
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

    const isPending = isApproving || isReturning || isHolding || isResuming

    const handleExecuteAction = () => {
        if (actionModal === 'APPROVE') {
            approve(
                { id: record.id, remarks: remarks || 'Assessment approved and sanctioned for disbursement' },
                {
                    onSuccess: () => {
                        setActionModal('NONE')
                        setRemarks('')
                        setSuccessMessage('Compensation assessment approved and cleared for payment.')
                        setTimeout(() => setSuccessMessage(null), 4000)
                    },
                },
            )
        } else if (actionModal === 'RETURN') {
            if (!remarks.trim()) {
                alert('Please state the valuation discrepancy or reason for returning.')
                return
            }
            returnAssessment(
                { id: record.id, remarks },
                {
                    onSuccess: () => {
                        setActionModal('NONE')
                        setRemarks('')
                        setSuccessMessage('Assessment returned for spot review & re-valuation.')
                        setTimeout(() => setSuccessMessage(null), 4000)
                    },
                },
            )
        } else if (actionModal === 'HOLD') {
            if (!remarks.trim()) {
                alert('Please state the stay order or reason for holding payment.')
                return
            }
            placeOnHold(
                { id: record.id, remarks },
                {
                    onSuccess: () => {
                        setActionModal('NONE')
                        setRemarks('')
                        setSuccessMessage('Compensation case placed on statutory hold.')
                        setTimeout(() => setSuccessMessage(null), 4000)
                    },
                },
            )
        } else if (actionModal === 'RESUME') {
            resumeReview(
                { id: record.id, remarks: remarks || 'Stay resolved; review resumed' },
                {
                    onSuccess: () => {
                        setActionModal('NONE')
                        setRemarks('')
                        setSuccessMessage('Review resumed for compensation processing.')
                        setTimeout(() => setSuccessMessage(null), 4000)
                    },
                },
            )
        }
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Competent Authority Assessment Workstation</h3>
                        <p className="text-[11px] text-ink-500">Valuation sign-off, scrutiny return, and statutory stay actions</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-500">Assessment Stage:</span>
                    <StatusBadge status={record.assessmentStatus} type="compensation-assessment" />
                </div>
            </div>

            {successMessage && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3.5 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {record.holdReason && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 space-y-1">
                    <strong className="block">Statutory Stay / Hold Notice:</strong>
                    <p>{record.holdReason}</p>
                </div>
            )}

            {record.disputeReason && (
                <div className="rounded-lg border border-rust-200 bg-rust-50/60 p-3.5 text-xs text-rust-900 space-y-1">
                    <strong className="block">Title Partition / Judicial Dispute:</strong>
                    <p>{record.disputeReason}</p>
                </div>
            )}

            {/* Officer Decision Note Input */}
            <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-ink-800">Assessing Officer Scrutiny & Sanction Remarks</label>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter valuation scrutiny findings, circle rate approval memo, or return directions..."
                    rows={3}
                    className="w-full rounded-md border border-ink-300 bg-paper p-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ink-100">
                <span className="text-[11px] text-ink-400 font-mono">
                    Officer: {record.assessingOfficer ?? 'Anand Kumar (LAO Officer)'}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                    {record.assessmentStatus === 'ON_HOLD' ? (
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isPending}
                            onClick={() => setActionModal('RESUME')}
                            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                            <PlayCircle className="h-3.5 w-3.5" />
                            <span>Resume Review</span>
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isPending || record.assessmentStatus === 'DISBURSED'}
                                onClick={() => setActionModal('HOLD')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 border-amber-300 hover:bg-amber-50 cursor-pointer"
                            >
                                <PauseCircle className="h-3.5 w-3.5" />
                                <span>Place On Hold</span>
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isPending || record.assessmentStatus === 'DISBURSED'}
                                onClick={() => setActionModal('RETURN')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-rust-700 border-rust-300 hover:bg-rust-50 cursor-pointer"
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Return for Review</span>
                            </Button>

                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={isPending || record.assessmentStatus === 'PAYMENT_APPROVED' || record.assessmentStatus === 'DISBURSED'}
                                onClick={() => setActionModal('APPROVE')}
                                className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                            >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Approve Assessment</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Action Confirmation Modal */}
            {actionModal !== 'NONE' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-900">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">
                                    {actionModal === 'APPROVE' && 'Confirm Valuation & Assessment Approval'}
                                    {actionModal === 'RETURN' && 'Confirm Return for Spot Re-valuation'}
                                    {actionModal === 'HOLD' && 'Confirm Placing Compensation on Hold'}
                                    {actionModal === 'RESUME' && 'Confirm Resuming Compensation Review'}
                                </h3>
                                <p className="text-[11px] text-ink-500 font-mono">Case ID: {record.id}</p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3 text-xs text-ink-700">
                            {actionModal === 'APPROVE' && (
                                <p>
                                    You are endorsing the statutory valuation of <strong>{record.id}</strong> ({record.surveyNumber}). Payment status will advance to <strong>PAYMENT_APPROVED</strong>.
                                </p>
                            )}
                            {actionModal === 'RETURN' && (
                                <p>
                                    The assessment will be remanded to the spot inspection team for revision with your recorded remarks.
                                </p>
                            )}
                            {actionModal === 'HOLD' && (
                                <p>
                                    All DBT disbursement activities will be paused and placed under statutory hold.
                                </p>
                            )}
                            {actionModal === 'RESUME' && (
                                <p>
                                    Statutory stay will be marked resolved and the case returned to active review queue.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                                onClick={() => setActionModal('NONE')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={isPending}
                                onClick={handleExecuteAction}
                                className="flex items-center gap-1.5"
                            >
                                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                <span>Confirm Action</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
