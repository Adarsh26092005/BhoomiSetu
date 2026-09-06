import { useNavigate } from 'react-router-dom'
import { Flag, CheckCircle2, Clock, AlertTriangle, ExternalLink } from 'lucide-react'
import type { PossessionAnalytics } from '@/types/analytics'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface PossessionAnalyticsPanelProps {
    possession: PossessionAnalytics
}

export function PossessionAnalyticsPanel({ possession }: PossessionAnalyticsPanelProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <Flag className="h-4 w-4 text-terracotta-600" />
                        <span>Physical Land Possession & Section 38 Handover</span>
                    </h3>
                    <p className="text-[11px] text-ink-500">
                        Notice preparation, site demarcation, and statutory Form 22 handover to implementing agencies
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.possession)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
                >
                    <span>View Possession Queue</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-bold uppercase tracking-wider block">
                        Total Possession Cases
                    </span>
                    <span className="font-mono text-lg font-black text-ink-900 block">
                        {possession.totalPossessionCases}
                    </span>
                    <span className="text-[10px] text-ink-500">{possession.noticesIssuedCount} Notices Issued</span>
                </div>

                <div className="rounded-lg bg-signal-50/60 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] text-signal-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-signal-600" />
                        <span>Possession Handed Over</span>
                    </span>
                    <span className="font-mono text-lg font-black text-signal-950 block">
                        {possession.possessionCompletedCount} ({possession.possessionRatePercentage}%)
                    </span>
                    <span className="text-[10px] text-signal-700">Form 22 Issued to Agency</span>
                </div>

                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span>Site Verification Pending</span>
                    </span>
                    <span className="font-mono text-lg font-black text-amber-950 block">
                        {possession.totalPossessionCases - possession.siteInspectionVerifiedCount}
                    </span>
                    <span className="text-[10px] text-amber-700">Spot survey in progress</span>
                </div>

                <div className="rounded-lg bg-rust-50/60 p-3 border border-rust-200 space-y-0.5">
                    <span className="text-[10px] text-rust-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-rust-600" />
                        <span>Prerequisite Blocked</span>
                    </span>
                    <span className="font-mono text-lg font-black text-rust-950 block">
                        {possession.blockedCount}
                    </span>
                    <span className="text-[10px] text-rust-700">Unpaid compensation / stay order</span>
                </div>
            </div>
        </div>
    )
}
