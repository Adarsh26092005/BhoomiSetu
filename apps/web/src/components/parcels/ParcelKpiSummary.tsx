import { Layers, MapPin, CheckCircle2, AlertOctagon, Banknote, Scale } from 'lucide-react'
import type { LandParcel } from '@/types'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { formatINR, formatArea } from '@/lib/format'

interface ParcelKpiSummaryProps {
    parcels: LandParcel[]
}

export function ParcelKpiSummary({ parcels }: ParcelKpiSummaryProps) {
    const totalCount = parcels.length
    const totalAreaHa = parcels.reduce((sum, p) => sum + p.areaHectares, 0)
    const totalCompensation = parcels.reduce((sum, p) => sum + p.compensationInr, 0)

    const verifiedCount = parcels.filter((p) =>
        ['VERIFIED', 'AWARD_DECLARED', 'COMPENSATION_PENDING', 'COMPENSATION_PAID', 'POSSESSION_PENDING', 'POSSESSION_TAKEN'].includes(
            p.status,
        ),
    ).length

    const disputedCount = parcels.filter((p) => p.status === 'DISPUTED').length

    const clearedCount = parcels.filter((p) =>
        ['COMPENSATION_PAID', 'POSSESSION_PENDING', 'POSSESSION_TAKEN'].includes(p.status),
    ).length

    const verifiedPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0
    const clearedPercent = totalCount > 0 ? Math.round((clearedCount / totalCount) * 100) : 0

    return (
        <section aria-labelledby="parcel-kpi-heading" className="space-y-3">
            <h2 id="parcel-kpi-heading" className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Cadastral Survey & Title Verification Summary
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* 1. Total Parcels */}
                <KpiCard
                    title="Total Parcels"
                    value={totalCount}
                    unit="Survey Plots"
                    subtitle="Mapped to statutory schemes"
                    icon={Layers}
                    accentColor="ink"
                />

                {/* 2. Total Area */}
                <KpiCard
                    title="Total Cadastral Area"
                    value={formatArea(totalAreaHa)}
                    subtitle="Digitized survey acreage"
                    icon={MapPin}
                    accentColor="terracotta"
                />

                {/* 3. Assessed Award */}
                <KpiCard
                    title="Assessed Compensation"
                    value={formatINR(totalCompensation, { compact: true })}
                    subtitle="Base + Solatium computation"
                    icon={Scale}
                    accentColor="ink"
                />

                {/* 4. Verified Titles */}
                <KpiCard
                    title="Verified Titles"
                    value={verifiedCount}
                    unit={`(${verifiedPercent}%)`}
                    subtitle="Revenue record verified"
                    change={{ value: `${verifiedPercent}%`, direction: 'up' }}
                    icon={CheckCircle2}
                    accentColor="signal"
                />

                {/* 5. In Dispute */}
                <KpiCard
                    title="Disputed Plots"
                    value={disputedCount}
                    unit="Cases"
                    subtitle="Litigation / boundary claims"
                    change={
                        disputedCount > 0
                            ? { value: `${disputedCount} Active`, direction: 'down' }
                            : { value: 'Zero Disputes', direction: 'neutral' }
                    }
                    icon={AlertOctagon}
                    accentColor={disputedCount > 0 ? 'rust' : 'signal'}
                />

                {/* 6. Compensation / Possession Cleared */}
                <KpiCard
                    title="Disbursal / Handover"
                    value={clearedCount}
                    unit={`(${clearedPercent}%)`}
                    subtitle="DBT paid or handover ready"
                    change={{ value: `${clearedPercent}%`, direction: 'up' }}
                    icon={Banknote}
                    accentColor="signal"
                />
            </div>
        </section>
    )
}
