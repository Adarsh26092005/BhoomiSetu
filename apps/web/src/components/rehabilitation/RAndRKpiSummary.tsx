import { Users, HeartHandshake, Clock, Truck, ShieldAlert, FileText, CheckCheck } from 'lucide-react'
import type { RAndRCase } from '@/types'

interface RAndRKpiSummaryProps {
    records: RAndRCase[]
}

export function RAndRKpiSummary({ records }: RAndRKpiSummaryProps) {
    const totalCases = records.length
    const totalFamilies = records.reduce((acc, r) => acc + r.affectedFamilyCount, 0)
    const eligibilityPending = records.filter(
        (r) => r.eligibilityStatus === 'PENDING' || r.eligibilityStatus === 'UNDER_REVIEW' || r.eligibilityStatus === 'REQUIRES_DOCUMENTATION',
    ).length
    const entitlementsPending = records.filter(
        (r) => r.rAndRStatus === 'IDENTIFIED' || r.rAndRStatus === 'ASSESSMENT_PENDING' || r.rAndRStatus === 'ELIGIBILITY_REVIEW',
    ).length
    const benefitsInProgress = records.filter(
        (r) => r.rAndRStatus === 'BENEFIT_IN_PROGRESS' || r.rAndRStatus === 'BENEFIT_APPROVED',
    ).length
    const relocationInProgress = records.filter(
        (r) => r.relocationStatus === 'IN_PROGRESS' || r.rAndRStatus === 'RELOCATION_IN_PROGRESS',
    ).length
    const verificationPending = records.filter(
        (r) => r.rAndRStatus === 'POST_RELOCATION_VERIFICATION' || r.postRelocationVerificationStatus === 'REQUIRES_REVIEW',
    ).length
    const completedCases = records.filter((r) => r.rAndRStatus === 'COMPLETED').length
    const onHoldOrDisputed = records.filter(
        (r) => r.rAndRStatus === 'ON_HOLD' || r.rAndRStatus === 'DISPUTED' || r.eligibilityStatus === 'DISPUTED',
    ).length

    const cards = [
        {
            title: 'Total R&R Cases',
            value: totalCases,
            sublabel: `${totalFamilies} Affected Families Tracked`,
            icon: Users,
            tone: 'ink',
        },
        {
            title: 'Eligibility Pending',
            value: eligibilityPending,
            sublabel: `${entitlementsPending} Entitlements Due`,
            icon: Clock,
            tone: 'amber',
        },
        {
            title: 'Benefits Active',
            value: benefitsInProgress,
            sublabel: 'Grants & Housing in delivery',
            icon: HeartHandshake,
            tone: 'ink',
        },
        {
            title: 'Relocation In-Flight',
            value: relocationInProgress,
            sublabel: 'Physical shifting underway',
            icon: Truck,
            tone: 'amber',
        },
        {
            title: 'Verification Due',
            value: verificationPending,
            sublabel: 'Spot site inspection pending',
            icon: FileText,
            tone: 'amber',
        },
        {
            title: 'R&R Completed',
            value: completedCases,
            sublabel: `${totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0}% Fully Settled`,
            icon: CheckCheck,
            tone: 'signal',
        },
        {
            title: 'Hold / Disputed',
            value: onHoldOrDisputed,
            sublabel: 'Legal or title disputes',
            icon: ShieldAlert,
            tone: 'rust',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {cards.map((card) => {
                const Icon = card.icon
                const isSignal = card.tone === 'signal'
                const isRust = card.tone === 'rust'
                const isAmber = card.tone === 'amber'

                return (
                    <div
                        key={card.title}
                        className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                            isSignal
                                ? 'border-signal-200 bg-signal-50/40 text-signal-950'
                                : isRust
                                ? 'border-rust-200 bg-rust-50/40 text-rust-950'
                                : isAmber
                                ? 'border-amber-200 bg-amber-50/40 text-amber-950'
                                : 'border-ink-200 bg-paper text-ink-900'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider opacity-75 truncate">
                                {card.title}
                            </span>
                            <div
                                className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                                    isSignal
                                        ? 'bg-signal-100 text-signal-700'
                                        : isRust
                                        ? 'bg-rust-100 text-rust-700'
                                        : isAmber
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-ink-100 text-ink-700'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="mt-2">
                            <span className="font-mono text-2xl font-black block tracking-tight">
                                {card.value}
                            </span>
                            <span className="text-[10px] font-medium opacity-80 block truncate mt-0.5">
                                {card.sublabel}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
