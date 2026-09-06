import { CheckCircle2, Clock, AlertTriangle, GitCommit } from 'lucide-react'
import type { AcquisitionProject } from '@/types'
import { PROJECT_STATUS_SEQUENCE } from '@/types/project'
import { PROJECT_STATUS_META } from '@/constants/status'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ProjectTimelineProps {
    project: AcquisitionProject
}

export function ProjectTimeline({ project }: ProjectTimelineProps) {
    const currentIndex = PROJECT_STATUS_SEQUENCE.indexOf(project.status)
    const isStalled = project.status === 'ON_HOLD' || project.status === 'REJECTED'

    // Map recorded events from timeline array
    const eventMap = new Map(project.timeline.map((ev) => [ev.stage, ev]))

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-ink-900">
                        Statutory Lifecycle & Regulatory Milestone Timeline
                    </h3>
                    <p className="text-xs text-ink-500">
                        Progress tracking across the 15 primary statutory gates of the LARR Act 2013
                    </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-signal-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Completed</span>
                    </span>
                    <span className="flex items-center gap-1 text-terracotta-700 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Current Stage</span>
                    </span>
                    <span className="flex items-center gap-1 text-ink-400">
                        <GitCommit className="h-3.5 w-3.5" />
                        <span>Upcoming</span>
                    </span>
                </div>
            </div>

            {/* Special Banner if On Hold or Rejected */}
            {isStalled && (
                <div className="rounded-lg border border-rust-200 bg-rust-50 p-4 text-xs text-rust-900 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rust-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-bold text-rust-900">
                            {project.status === 'ON_HOLD' ? 'Statutory Progression Paused (On Hold)' : 'Proposal Rejected'}
                        </p>
                        <p className="text-rust-700">
                            {project.status === 'ON_HOLD'
                                ? 'Acquisition proceedings temporarily paused pending High Court judicial review / state revenue authority hearings.'
                                : 'Project proposal did not pass statutory scrutiny or environmental clearance.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Step-by-Step Horizontal/Vertical Milestone Tracker */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-ink-200">
                {PROJECT_STATUS_SEQUENCE.map((stageKey, idx) => {
                    const meta = PROJECT_STATUS_META[stageKey]
                    const event = eventMap.get(stageKey)

                    // Determine state
                    const isCompleted = event?.completed || (currentIndex !== -1 && idx < currentIndex)
                    const isCurrent = project.status === stageKey
                    const isUpcoming = !isCompleted && !isCurrent

                    return (
                        <div key={stageKey} className="relative group">
                            {/* Circle Indicator Icon */}
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
                                                Active Stage
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="rounded bg-signal-50 px-1.5 py-0.2 text-[10px] font-semibold text-signal-700 border border-signal-200">
                                                Verified
                                            </span>
                                        )}
                                    </div>

                                    {event?.date && (
                                        <span className="font-mono text-[11px] text-ink-500 font-medium">
                                            {formatDate(event.date)}
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 text-xs text-ink-500">
                                    {event?.label ?? `Standard statutory milestone: ${meta?.label ?? stageKey}`}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
