import { useNavigate } from 'react-router-dom'
import { Flag, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react'
import { usePossessionByParcel } from '@/hooks/use-possession'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ParcelPossessionCardProps {
    parcelId: string
}

export function ParcelPossessionCard({ parcelId }: ParcelPossessionCardProps) {
    const navigate = useNavigate()
    const { data: record, isLoading } = usePossessionByParcel(parcelId)

    if (isLoading || !record) return null

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Physical Land Possession & Handover
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <StatusBadge status={record.possessionStatus} type="possession" />
                    <StatusBadge status={record.possessionType} type="possession-type" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Designated Officer</span>
                    <strong className="text-ink-900 block truncate">{record.assignedOfficer}</strong>
                </div>

                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Scheduled / Actual Date</span>
                    <span className="font-mono font-bold text-ink-900 block flex items-center gap-1">
                        {record.possessionDate ? (
                            <span className="text-signal-700 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>{formatDate(record.possessionDate)}</span>
                            </span>
                        ) : record.scheduledDate ? (
                            <span className="text-amber-800 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(record.scheduledDate)}</span>
                            </span>
                        ) : (
                            <span className="text-ink-400">Unscheduled</span>
                        )}
                    </span>
                </div>

                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Notice Reference</span>
                    <span className="font-mono font-bold text-ink-900 block truncate">
                        {record.noticeReference ?? 'In Preparation'}
                    </span>
                </div>

                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Form 22 Certificate</span>
                    <span className="font-mono font-bold text-signal-700 block truncate">
                        {record.certificateId ?? 'Pending Handover'}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-ink-100 text-xs">
                <span className="font-mono text-[11px] text-ink-500">
                    Possession Ref: {record.id}
                </span>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.possessionDetail(record.id))}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <span>Inspect Possession Dossier</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}
