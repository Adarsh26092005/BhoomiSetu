import * as React from 'react'
import { FileCheck, PlayCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import type { RAndRCase, RAndREligibilityStatus } from '@/types'
import {
    useStartEligibilityReview,
    useRecordEligibilityAssessment,
} from '@/hooks/use-rehabilitation'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface RAndREligibilityPanelProps {
    record: RAndRCase
}

export function RAndREligibilityPanel({ record }: RAndREligibilityPanelProps) {
    const { mutate: startReview, isPending: isStarting } = useStartEligibilityReview()
    const { mutate: recordAssessment, isPending: isRecording } = useRecordEligibilityAssessment()

    const [isAssessModalOpen, setIsAssessModalOpen] = React.useState(false)
    const [statusChoice, setStatusChoice] = React.useState<RAndREligibilityStatus>('ELIGIBLE')
    const [remarks, setRemarks] = React.useState('Eligible under Second Schedule RFCTLARR Act 2013.')
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const isPending = isStarting || isRecording

    const handleStart = () => {
        startReview(
            { id: record.id },
            {
                onSuccess: () => {
                    setSuccessMsg('Eligibility scrutiny process commenced.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const handleRecord = (e: React.FormEvent) => {
        e.preventDefault()
        recordAssessment(
            { id: record.id, status: statusChoice, remarks },
            {
                onSuccess: () => {
                    setIsAssessModalOpen(false)
                    setSuccessMsg('Demo operational eligibility assessment successfully recorded.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <FileCheck className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">R&R Eligibility Assessment</h3>
                        <p className="text-[11px] text-ink-500">
                            Pre-requisite statutory scrutiny of household displacement and entitlement criteria
                        </p>
                    </div>
                </div>

                <StatusBadge status={record.eligibilityStatus} type="randr-eligibility" />
            </div>

            {successMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Assessment Status</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5 flex items-center gap-1.5">
                        <StatusBadge status={record.eligibilityStatus} type="randr-eligibility" />
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Assessment Date & Officer</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5">
                        {record.assessmentDate ? `${formatDate(record.assessmentDate)} (${record.assessingOfficer ?? record.assignedOfficer})` : 'Under Assessment'}
                    </dd>
                </div>

                <div className="sm:col-span-2">
                    <dt className="text-ink-400 font-medium text-[11px]">Entitlement Assessment Summary</dt>
                    <dd className="font-medium text-ink-800 mt-0.5 leading-relaxed bg-ink-50 p-2.5 rounded-lg border border-ink-100">
                        {record.entitlementSummary || 'Awaiting final entitlement definition.'}
                    </dd>
                </div>
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-100 text-xs">
                <span className="text-[11px] text-ink-400 italic">
                    * Demo operational assessment (not a final legally binding decree).
                </span>

                <div className="flex items-center gap-2">
                    {record.eligibilityStatus === 'PENDING' && (
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isPending}
                            onClick={handleStart}
                            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                            {isStarting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                            <span>Start Eligibility Review</span>
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || record.rAndRStatus === 'ON_HOLD' || record.rAndRStatus === 'DISPUTED'}
                        onClick={() => setIsAssessModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                        <FileCheck className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>Record Assessment</span>
                    </Button>
                </div>
            </div>

            {/* Assessment Modal */}
            {isAssessModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-900">
                                <FileCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Record Operational Eligibility Assessment</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Household: {record.household.householdReference}</p>
                            </div>
                        </div>

                        <form onSubmit={handleRecord} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Assessment Result</label>
                                <select
                                    value={statusChoice}
                                    onChange={(e) => setStatusChoice(e.target.value as RAndREligibilityStatus)}
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                >
                                    <option value="ELIGIBLE">ELIGIBLE (Meets RFCTLARR Second Schedule Criteria)</option>
                                    <option value="REQUIRES_DOCUMENTATION">REQUIRES_DOCUMENTATION (Tenancy / Residence Proof Missing)</option>
                                    <option value="NOT_ELIGIBLE">NOT_ELIGIBLE (Outside Acquired Boundary / Not Displaced)</option>
                                    <option value="DISPUTED">DISPUTED (Co-sharer / Boundary Dispute Raised)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Scrutiny Remarks & Officer Findings</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    rows={3}
                                    required
                                    className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-ink-500">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                <span>Records operational demo state in system.</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsAssessModalOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                    {isRecording && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Log Assessment</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
