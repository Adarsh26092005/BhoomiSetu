import { Bell, ShieldCheck, Clock } from 'lucide-react'
import type { AcquisitionProject } from '@/types'
import { MOCK_NOTIFICATIONS, MOCK_AUDIT_LOG } from '@/mock/activity'
import { formatDateTime } from '@/lib/format'

interface ProjectActivityStreamProps {
    project: AcquisitionProject
}

export function ProjectActivityStream({ project }: ProjectActivityStreamProps) {
    // Filter alerts & audit logs related to this project
    const relatedNotifications = MOCK_NOTIFICATIONS.filter((n) => n.projectId === project.id)
    const relatedAuditLogs = MOCK_AUDIT_LOG.filter(
        (a) => a.entityId === project.id || a.action.toLowerCase().includes('project'),
    )

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Scheme Alerts & Officer Actions</h3>
                        <p className="text-[11px] text-ink-500">Live notifications and audit records linked to {project.code}</p>
                    </div>
                </div>

                <span className="text-[11px] font-mono text-ink-400">
                    {relatedNotifications.length + relatedAuditLogs.length} Events Logged
                </span>
            </div>

            {relatedNotifications.length === 0 && relatedAuditLogs.length === 0 ? (
                <p className="text-xs text-ink-500 italic py-4 text-center">
                    No open alerts or disputes logged for this scheme. Standard statutory progression active.
                </p>
            ) : (
                <div className="space-y-3">
                    {/* Notifications */}
                    {relatedNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs"
                        >
                            <Bell className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-amber-900">{notif.title}</span>
                                    <span className="text-[10px] text-amber-700 font-mono shrink-0">
                                        {formatDateTime(notif.createdAt)}
                                    </span>
                                </div>
                                <p className="text-amber-800 text-[11px]">{notif.message}</p>
                            </div>
                        </div>
                    ))}

                    {/* Audit Logs */}
                    {relatedAuditLogs.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-start gap-3 rounded-lg border border-ink-100 bg-ink-50/40 p-3 text-xs"
                        >
                            <ShieldCheck className="h-4 w-4 text-signal-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-ink-900">{log.action.replace('_', ' ')}</span>
                                    <span className="text-[10px] text-ink-400 font-mono shrink-0">
                                        {formatDateTime(log.timestamp)}
                                    </span>
                                </div>
                                <p className="text-ink-600 text-[11px]">
                                    Action by <strong className="text-ink-800">{log.actorName}</strong> ({log.actorRole})
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
