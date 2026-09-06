import {
    Landmark,
    MapPin,
    CheckCircle2,
    Clock,
    Scale,
    Banknote,
    Layers,
    Home,
} from 'lucide-react'
import { KpiCard } from './KpiCard'
import type { AcquisitionProject } from '@/types'
import { formatINR } from '@/lib/format'

interface ExecutiveKpiGridProps {
    projects: AcquisitionProject[]
}

export function ExecutiveKpiGrid({ projects }: ExecutiveKpiGridProps) {
    // 1. Total Projects
    const totalProjects = projects.length

    // 2. Total Land Proposed (hectares)
    const totalLandProposedHa = projects.reduce((acc, p) => acc + p.totalAreaHectares, 0)

    // 3. Total Land Acquired (hectares from completed/possessing projects)
    const totalLandAcquiredHa = projects.reduce((acc, p) => {
        if (p.status === 'COMPLETED' || p.status === 'POSSESSION_COMPLETED') {
            return acc + p.totalAreaHectares
        }
        if (p.status === 'POSSESSION_PENDING' && p.estimatedCompensationInr > 0) {
            // Partial possession prorated by disbursed compensation
            const ratio = Math.min(1, p.disbursedCompensationInr / p.estimatedCompensationInr)
            return acc + p.totalAreaHectares * ratio
        }
        return acc
    }, 0)

    // 4. Projects Under Active Process (excluding COMPLETED, REJECTED, ON_HOLD)
    const projectsUnderProcess = projects.filter(
        (p) => p.status !== 'COMPLETED' && p.status !== 'REJECTED' && p.status !== 'ON_HOLD',
    ).length

    // 5. Total Compensation Assessed (INR)
    const totalCompensationAssessedInr = projects.reduce((acc, p) => acc + p.estimatedCompensationInr, 0)

    // 6. Total Compensation Disbursed (INR)
    const totalCompensationDisbursedInr = projects.reduce((acc, p) => acc + p.disbursedCompensationInr, 0)

    // 7. Parcels Under Acquisition
    const totalParcelsCount = projects.reduce((acc, p) => acc + p.parcelCount, 0)

    // 8. Affected Landowners / R&R Cases
    const totalAffectedLandowners = projects.reduce((acc, p) => acc + p.affectedLandowners, 0)

    const disbursementPercentage = totalCompensationAssessedInr > 0
        ? Math.round((totalCompensationDisbursedInr / totalCompensationAssessedInr) * 100)
        : 0

    return (
        <section aria-labelledby="executive-kpis-heading" className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 id="executive-kpis-heading" className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Executive Key Performance Indicators (National Overview)
                </h2>
                <span className="text-[11px] text-ink-400 font-mono">
                    Aggregated across {totalProjects} Projects
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Total Projects */}
                <KpiCard
                    title="Total Projects"
                    value={totalProjects}
                    unit="National Schemes"
                    subtitle="Spanning 7 States & Corridors"
                    change={{ value: '+2', direction: 'up', period: 'Q3 FY26' }}
                    icon={Landmark}
                    accentColor="ink"
                />

                {/* 2. Total Land Proposed */}
                <KpiCard
                    title="Total Land Proposed"
                    value={new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(totalLandProposedHa)}
                    unit="Hectares (ha)"
                    subtitle="Under active statutory notifications"
                    change={{ value: '+412 ha', direction: 'up', period: 'This Month' }}
                    icon={MapPin}
                    accentColor="terracotta"
                />

                {/* 3. Total Land Acquired */}
                <KpiCard
                    title="Total Land Acquired"
                    value={new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(totalLandAcquiredHa)}
                    unit="Hectares (ha)"
                    subtitle={`${Math.round((totalLandAcquiredHa / (totalLandProposedHa || 1)) * 100)}% of total proposed area`}
                    change={{ value: '+156.8 ha', direction: 'up', period: 'FY26 Q2' }}
                    icon={CheckCircle2}
                    accentColor="signal"
                />

                {/* 4. Projects Under Process */}
                <KpiCard
                    title="Projects Under Process"
                    value={projectsUnderProcess}
                    unit="Active Pipelines"
                    subtitle="Under Section 11 to 19 reviews"
                    change={{ value: '3 in Hearings', direction: 'neutral' }}
                    icon={Clock}
                    accentColor="amber"
                />

                {/* 5. Compensation Assessed */}
                <KpiCard
                    title="Compensation Assessed"
                    value={formatINR(totalCompensationAssessedInr, { compact: true })}
                    unit="LARR 2013 Base + Solatium"
                    subtitle="Approved by Competent Authority"
                    change={{ value: '+₹214 Cr', direction: 'up', period: 'Sec. 19 awards' }}
                    icon={Scale}
                    accentColor="ink"
                />

                {/* 6. Compensation Disbursed */}
                <KpiCard
                    title="Compensation Disbursed"
                    value={formatINR(totalCompensationDisbursedInr, { compact: true })}
                    unit={`${disbursementPercentage}% Direct DBT`}
                    subtitle="Escrow to Aadhaar PFMS accounts"
                    change={{ value: '₹121.7 Cr', direction: 'up', period: 'Direct DBT' }}
                    icon={Banknote}
                    accentColor="signal"
                />

                {/* 7. Parcels Under Acquisition */}
                <KpiCard
                    title="Survey Parcels"
                    value={new Intl.NumberFormat('en-IN').format(totalParcelsCount)}
                    unit="Cadastral Units"
                    subtitle="Digitized survey plot numbers"
                    change={{ value: '98.4%', direction: 'up', period: 'GIS Mapped' }}
                    icon={Layers}
                    accentColor="terracotta"
                />

                {/* 8. R&R Cases / Affected Landowners */}
                <KpiCard
                    title="R&R & Affected Families"
                    value={new Intl.NumberFormat('en-IN').format(totalAffectedLandowners)}
                    unit="Enrolled Households"
                    subtitle="Socio-economic rehabilitation registry"
                    change={{ value: '1,420 in R&R', direction: 'neutral' }}
                    icon={Home}
                    accentColor="amber"
                />
            </div>
        </section>
    )
}
