import * as React from 'react'
import { CheckCheck, CheckCircle2, PauseCircle, PlayCircle, AlertCircle, ShieldAlert, Loader2 } from 'lucide-react'
import type { RAndRCase } from '@/types'
import {
    useCompleteRAndR,
    usePlaceRAndROnHold,
    useResumeRAndRReview,
} from '@/hooks/use-rehabilitation'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface RAndRCompletionPanelProps {
    record: RAndRCase
}

export function RAndRCompletionPanel({ record }: RAndRCompletionPanelProps) {
    const { mutate: completeCase, isPending: isCompleting } = useCompleteRAndR()
    const { mutate: placeOnHold, isPending: isHolding } = usePlaceRAndROnHold()
    const { mutate: resumeReview, isPending: isResuming } = useResumeRAndRReview()

    const [isHoldModalOpen, setIsHoldModalOpen] = React.useState(false)
    const [holdReason, setHoldReason] = React.useState('')
    const [completionRemarks, setCompletionRemarks] = React.useState('All statutory R&R entitlements, relocation, and post-resettlement inspections verified in order.')
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

    const isPending = isCompleting || isHolding || isResuming
    const isCompleted = record.rAndRStatus === 'COMPLETED'
    const isBlocked = record.rAndRStatus === 'ON_HOLD' || record.rAndRStatus === 'DISPUTED'

    // Preconditions check
    const isEligible = record.eligibilityStatus === 'ELIGIBLE'
    const isRelocationDone = !record.relocationRequired || record.relocationStatus === 'COMPLETED'
    const isVerificationDone = !record.relocationRequired || record.postRelocationVerificationStatus === 'VERIFIED'
    const hasEntitlements = record.entitlements.length > 0

    const canComplete = isEligible && isRelocationDone && isVerificationDone && hasEntitlements && !isBlocked

    const handleComplete = () => {
        setErrorMsg(null)
        if (!canComplete) {
            setErrorMsg('Mandatory preconditions must be resolved before closing this R&R case.')
            return
        }

        completeCase(
            { id: record.id, remarks: completionRemarks },
            {
                onSuccess: () => {
                    setSuccessMsg('R&R Case successfully marked COMPLETED and archived.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
                onError: (err: unknown) => {
                    const message = err instanceof Error ? err.message : 'Failed to complete R&R case'
                    setErrorMsg(message)
                },
            },
        )
    }

    const handleHoldSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!holdReason.trim()) return

        placeOnHold(
            { id: record.id, reason: holdReason },
            {
                onSuccess: () => {
                    setIsHoldModalOpen(false)
                    setHoldReason('')
                    setSuccessMsg('R&R Case placed on hold.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const handleResume = () => {
        resumeReview(
            { id: record.id, remarks: 'Stay / hold resolved; R&R process resumed.' },
            {
                onSuccess: () => {
                    setSuccessMsg('R&R review resumed.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper">
                        <CheckCheck className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">R&R Case Final Settlement & Closure</h3>
                        <p className="text-[11px] text-ink-500">
                            Statutory closure following full benefit delivery and post-relocation verification
                        </p>
                    </div>
                </div>

                <StatusBadge status={record.rAndRStatus} type="randr" />
            </div>

            {successMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3.5 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {errorMsg && (
                <div className="rounded-lg border border-rust-200 bg-rust-50 p-3.5 text-xs text-rust-900 flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 text-rust-700 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {isBlocked && (
                <div className="rounded-lg border border-rust-200 bg-rust-50/60 p-3.5 text-xs text-rust-900 space-y-1">
                    <strong className="block flex items-center gap-1">
                        <ShieldAlert className="h-4 w-4 text-rust-600" />
                        <span>R&R Case Blocked / Under Hold:</span>
                    </strong>
                    <p>{record.holdReason || record.disputeReason || 'Case is currently paused pending dispute resolution.'}</p>
                </div>
            )}

            {/* Precondition Checklist Grid */}
            {!isCompleted && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${isEligible ? 'bg-signal-50/50 border-signal-200 text-signal-900' : 'bg-amber-50/50 border-amber-200 text-amber-900'}`}>
                        {isEligible ? <CheckCircle2 className="h-4 w-4 text-signal-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />}
                        <span>1. Eligibility Assessment: <strong>{record.eligibilityStatus}</strong></span>
                    </div>

                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${hasEntitlements ? 'bg-signal-50/50 border-signal-200 text-signal-900' : 'bg-amber-50/50 border-amber-200 text-amber-900'}`}>
                        {hasEntitlements ? <CheckCircle2 className="h-4 w-4 text-signal-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />}
                        <span>2. Entitlements Defined: <strong>{record.entitlements.length} Packages</strong></span>
                    </div>

                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${isRelocationDone ? 'bg-signal-50/50 border-signal-200 text-signal-900' : 'bg-amber-50/50 border-amber-200 text-amber-900'}`}>
                        {isRelocationDone ? <CheckCircle2 className="h-4 w-4 text-signal-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />}
                        <span>3. Relocation Shifting: <strong>{record.relocationStatus}</strong></span>
                    </div>

                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${isVerificationDone ? 'bg-signal-50/50 border-signal-200 text-signal-900' : 'bg-amber-50/50 border-amber-200 text-amber-900'}`}>
                        {isVerificationDone ? <CheckCircle2 className="h-4 w-4 text-signal-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />}
                        <span>4. Spot Verification: <strong>{record.postRelocationVerificationStatus ?? (record.relocationRequired ? 'PENDING' : 'N/A')}</strong></span>
                    </div>
                </div>
            )}

            {isCompleted ? (
                <div className="rounded-lg border border-signal-200 bg-signal-50/60 p-4 text-xs text-signal-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                        <CheckCheck className="h-4 w-4 text-signal-700" />
                        <span>Rehabilitation & Resettlement Fully Completed</span>
                    </div>
                    <p className="text-[11px] text-signal-800">
                        Case officially closed on {record.completionDate ? formatDate(record.completionDate) : 'Completed'}. All Second Schedule entitlements verified.
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-ink-800">Competent Officer Case Closure Attestation</label>
                    <textarea
                        value={completionRemarks}
                        onChange={(e) => setCompletionRemarks(e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-ink-300 bg-paper p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ink-100">
                <span className="text-[11px] text-ink-500 font-mono">
                    Officer In Charge: {record.assignedOfficer}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                    {record.rAndRStatus === 'ON_HOLD' ? (
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isPending}
                            onClick={handleResume}
                            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                            {isResuming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                            <span>Resume Review</span>
                        </Button>
                    ) : (
                        <>
                            {!isCompleted && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isPending}
                                        onClick={() => setIsHoldModalOpen(true)}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 border-amber-300 hover:bg-amber-50 cursor-pointer"
                                    >
                                        <PauseCircle className="h-3.5 w-3.5" />
                                        <span>Place On Hold</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        disabled={isPending || !canComplete}
                                        onClick={handleComplete}
                                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                                    >
                                        {isCompleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                                        <span>Complete R&R Case</span>
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Place On Hold Modal */}
            {isHoldModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rust-100 text-rust-900">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Place R&R Case On Hold</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Case ID: {record.id}</p>
                            </div>
                        </div>

                        <form onSubmit={handleHoldSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Reason for Statutory Hold / Dispute</label>
                                <textarea
                                    value={holdReason}
                                    onChange={(e) => setHoldReason(e.target.value)}
                                    placeholder="Enter judicial stay order reference, title dispute details, or documentation issue..."
                                    rows={3}
                                    required
                                    className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsHoldModalOpen(false)} disabled={isHolding}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isHolding} className="flex items-center gap-1.5 bg-rust-700 hover:bg-rust-800">
                                    {isHolding && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Place On Hold</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
