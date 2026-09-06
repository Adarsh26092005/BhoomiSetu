import { useNavigate } from 'react-router-dom'
import { FileCheck, ShieldCheck, UserCheck, ArrowRight, Activity } from 'lucide-react'
import type { AuditLogEntry } from '@/types'
import { formatDateTime } from '@/lib/format'
import { ROUTES } from '@/constants/routes'

interface RecentActivityProps {
    auditLogs: AuditLogEntry[]
}

export function RecentActivity({ auditLogs }: RecentActivityProps) {
    const navigate = useNavigate()

    const getActionIcon = (action: string) => {
        if (action.includes('COMPENSATION') || action.includes('DISBURSE')) {
            return <FileCheck className="h-4 w-4 text-signal-600" />
        }
        if (action.includes('AWARD') || action.includes('NOTIF')) {
            return <ShieldCheck className="h-4 w-4 text-terracotta-600" />
        }
        return <UserCheck className="h-4 w-4 text-ink-600" />
    }

    const formatActionName = (action: string) => {
        return action
            .toLowerCase()
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <Activity className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Recent Statutory Audit Trail</h3>
                        <p className="text-[11px] text-ink-500">Live immutable officer activity and state transitions</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(ROUTES.audit)}
                    className="text-xs font-semibold text-terracotta-700 hover:text-terracotta-900 inline-flex items-center gap-1"
                >
                    <span>Full Audit Log</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="space-y-3">
                {auditLogs.map((entry) => (
                    <div
                        key={entry.id}
                        className="flex items-start gap-3 rounded-lg border border-ink-100 bg-ink-50/30 p-3 text-xs transition-colors hover:bg-ink-50/70"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-paper border border-ink-200 mt-0.5">
                            {getActionIcon(entry.action)}
                        </div>

                        <div className="flex-1 space-y-0.5 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-ink-900 truncate">
                                    {formatActionName(entry.action)}
                                </span>
                                <span className="text-[10px] text-ink-400 font-mono shrink-0">
                                    {formatDateTime(entry.timestamp)}
                                </span>
                            </div>

                            <p className="text-ink-600 truncate">
                                <span className="font-semibold text-ink-800">{entry.actorName}</span>{' '}
                                <span className="text-ink-400">({entry.actorRole})</span>
                            </p>

                            <p className="text-[10px] text-ink-400 font-mono">
                                Target: {entry.entityType} • <span className="text-ink-600 font-semibold">{entry.entityId}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
