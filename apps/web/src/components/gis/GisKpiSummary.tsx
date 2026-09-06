import { Building2, Layers, CheckCheck, IndianRupee, Flag, ShieldAlert, HeartHandshake } from 'lucide-react'
import type { GisKpiMetrics } from '@/types/gis'

interface GisKpiSummaryProps {
    metrics: GisKpiMetrics
}

export function GisKpiSummary({ metrics }: GisKpiSummaryProps) {
    const cards = [
        {
            title: 'Schemes In View',
            value: metrics.projectsInView,
            sublabel: 'National corridors',
            icon: Building2,
            tone: 'ink',
        },
        {
            title: 'Parcels In View',
            value: metrics.parcelsInView,
            sublabel: `${metrics.totalProposedAreaHectares} ha Proposed`,
            icon: Layers,
            tone: 'ink',
        },
        {
            title: 'Acquired Land',
            value: `${metrics.totalAcquiredAreaHectares} ha`,
            sublabel: `${metrics.acquisitionProgressPercentage}% Statutory Handover`,
            icon: CheckCheck,
            tone: 'signal',
        },
        {
            title: 'Compensation Due',
            value: metrics.compensationPendingCount,
            sublabel: 'Awards pending DBT',
            icon: IndianRupee,
            tone: 'amber',
        },
        {
            title: 'Possession Due',
            value: metrics.possessionPendingCount,
            sublabel: 'Form 22 notice due',
            icon: Flag,
            tone: 'amber',
        },
        {
            title: 'Disputed Plots',
            value: metrics.disputedParcelsCount,
            sublabel: 'Stay / Title conflict',
            icon: ShieldAlert,
            tone: metrics.disputedParcelsCount > 0 ? 'rust' : 'ink',
        },
        {
            title: 'R&R Active',
            value: metrics.randrCasesActiveCount,
            sublabel: 'Second Sched. resettlement',
            icon: HeartHandshake,
            tone: 'ink',
        },
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
            {cards.map((card) => {
                const Icon = card.icon
                const isSignal = card.tone === 'signal'
                const isRust = card.tone === 'rust'
                const isAmber = card.tone === 'amber'

                return (
                    <div
                        key={card.title}
                        className={`rounded-xl border p-3 shadow-xs flex flex-col justify-between transition-all ${
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
                                {card.title}
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

                        <div className="mt-1.5">
                            <span className="font-mono text-lg font-black block tracking-tight">
                                {card.value}
                            </span>
                            <span className="text-[10px] opacity-80 block truncate mt-0.5">
                                {card.sublabel}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
