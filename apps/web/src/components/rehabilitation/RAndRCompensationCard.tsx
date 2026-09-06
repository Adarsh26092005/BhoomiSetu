import { useNavigate } from 'react-router-dom'
import { IndianRupee, ExternalLink } from 'lucide-react'
import { useCompensationByParcel } from '@/hooks/use-compensation'
import { formatINR } from '@/lib/format'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface RAndRCompensationCardProps {
    parcelId: string
    compensationId?: string
}

export function RAndRCompensationCard({ parcelId, compensationId }: RAndRCompensationCardProps) {
    const navigate = useNavigate()
    const { data: compensation } = useCompensationByParcel(parcelId)

    if (!compensation && !compensationId) return null

    const totalAssessed = compensation?.totalPayableAmountInr ?? 0
    const totalDisbursed = compensation?.amountDisbursedInr ?? 0
    const targetId = compensation?.id ?? compensationId

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Linked Land Compensation
                    </h3>
                </div>
                {compensation && <StatusBadge status={compensation.assessmentStatus} type="compensation-assessment" />}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-200">
                    <span className="text-[10px] text-ink-500 font-medium block">Award Assessed</span>
                    <span className="font-mono font-bold text-ink-900 block mt-0.5">
                        {formatINR(totalAssessed)}
                    </span>
                </div>
                <div className="rounded-lg bg-signal-50/50 p-2.5 border border-signal-200">
                    <span className="text-[10px] text-signal-700 font-medium block">DBT Disbursed</span>
                    <span className="font-mono font-bold text-signal-900 block mt-0.5">
                        {formatINR(totalDisbursed)}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-ink-100 text-xs">
                <span className="text-[10px] text-ink-500">
                    * Separate statutory domain under First Schedule.
                </span>

                {targetId && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.compensationDetail(targetId))}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                        <span>Compensation Ledger</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </div>
    )
}
