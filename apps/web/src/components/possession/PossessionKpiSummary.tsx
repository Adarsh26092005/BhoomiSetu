import { ShieldCheck, Calendar, Clock, CheckCircle2, AlertTriangle, Layers, Award } from 'lucide-react'
import type { PossessionRecord } from '@/types'
import { KpiCard } from '@/components/dashboard/KpiCard'

interface PossessionKpiSummaryProps {
    records: PossessionRecord[]
}

export function PossessionKpiSummary({ records }: PossessionKpiSummaryProps) {
    const totalCases = records.length
    const readyCount = records.filter((r) => r.possessionStatus === 'READY_FOR_POSSESSION' || r.possessionStatus === 'NOTICE_PREPARED' || r.possessionStatus === 'NOTICE_ISSUED').length
    const scheduledCount = records.filter((r) => r.possessionStatus === 'SCHEDULED').length
    const pendingCount = records.filter((r) => r.possessionStatus === 'POSSESSION_PENDING' || r.possessionStatus === 'SITE_VERIFICATION').length
    const takenCount = records.filter((r) => r.possessionStatus === 'POSSESSION_TAKEN' || r.possessionStatus === 'CERTIFICATE_PENDING' || r.possessionStatus === 'CERTIFICATE_ISSUED').length
    const certPendingCount = records.filter((r) => r.possessionStatus === 'CERTIFICATE_PENDING' || r.possessionStatus === 'POSSESSION_TAKEN').length
    const onHoldOrDisputedCount = records.filter((r) => r.possessionStatus === 'ON_HOLD' || r.possessionStatus === 'DISPUTED').length

    const takenPercent = totalCases > 0 ? Math.round((takenCount / totalCases) * 100) : 0

    return (
        <section aria-labelledby="possession-kpi-heading" className="space-y-3">
            <h2 id="possession-kpi-heading" className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Statutory Land Possession & Cadastral Handover Progress
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* 1. Total Cases */}
                <KpiCard
                    title="Total Cadastral Dockets"
                    value={totalCases}
                    unit="Parcels"
                    subtitle="Acquisition land plots"
                    icon={Layers}
                    accentColor="ink"
                />

                {/* 2. Ready for Notice/Handover */}
                <KpiCard
                    title="Ready for Possession"
                    value={readyCount}
                    unit="Cases"
                    subtitle="Award passed & DBT cleared"
                    icon={ShieldCheck}
                    accentColor="ink"
                />

                {/* 3. Scheduled */}
                <KpiCard
                    title="Possession Scheduled"
                    value={scheduledCount}
                    unit="Plots"
                    subtitle="On-ground drive fixed"
                    icon={Calendar}
                    accentColor="amber"
                />

                {/* 4. Possession Pending / Verification */}
                <KpiCard
                    title="Spot Demarcation"
                    value={pendingCount}
                    unit="Parcels"
                    subtitle="Site verification in progress"
                    icon={Clock}
                    accentColor="amber"
                />

                {/* 5. Physical Possession Taken */}
                <KpiCard
                    title="Possession Taken"
                    value={takenCount}
                    unit={`(${takenPercent}%)`}
                    subtitle="Physical custody secured"
                    change={{ value: `${takenPercent}% Complete`, direction: 'up' }}
                    icon={CheckCircle2}
                    accentColor="signal"
                />

                {/* 6. On Hold & Disputed */}
                <KpiCard
                    title="Holds & Injunctions"
                    value={onHoldOrDisputedCount}
                    unit={certPendingCount > 0 ? `${certPendingCount} Certs Due` : 'Cases'}
                    subtitle={`${onHoldOrDisputedCount} blocked, ${certPendingCount} certs due`}
                    change={
                        onHoldOrDisputedCount > 0
                            ? { value: `${onHoldOrDisputedCount} Blocked`, direction: 'down' }
                            : { value: 'Zero Blockages', direction: 'neutral' }
                    }
                    icon={onHoldOrDisputedCount > 0 ? AlertTriangle : Award}
                    accentColor={onHoldOrDisputedCount > 0 ? 'rust' : 'signal'}
                />
            </div>
        </section>
    )
}
