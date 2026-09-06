import { CheckCircle2, Clock, AlertTriangle, GitCommit } from 'lucide-react'
import type { LandParcel } from '@/types'
import { PARCEL_STATUS_SEQUENCE } from '@/types/parcel'
import { PARCEL_STATUS_META } from '@/constants/status'
import { cn } from '@/lib/utils'

interface ParcelTimelineProps {
    parcel: LandParcel
}

export function ParcelTimeline({ parcel }: ParcelTimelineProps) {
    const currentIndex = PARCEL_STATUS_SEQUENCE.indexOf(parcel.status)
    const isDisputed = parcel.status === 'DISPUTED'

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-ink-900">
                        Cadastral Parcel Acquisition & Possession Lifecycle
                    </h3>
                    <p className="text-xs text-ink-500">
                        Progress tracking from initial field identification to physical possession handover
                    </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-signal-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Completed</span>
                    </span>
                    <span className="flex items-center gap-1 text-terracotta-700 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Active Stage</span>
                    </span>
                    <span className="flex items-center gap-1 text-ink-400">
                        <GitCommit className="h-3.5 w-3.5" />
                        <span>Upcoming</span>
                    </span>
                </div>
            </div>

            {/* Dispute Warning if active */}
            {isDisputed && (
                <div className="rounded-lg border border-rust-200 bg-rust-50 p-4 text-xs text-rust-900 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rust-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-bold text-rust-900">Parcel In Active Statutory / Title Dispute</p>
                        <p className="text-rust-700">
                            Ownership or boundary objections filed under Section 15 / Revenue Court. Disbursement and possession are restricted pending LAO enquiry.
                        </p>
                    </div>
                </div>
            )}

            {/* Step-by-Step Milestone Tracker */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-ink-200">
                {PARCEL_STATUS_SEQUENCE.map((stageKey, idx) => {
                    const meta = PARCEL_STATUS_META[stageKey]

                    // Determine state
                    const isCompleted = currentIndex !== -1 && idx < currentIndex
                    const isCurrent = parcel.status === stageKey
                    const isUpcoming = !isCompleted && !isCurrent

                    return (
                        <div key={stageKey} className="relative group">
                            {/* Circle Indicator */}
                            <div
                                className={cn(
                                    'absolute -left-6 sm:-left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs transition-transform group-hover:scale-110',
                                    isCompleted && 'bg-signal-600 border-signal-600 text-paper',
                                    isCurrent && 'bg-terracotta-600 border-terracotta-600 text-paper shadow-md ring-4 ring-terracotta-100',
                                    isUpcoming && 'bg-paper border-ink-300 text-ink-400',
                                )}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : isCurrent ? (
                                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                                ) : (
                                    <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                                )}
                            </div>

                            {/* Stage Info Card */}
                            <div
                                className={cn(
                                    'rounded-lg border p-3 sm:p-4 transition-colors',
                                    isCurrent
                                        ? 'border-terracotta-300 bg-terracotta-50/40 shadow-xs'
                                        : isCompleted
                                            ? 'border-ink-200 bg-paper'
                                            : 'border-dashed border-ink-200 bg-ink-50/30 opacity-75',
                                )}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-ink-900">
                                            Stage {idx + 1}: {meta?.label ?? stageKey}
                                        </span>
                                        {isCurrent && (
                                            <span className="rounded bg-terracotta-600 px-1.5 py-0.2 text-[10px] font-bold text-paper uppercase tracking-wider">
                                                Current Status
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="rounded bg-signal-50 px-1.5 py-0.2 text-[10px] font-semibold text-signal-700 border border-signal-200">
                                                Cleared
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="mt-1 text-xs text-ink-500">
                                    Statutory parcel gate: {meta?.label ?? stageKey}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
