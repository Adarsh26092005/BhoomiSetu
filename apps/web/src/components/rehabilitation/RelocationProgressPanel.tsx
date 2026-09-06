import * as React from 'react'
import { Truck, Calendar, CheckCircle2, Loader2, Home } from 'lucide-react'
import type { RAndRCase } from '@/types'
import { useScheduleRelocation, useRecordRelocation } from '@/hooks/use-rehabilitation'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface RelocationProgressPanelProps {
    record: RAndRCase
}

export function RelocationProgressPanel({ record }: RelocationProgressPanelProps) {
    const { mutate: scheduleRelocation, isPending: isScheduling } = useScheduleRelocation()
    const { mutate: recordRelocation, isPending: isRecording } = useRecordRelocation()

    const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false)
    const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false)

    // Schedule state
    const [relocationDate, setRelocationDate] = React.useState(
        record.relocationDate ?? '2026-09-30',
    )
    const [siteRef, setSiteRef] = React.useState('DEV-RNR-SEC-4')
    const [location, setLocation] = React.useState('Devanahalli Model R&R Township, Sector 4, Plot 14')
    const [scheduleRemarks, setScheduleRemarks] = React.useState('')

    // Complete state
    const [completionDate, setCompletionDate] = React.useState(new Date().toISOString().split('T')[0])
    const [completeRemarks, setCompleteRemarks] = React.useState('Household physical shifting complete; keys handed over.')
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const isPending = isScheduling || isRecording

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        scheduleRelocation(
            {
                id: record.id,
                relocationDate,
                siteReference: siteRef,
                location,
                remarks: scheduleRemarks,
            },
            {
                onSuccess: () => {
                    setIsScheduleModalOpen(false)
                    setSuccessMsg('Household physical relocation scheduled.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const handleCompleteSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        recordRelocation(
            {
                id: record.id,
                completionDate,
                remarks: completeRemarks,
            },
            {
                onSuccess: () => {
                    setIsCompleteModalOpen(false)
                    setSuccessMsg('Physical shifting marked completed. Post-relocation verification pending.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const isRelocated = record.relocationStatus === 'COMPLETED'
    const isNotRequired = record.relocationStatus === 'NOT_REQUIRED'

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <Truck className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Physical Relocation & Resettlement Tracking</h3>
                        <p className="text-[11px] text-ink-500">
                            Household shifting, transit arrangements, and resettlement township allotment
                        </p>
                    </div>
                </div>

                <StatusBadge status={record.relocationStatus} type="randr-relocation" />
            </div>

            {successMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Relocation Requirement</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5">
                        {record.relocationRequired ? 'Physically Displaced Family' : 'In-situ (No Shifting Needed)'}
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Relocation Target / Date</dt>
                    <dd className="font-mono font-bold text-ink-900 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-ink-500" />
                        <span>{record.relocationDate ? formatDate(record.relocationDate) : 'Not Scheduled'}</span>
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Resettlement Site Reference</dt>
                    <dd className="font-mono font-bold text-terracotta-700 mt-0.5 flex items-center gap-1">
                        <Home className="h-3.5 w-3.5" />
                        <span>{record.resettlementSite?.siteReference ?? 'None Allocated'}</span>
                    </dd>
                </div>
            </dl>

            {/* Action Bar */}
            {!isNotRequired && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-100 text-xs">
                    <span className="text-[11px] text-ink-500 font-mono">
                        {isRelocated ? 'Shifting Completed' : 'Shifting Actions Available'}
                    </span>

                    <div className="flex items-center gap-2">
                        {!isRelocated && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isPending || record.rAndRStatus === 'ON_HOLD' || record.rAndRStatus === 'DISPUTED'}
                                    onClick={() => setIsScheduleModalOpen(true)}
                                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                                >
                                    <Calendar className="h-3.5 w-3.5 text-ink-600" />
                                    <span>Schedule Shifting</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    disabled={isPending || record.rAndRStatus === 'ON_HOLD' || record.rAndRStatus === 'DISPUTED'}
                                    onClick={() => setIsCompleteModalOpen(true)}
                                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                                >
                                    <Truck className="h-3.5 w-3.5" />
                                    <span>Mark Relocation Completed</span>
                                </Button>
                            </>
                        )}

                        {isRelocated && (
                            <span className="text-signal-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4 text-signal-600" />
                                <span>Physical Relocation Completed</span>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-900">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Schedule Household Relocation</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Household: {record.household.householdReference}</p>
                            </div>
                        </div>

                        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Designated Relocation Date</label>
                                <input
                                    type="date"
                                    value={relocationDate}
                                    onChange={(e) => setRelocationDate(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Resettlement Plot / Unit Identifier</label>
                                <input
                                    type="text"
                                    value={siteRef}
                                    onChange={(e) => setSiteRef(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Relocation Destination Site & Layout</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Shifting Logistics & Police Bandobast Notes</label>
                                <textarea
                                    value={scheduleRemarks}
                                    onChange={(e) => setScheduleRemarks(e.target.value)}
                                    placeholder="Enter transport vehicle allocation or transit support notes..."
                                    rows={2}
                                    className="w-full rounded-md border border-ink-300 p-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                    {isScheduling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Schedule Shifting</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complete Relocation Modal */}
            {isCompleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-100 text-signal-900">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Record Relocation Completion</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Household: {record.household.householdReference}</p>
                            </div>
                        </div>

                        <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Actual Relocation Completion Date</label>
                                <input
                                    type="date"
                                    value={completionDate}
                                    onChange={(e) => setCompletionDate(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Handover Remarks & Key Handover</label>
                                <textarea
                                    value={completeRemarks}
                                    onChange={(e) => setCompleteRemarks(e.target.value)}
                                    rows={3}
                                    required
                                    className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsCompleteModalOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                    {isRecording && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Confirm Relocation Completed</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
