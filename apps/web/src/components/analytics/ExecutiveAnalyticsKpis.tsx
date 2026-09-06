import {
    Building2,
    Layers,
    CheckCircle2,
    IndianRupee,
    Flag,
    HeartHandshake,
    AlertTriangle,
    Clock,
    TrendingUp,
    FileSpreadsheet,
} from 'lucide-react'
import type { ExecutiveKpiMetrics } from '@/types/analytics'
import { formatArea, formatINR } from '@/lib/format'

interface ExecutiveAnalyticsKpisProps {
    metrics: ExecutiveKpiMetrics
}

export function ExecutiveAnalyticsKpis({ metrics }: ExecutiveAnalyticsKpisProps) {
    const kpis = [
        {
            title: 'National Schemes',
            value: metrics.totalProjects,
            sublabel: 'Active acquisition schemes',
            icon: Building2,
            tone: 'ink',
        },
        {
            title: 'Proposed Land',
            value: formatArea(metrics.totalProposedAreaHectares),
            sublabel: 'Statutory Section 11 boundary',
            icon: Layers,
            tone: 'ink',
        },
        {
            title: 'Acquired Land',
            value: formatArea(metrics.totalAcquiredAreaHectares),
            sublabel: `${metrics.acquisitionProgressPercentage}% Handed Over`,
            icon: CheckCircle2,
            tone: 'signal',
        },
        {
            title: 'Acquisition Rate',
            value: `${metrics.acquisitionProgressPercentage}%`,
            sublabel: 'Aggregate National Throughput',
            icon: TrendingUp,
            tone: metrics.acquisitionProgressPercentage >= 50 ? 'signal' : 'amber',
        },
        {
            title: 'Cadastral Parcels',
            value: metrics.totalParcels,
            sublabel: 'Survey / Khasra plots',
            icon: FileSpreadsheet,
            tone: 'ink',
        },
        {
            title: 'Assessed Awards',
            value: formatINR(metrics.totalCompensationAssessedInr, { compact: true }),
            sublabel: 'Total approved valuation',
            icon: IndianRupee,
            tone: 'ink',
        },
        {
            title: 'Disbursed DBT',
            value: formatINR(metrics.totalCompensationDisbursedInr, { compact: true }),
            sublabel: `${metrics.disbursementPercentage}% Disbursed via PFMS`,
            icon: IndianRupee,
            tone: 'signal',
        },
        {
            title: 'Pending DBT',
            value: formatINR(metrics.totalCompensationPendingInr, { compact: true }),
            sublabel: 'Under verification / escrow',
            icon: IndianRupee,
            tone: 'amber',
        },
        {
            title: 'Possession Taken',
            value: `${metrics.possessionCompletedParcels} Plots`,
            sublabel: `${metrics.possessionCompletedPercentage}% Physical Handover`,
            icon: Flag,
            tone: 'signal',
        },
        {
            title: 'R&R Active Cases',
            value: metrics.randrActiveCases,
            sublabel: `${metrics.randrCompletedCases} Resettled`,
            icon: HeartHandshake,
            tone: 'ink',
        },
        {
            title: 'Attention Schemes',
            value: metrics.projectsRequiringAttention,
            sublabel: 'Delay / Hold / Low Velocity',
            icon: AlertTriangle,
            tone: metrics.projectsRequiringAttention > 0 ? 'rust' : 'ink',
        },
        {
            title: 'Pending Workflows',
            value: metrics.pendingWorkflowTasks,
            sublabel: metrics.slaBreachedTasks > 0 ? `${metrics.slaBreachedTasks} SLA Breached` : 'All on track',
            icon: Clock,
            tone: metrics.slaBreachedTasks > 0 ? 'rust' : 'ink',
        },
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {kpis.map((kpi) => {
                const Icon = kpi.icon
                const isSignal = kpi.tone === 'signal'
                const isRust = kpi.tone === 'rust'
                const isAmber = kpi.tone === 'amber'

                return (
                    <div
                        key={kpi.title}
                        className={`rounded-xl border p-3.5 shadow-xs flex flex-col justify-between transition-all ${
                            isSignal
                                ? 'border-signal-200 bg-signal-50/40 text-signal-950'
                                : isRust
                                ? 'border-rust-200 bg-rust-50/40 text-rust-950'
                                : isAmber
                                ? 'border-amber-200 bg-amber-50/40 text-amber-950'
                                : 'border-ink-200 bg-paper text-ink-900'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 truncate">
                                {kpi.title}
                            </span>
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded shrink-0 ${
                                    isSignal
                                        ? 'bg-signal-100 text-signal-700'
                                        : isRust
                                        ? 'bg-rust-100 text-rust-700'
                                        : isAmber
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-ink-100 text-ink-700'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </div>
                        </div>

                        <div className="mt-2">
                            <span className="font-mono text-base font-black block tracking-tight">
                                {kpi.value}
                            </span>
                            <span className="text-[10px] opacity-80 block truncate mt-0.5">
                                {kpi.sublabel}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
