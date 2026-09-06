import * as React from 'react'
import { Flag, CheckCircle2, PauseCircle, PlayCircle, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import type { PossessionRecord } from '@/types'
import {
    useRecordPossession,
    usePlacePossessionOnHold,
    useResumePossessionReview,
} from '@/hooks/use-possession'
import { SchedulePossessionModal } from '@/components/possession/SchedulePossessionModal'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'

interface PossessionActionPanelProps {
    record: PossessionRecord
}

export function PossessionActionPanel({ record }: PossessionActionPanelProps) {
    const { mutate: recordPossession, isPending: isTaking } = useRecordPossession()
    const { mutate: placeOnHold, isPending: isHolding } = usePlacePossessionOnHold()
    const { mutate: resumeReview, isPending: isResuming } = useResumePossessionReview()

    const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false)
    const [isTakeModalOpen, setIsTakeModalOpen] = React.useState(false)
    const [isHoldModalOpen, setIsHoldModalOpen] = React.useState(false)

    const [possessionDate, setPossessionDate] = React.useState(new Date().toISOString().split('T')[0])
    const [officer, setOfficer] = React.useState(record.assignedOfficer ?? 'Anand Kumar')
    const [remarks, setRemarks] = React.useState('')
    const [holdReason, setHoldReason] = React.useState('')
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const isPending = isTaking || isHolding || isResuming
    const isTaken = record.possessionStatus === 'POSSESSION_TAKEN' || record.possessionStatus === 'CERTIFICATE_PENDING' || record.possessionStatus === 'CERTIFICATE_ISSUED'
    const isBlocked = record.possessionStatus === 'ON_HOLD' || record.possessionStatus === 'DISPUTED' || record.readinessStatus === 'BLOCKED'

    const handleRecordPossession = (e: React.FormEvent) => {
        e.preventDefault()
        recordPossession(
            { id: record.id, possessionDate, officer, remarks },
            {
                onSuccess: () => {
                    setIsTakeModalOpen(false)
                    setSuccessMsg('Physical possession successfully recorded under Section 38 RFCTLARR Act 2013.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const handlePlaceOnHold = (e: React.FormEvent) => {
        e.preventDefault()
        if (!holdReason.trim()) {
            alert('Please specify the reason for placing possession on hold.')
            return
        }
        placeOnHold(
            { id: record.id, reason: holdReason },
            {
                onSuccess: () => {
                    setIsHoldModalOpen(false)
                    setHoldReason('')
                    setSuccessMsg('Possession case placed on statutory hold.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const handleResume = () => {
        resumeReview(
            { id: record.id, remarks: 'Stay resolved; possession preparation resumed' },
            {
                onSuccess: () => {
                    setSuccessMsg('Possession review resumed.')
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
                        <Flag className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Competent Authority Handover Workstation</h3>
                        <p className="text-[11px] text-ink-500">Statutory land possession execution under Section 38 RFCTLARR Act 2013</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-500">Stage:</span>
                    <StatusBadge status={record.possessionStatus} type="possession" />
                </div>
            </div>

            {successMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3.5 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {isBlocked && (
                <div className="rounded-lg border border-rust-200 bg-rust-50/60 p-3.5 text-xs text-rust-900 space-y-1">
                    <strong className="block">Physical Possession Execution Blocked:</strong>
                    <p>
                        {record.holdReason || record.disputeReason || 'One or more mandatory statutory preconditions on the readiness checklist are pending or blocked.'}
                    </p>
                </div>
            )}

            {isTaken ? (
                <div className="rounded-lg border border-signal-200 bg-signal-50/60 p-4 text-xs text-signal-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                        <CheckCircle2 className="h-4 w-4 text-signal-700" />
                        <span>Physical Possession Officially Executed</span>
                    </div>
                    <p className="text-[11px] text-signal-800">
                        Possession taken on {record.possessionDate} by Competent Officer {record.assignedOfficer}. Proceed to Form 22 Certificate issuance.
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-ink-800">Officer Executive Action Notes</label>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter on-site physical handover memo, surveyor confirmation, or boundary pillaring details..."
                        rows={3}
                        className="w-full rounded-md border border-ink-300 bg-paper p-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ink-100">
                <span className="text-[11px] text-ink-500 font-mono">
                    Authority: {record.assignedOfficer}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                    {record.possessionStatus === 'ON_HOLD' ? (
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
                            {!isTaken && (
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
                                        variant="outline"
                                        size="sm"
                                        disabled={isPending}
                                        onClick={() => setIsScheduleModalOpen(true)}
                                        className="flex items-center gap-1.5 text-xs font-semibold"
                                    >
                                        <Calendar className="h-3.5 w-3.5 text-ink-600" />
                                        <span>Schedule Drive</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        disabled={isPending || isBlocked}
                                        onClick={() => setIsTakeModalOpen(true)}
                                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                                    >
                                        <Flag className="h-3.5 w-3.5" />
                                        <span>Record Physical Possession</span>
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Schedule Modal */}
            <SchedulePossessionModal
                record={record}
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
            />

            {/* Take Possession Confirmation Modal */}
            {isTakeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-100 text-signal-900">
                                <Flag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Confirm Physical Possession Handover</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Plot: {record.surveyNumber} ({record.village})</p>
                            </div>
                        </div>

                        <form onSubmit={handleRecordPossession} className="space-y-4 text-xs">
                            <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-3 space-y-1">
                                <p className="text-ink-800">
                                    You are certifying that physical possession of cadastral parcel <strong>{record.surveyNumber}</strong> ({record.landAreaHectares} ha) has been secured free of all encumbrances under Section 38 RFCTLARR Act 2013.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Physical Handover Execution Date</label>
                                <input
                                    type="date"
                                    value={possessionDate}
                                    onChange={(e) => setPossessionDate(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Possession Officer In Charge</label>
                                <input
                                    type="text"
                                    value={officer}
                                    onChange={(e) => setOfficer(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Handover Remarks</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter physical handover memo details..."
                                    rows={2}
                                    className="w-full rounded-md border border-ink-300 p-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsTakeModalOpen(false)} disabled={isTaking}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isTaking} className="flex items-center gap-1.5">
                                    {isTaking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Confirm & Record Possession</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Place On Hold Modal */}
            {isHoldModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rust-100 text-rust-900">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Place Possession On Hold</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Case ID: {record.id}</p>
                            </div>
                        </div>

                        <form onSubmit={handlePlaceOnHold} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Reason for Statutory Hold / Injunction</label>
                                <textarea
                                    value={holdReason}
                                    onChange={(e) => setHoldReason(e.target.value)}
                                    placeholder="Enter judicial stay order reference, title dispute details, or spot boundary issue..."
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
