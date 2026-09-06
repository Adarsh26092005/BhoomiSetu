import { useNavigate } from 'react-router-dom'
import { IndianRupee, ExternalLink, Scale, CheckCircle2, Clock } from 'lucide-react'
import { useCompensationByProject } from '@/hooks/use-compensation'
import { formatINR } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ProjectCompensationCardProps {
    projectId: string
}

export function ProjectCompensationCard({ projectId }: ProjectCompensationCardProps) {
    const navigate = useNavigate()
    const { data: records = [], isLoading } = useCompensationByProject(projectId)

    if (isLoading || records.length === 0) return null

    const totalPayable = records.reduce((sum, r) => sum + r.totalPayableAmountInr, 0)
    const totalDisbursed = records.reduce((sum, r) => sum + r.amountDisbursedInr, 0)
    const totalPending = records.reduce((sum, r) => sum + r.amountPendingInr, 0)
    const percentDisbursed = totalPayable > 0 ? Math.round((totalDisbursed / totalPayable) * 100) : 0

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Scheme Compensation & DBT Disbursement Status
                    </h3>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {records.length} {records.length === 1 ? 'Cadastral Case' : 'Cadastral Cases'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-ink-500 tracking-wider flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        <span>Net Sanctioned</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-ink-900 block">{formatINR(totalPayable, { compact: true })}</span>
                </div>

                <div className="rounded-lg bg-signal-50/50 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-signal-700 tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>DBT Disbursed ({percentDisbursed}%)</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-signal-900 block">{formatINR(totalDisbursed, { compact: true })}</span>
                </div>

                <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Pending Balance</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-900 block">{formatINR(totalPending, { compact: true })}</span>
                </div>

                <div className="flex items-center justify-end">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.compensation}?projectId=${projectId}`)}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold w-full cursor-pointer"
                    >
                        <span>View Compensation</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
