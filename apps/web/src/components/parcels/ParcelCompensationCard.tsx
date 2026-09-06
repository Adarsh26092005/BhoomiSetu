import { useNavigate } from 'react-router-dom'
import { IndianRupee, ExternalLink, Users } from 'lucide-react'
import { useCompensationByParcel } from '@/hooks/use-compensation'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatINR } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ParcelCompensationCardProps {
    parcelId: string
}

export function ParcelCompensationCard({ parcelId }: ParcelCompensationCardProps) {
    const navigate = useNavigate()
    const { data: record, isLoading } = useCompensationByParcel(parcelId)

    if (isLoading || !record) return null

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Statutory Compensation & DBT Entitlement
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <StatusBadge status={record.assessmentStatus} type="compensation-assessment" />
                    <StatusBadge status={record.paymentStatus} type="compensation-payment" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Landowners</span>
                    </span>
                    <span className="font-mono font-bold text-ink-900 block">{record.landownerCount} Entitled</span>
                </div>

                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Gross Assessed</span>
                    <span className="font-mono font-bold text-ink-900 block">{formatINR(record.totalAssessedAmountInr)}</span>
                </div>

                <div className="rounded-lg bg-ink-50 p-2.5 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Net Payable</span>
                    <span className="font-mono font-bold text-ink-900 block">{formatINR(record.totalPayableAmountInr)}</span>
                </div>

                <div className="rounded-lg bg-signal-50/50 p-2.5 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] text-signal-700 font-medium">DBT Disbursed</span>
                    <span className="font-mono font-bold text-signal-900 block">{formatINR(record.amountDisbursedInr)}</span>
                </div>

                <div className="rounded-lg bg-amber-50/50 p-2.5 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] text-amber-700 font-medium">Pending Balance</span>
                    <span className="font-mono font-bold text-amber-900 block">{formatINR(record.amountPendingInr)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-ink-100 text-xs">
                <span className="font-mono text-[11px] text-ink-500">
                    Award Ref: {record.awardId ?? 'In Declaration Queue'}
                </span>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.compensationDetail(record.id))}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <span>Inspect Compensation Dossier</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}
