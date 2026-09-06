import { useNavigate } from 'react-router-dom'
import { IndianRupee, ExternalLink, CheckCircle2, Clock } from 'lucide-react'
import type { PossessionRecord } from '@/types'
import { formatINR } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface PossessionCompensationCardProps {
    record: PossessionRecord
}

export function PossessionCompensationCard({ record }: PossessionCompensationCardProps) {
    const navigate = useNavigate()
    const percentDisbursed = record.totalCompensationInr > 0
        ? Math.round((record.disbursedCompensationInr / record.totalCompensationInr) * 100)
        : 0

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Linked Compensation & DBT Readiness
                    </h3>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {record.compensationId ?? 'Assessment Linked'}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Net Statutory Award</span>
                    <span className="font-mono font-bold text-sm text-ink-900 block">
                        {formatINR(record.totalCompensationInr)}
                    </span>
                </div>

                <div className="rounded-lg bg-signal-50/50 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] text-signal-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>DBT Disbursed ({percentDisbursed}%)</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-signal-900 block">
                        {formatINR(record.disbursedCompensationInr)}
                    </span>
                </div>

                <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Pending Balance</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-900 block">
                        {formatINR(record.pendingCompensationInr)}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-ink-100 text-xs">
                <span className="text-[11px] text-ink-500">
                    {percentDisbursed >= 80 ? (
                        <span className="text-signal-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Statutory 80% DBT Threshold Met</span>
                        </span>
                    ) : (
                        <span className="text-amber-800 font-medium flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Awaiting mandatory 80% advance DBT disbursement</span>
                        </span>
                    )}
                </span>

                {record.compensationId && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.compensationDetail(record.compensationId!))}
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
