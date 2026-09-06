import {
    MapPin,
    CheckCircle2,
    Scale,
    Banknote,
    Layers,
    Users,
} from 'lucide-react'
import type { AcquisitionProject } from '@/types'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { formatINR, formatArea } from '@/lib/format'

interface ProjectKpiSummaryProps {
    project: AcquisitionProject
}

export function ProjectKpiSummary({ project }: ProjectKpiSummaryProps) {
    const isCompleted = project.status === 'COMPLETED' || project.status === 'POSSESSION_COMPLETED'
    const acquiredLandHa = isCompleted
        ? project.totalAreaHectares
        : project.estimatedCompensationInr > 0
            ? project.totalAreaHectares * Math.min(1, project.disbursedCompensationInr / project.estimatedCompensationInr)
            : 0

    const landProgressPercent = project.totalAreaHectares > 0
        ? Math.round((acquiredLandHa / project.totalAreaHectares) * 100)
        : 0

    const compDisbursedPercent = project.estimatedCompensationInr > 0
        ? Math.round((project.disbursedCompensationInr / project.estimatedCompensationInr) * 100)
        : 0

    return (
        <section aria-labelledby="project-kpi-heading" className="space-y-3">
            <h2 id="project-kpi-heading" className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Scheme Metrics & Acquisition Ledger
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* 1. Proposed Land Area */}
                <KpiCard
                    title="Proposed Land Area"
                    value={formatArea(project.totalAreaHectares)}
                    subtitle="Under Sec. 11 notification"
                    icon={MapPin}
                    accentColor="terracotta"
                />

                {/* 2. Land Handover Taken */}
                <KpiCard
                    title="Possession Handover"
                    value={formatArea(acquiredLandHa)}
                    subtitle={`${landProgressPercent}% of total alignment`}
                    change={{
                        value: `${landProgressPercent}%`,
                        direction: landProgressPercent > 0 ? 'up' : 'neutral',
                    }}
                    icon={CheckCircle2}
                    accentColor="signal"
                />

                {/* 3. Estimated Compensation */}
                <KpiCard
                    title="Assessed Compensation"
                    value={formatINR(project.estimatedCompensationInr, { compact: true })}
                    subtitle="Base award + 100% Solatium"
                    icon={Scale}
                    accentColor="ink"
                />

                {/* 4. Disbursed Compensation */}
                <KpiCard
                    title="Direct DBT Disbursal"
                    value={formatINR(project.disbursedCompensationInr, { compact: true })}
                    subtitle={`${compDisbursedPercent}% released to owners`}
                    change={{
                        value: `${compDisbursedPercent}%`,
                        direction: compDisbursedPercent > 0 ? 'up' : 'neutral',
                    }}
                    icon={Banknote}
                    accentColor="signal"
                />

                {/* 5. Survey Parcel Count */}
                <KpiCard
                    title="Cadastral Parcels"
                    value={new Intl.NumberFormat('en-IN').format(project.parcelCount)}
                    unit="Plots"
                    subtitle="Survey numbers mapped"
                    icon={Layers}
                    accentColor="terracotta"
                />

                {/* 6. Affected Landowners */}
                <KpiCard
                    title="Affected Landowners"
                    value={new Intl.NumberFormat('en-IN').format(project.affectedLandowners)}
                    unit="Enrolled"
                    subtitle="Direct benefit recipients"
                    icon={Users}
                    accentColor="amber"
                />
            </div>
        </section>
    )
}
