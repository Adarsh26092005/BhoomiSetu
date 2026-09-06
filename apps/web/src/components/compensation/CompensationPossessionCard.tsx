import { useNavigate } from 'react-router-dom'
import { Flag, ExternalLink, ShieldAlert, CheckCircle2, Calendar } from 'lucide-react'
import { usePossessionByParcel } from '@/hooks/use-possession'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface CompensationPossessionCardProps {
    parcelId: string
}

export function CompensationPossessionCard({ parcelId }: CompensationPossessionCardProps) {
    const navigate = useNavigate()
    const { data: record, isLoading } = usePossessionByParcel(parcelId)

    if (isLoading || !record) return null

    const isBlocked = record.readinessStatus === 'BLOCKED'

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Physical Possession Readiness
                    </h3>
                </div>
                <StatusBadge status={record.possessionStatus} type="possession" />
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                    <span className="text-ink-600">Possession Readiness:</span>
                    <span className={`font-bold flex items-center gap-1 ${isBlocked ? 'text-rust-700' : 'text-signal-700'}`}>
                        {isBlocked ? <ShieldAlert className="h-3.5 w-3.5 text-rust-600" /> : <CheckCircle2 className="h-3.5 w-3.5 text-signal-600" />}
                        <span>{record.readinessStatus}</span>
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-ink-600">Scheduled Handover:</span>
                    <span className="font-mono text-ink-900 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-ink-500" />
                        <span>{record.scheduledDate ? formatDate(record.scheduledDate) : 'Not Scheduled'}</span>
                    </span>
                </div>

                {record.holdReason && (
                    <div className="rounded bg-rust-50 p-2 text-rust-900 text-[11px] border border-rust-200">
                        <strong>Stay Notice:</strong> {record.holdReason}
                    </div>
                )}

                <div className="pt-2 border-t border-ink-100">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.possessionDetail(record.id))}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold w-full cursor-pointer"
                    >
                        <span>Open Possession Dossier</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
