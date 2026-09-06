import { useNavigate } from 'react-router-dom'
import { Flag, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react'
import { usePossessionByParcel } from '@/hooks/use-possession'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface RAndRPossessionCardProps {
    parcelId: string
    possessionId?: string
}

export function RAndRPossessionCard({ parcelId, possessionId }: RAndRPossessionCardProps) {
    const navigate = useNavigate()
    const { data: possession } = usePossessionByParcel(parcelId)

    if (!possession && !possessionId) return null

    const targetId = possession?.id ?? possessionId

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Physical Land Possession Linkage
                    </h3>
                </div>
                {possession && <StatusBadge status={possession.possessionStatus} type="possession" />}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-100">
                    <dt className="text-[10px] text-ink-500 font-medium">Possession Date</dt>
                    <dd className="font-mono font-bold text-ink-900 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-ink-500" />
                        <span>{possession?.possessionDate ? formatDate(possession.possessionDate) : 'Pending Handover'}</span>
                    </dd>
                </div>

                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-100">
                    <dt className="text-[10px] text-ink-500 font-medium">Form 22 Certificate</dt>
                    <dd className="font-mono font-bold text-signal-700 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="truncate">{possession?.certificateId ?? 'Pending Handover'}</span>
                    </dd>
                </div>
            </dl>

            <div className="pt-2 border-t border-ink-100">
                {targetId && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.possessionDetail(targetId))}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold w-full cursor-pointer"
                    >
                        <span>Open Possession Case</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </div>
    )
}
