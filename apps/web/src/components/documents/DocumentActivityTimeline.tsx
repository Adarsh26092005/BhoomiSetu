import { Activity, ShieldCheck, Upload, XCircle, Clock } from 'lucide-react'
import type { ProjectDocument } from '@/types'
import { formatDateTime } from '@/lib/format'

interface DocumentActivityTimelineProps {
    document: ProjectDocument
}

export function DocumentActivityTimeline({ document }: DocumentActivityTimelineProps) {
    const activities = document.activities && document.activities.length > 0
        ? document.activities
        : [
            {
                id: 'act-init',
                action: 'UPLOADED_DOCUMENT',
                actorName: document.uploadedBy,
                actorRole: 'OFFICER / PROPONENT',
                timestamp: `${document.uploadedAt}T10:00:00Z`,
                remarks: 'Initial document submission to statutory vault',
            },
        ]

    const getActionIcon = (action: string) => {
        if (action.includes('VERIF') || action.includes('APPROV')) {
            return <ShieldCheck className="h-4 w-4 text-signal-600" />
        }
        if (action.includes('REJECT')) {
            return <XCircle className="h-4 w-4 text-rust-600" />
        }
        if (action.includes('REVIEW')) {
            return <Clock className="h-4 w-4 text-amber-600" />
        }
        return <Upload className="h-4 w-4 text-ink-600" />
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <Activity className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Document Audit Trail</h3>
                        <p className="text-[11px] text-ink-500">Immutable ledger of officer scrutiny and custody events</p>
                    </div>
                </div>

                <span className="font-mono text-xs text-ink-500">
                    {activities.length} Events Logged
                </span>
            </div>

            <div className="space-y-3">
                {activities.map((act) => (
                    <div
                        key={act.id}
                        className="flex items-start gap-3 rounded-lg border border-ink-100 bg-ink-50/40 p-3 text-xs"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-paper border border-ink-200 mt-0.5">
                            {getActionIcon(act.action)}
                        </div>

                        <div className="flex-1 space-y-0.5 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-ink-900 truncate">
                                    {act.action.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] text-ink-400 font-mono shrink-0">
                                    {formatDateTime(act.timestamp)}
                                </span>
                            </div>

                            <p className="text-ink-600 text-[11px]">
                                Action by <strong className="text-ink-800">{act.actorName}</strong> ({act.actorRole})
                            </p>

                            {act.remarks && (
                                <p className="text-[11px] text-ink-500 italic mt-0.5">
                                    "{act.remarks}"
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
