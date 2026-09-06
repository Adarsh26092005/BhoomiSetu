import { Activity, Users, FileCheck, Award, HeartHandshake, Truck, CheckCheck, PauseCircle, AlertTriangle, Clock } from 'lucide-react'
import type { RAndRTimelineEvent } from '@/types'
import { formatDateTime } from '@/lib/format'

interface RAndRTimelineProps {
    timeline: RAndRTimelineEvent[]
}

export function RAndRTimeline({ timeline }: RAndRTimelineProps) {
    const getActionIcon = (action: string) => {
        if (action.includes('COMPLETED')) return <CheckCheck className="h-4 w-4 text-signal-600" />
        if (action.includes('RELOCATION')) return <Truck className="h-4 w-4 text-amber-600" />
        if (action.includes('BENEFIT')) return <HeartHandshake className="h-4 w-4 text-signal-600" />
        if (action.includes('ENTITLEMENT')) return <Award className="h-4 w-4 text-ink-600" />
        if (action.includes('ELIGIBILITY')) return <FileCheck className="h-4 w-4 text-ink-600" />
        if (action.includes('HOLD')) return <PauseCircle className="h-4 w-4 text-rust-600" />
        if (action.includes('DISPUTE')) return <AlertTriangle className="h-4 w-4 text-rust-600" />
        if (action.includes('HOUSEHOLD') || action.includes('IDENTIFIED')) return <Users className="h-4 w-4 text-terracotta-600" />
        return <Clock className="h-4 w-4 text-ink-500" />
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <Activity className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">R&R Operational Audit Timeline</h3>
                        <p className="text-[11px] text-ink-500">Chronological history of assessments, benefit dispatches, and shifting verification</p>
                    </div>
                </div>

                <span className="font-mono text-xs text-ink-500">
                    {timeline.length} Events Logged
                </span>
            </div>

            <div className="space-y-3">
                {timeline.map((event) => (
                    <div
                        key={event.id}
                        className="flex items-start gap-3 rounded-lg border border-ink-100 bg-ink-50/40 p-3.5 text-xs"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-paper border border-ink-200 mt-0.5">
                            {getActionIcon(event.action)}
                        </div>

                        <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-ink-900 truncate">
                                    {event.action.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] text-ink-400 font-mono shrink-0">
                                    {formatDateTime(event.timestamp)}
                                </span>
                            </div>

                            <p className="text-ink-600 text-[11px]">
                                Action by <strong className="text-ink-800">{event.actor}</strong> ({event.role.replace(/_/g, ' ')}) • {event.organization.replace(/_/g, ' ')}
                            </p>

                            {event.remarks && (
                                <p className="text-[11px] text-ink-500 italic mt-0.5">
                                    "{event.remarks}"
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
