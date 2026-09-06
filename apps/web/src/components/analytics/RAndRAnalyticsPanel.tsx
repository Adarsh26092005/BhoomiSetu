import { useNavigate } from 'react-router-dom'
import { HeartHandshake, CheckCircle2, Clock, ExternalLink, Users } from 'lucide-react'
import type { RAndRAnalytics } from '@/types/analytics'
import { formatINR } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface RAndRAnalyticsPanelProps {
    randr: RAndRAnalytics
}

export function RAndRAnalyticsPanel({ randr }: RAndRAnalyticsPanelProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <HeartHandshake className="h-4 w-4 text-pink-600" />
                        <span>Second Schedule Rehabilitation & Resettlement (R&R) Audit</span>
                    </h3>
                    <p className="text-[11px] text-ink-500">
                        Displaced household census, housing grants, subsistence allowances, and resettlement site infrastructure
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.rehabilitation)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
                >
                    <span>View R&R Register</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <Users className="h-3 w-3 text-ink-400" />
                        <span>Affected Families</span>
                    </span>
                    <span className="font-mono text-lg font-black text-ink-900 block">
                        {randr.affectedFamiliesCount} Families
                    </span>
                    <span className="text-[10px] text-ink-500">{randr.totalCases} Registered Cases</span>
                </div>

                <div className="rounded-lg bg-signal-50/60 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] text-signal-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-signal-600" />
                        <span>Benefits Delivered</span>
                    </span>
                    <span className="font-mono text-base font-black text-signal-950 block">
                        {formatINR(randr.benefitsDeliveredInr, { compact: true })}
                    </span>
                    <span className="text-[10px] text-signal-700">Approved: {formatINR(randr.benefitsApprovedInr, { compact: true })}</span>
                </div>

                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span>Relocation In-Progress</span>
                    </span>
                    <span className="font-mono text-lg font-black text-amber-950 block">
                        {randr.relocationInProgressCount} Households
                    </span>
                    <span className="text-[10px] text-amber-700">Transit shelter allocated</span>
                </div>

                <div className="rounded-lg bg-pink-50/60 p-3 border border-pink-200 space-y-0.5">
                    <span className="text-[10px] text-pink-800 font-bold uppercase tracking-wider block">
                        Completed Resettlement
                    </span>
                    <span className="font-mono text-lg font-black text-pink-950 block">
                        {randr.completedCasesCount} ({randr.rAndRCompletionPercentage}%)
                    </span>
                    <span className="text-[10px] text-pink-700">Post-monitoring clear</span>
                </div>
            </div>
        </div>
    )
}
