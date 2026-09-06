import { FileStack, CheckCircle2, Clock, AlertTriangle, FileText, History } from 'lucide-react'
import type { ProjectDocument } from '@/types'
import { KpiCard } from '@/components/dashboard/KpiCard'

interface DocumentKpiSummaryProps {
    documents: ProjectDocument[]
}

export function DocumentKpiSummary({ documents }: DocumentKpiSummaryProps) {
    const totalCount = documents.length
    const verifiedCount = documents.filter((d) => d.verificationStatus === 'VERIFIED').length
    const underReviewCount = documents.filter((d) => d.verificationStatus === 'UNDER_REVIEW').length
    const pendingCount = documents.filter((d) => d.verificationStatus === 'PENDING').length
    const rejectedCount = documents.filter((d) => d.verificationStatus === 'REJECTED').length
    const supersededCount = documents.filter((d) => d.verificationStatus === 'SUPERSEDED').length

    const verifiedPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0

    return (
        <section aria-labelledby="document-kpi-heading" className="space-y-3">
            <h2 id="document-kpi-heading" className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Statutory Document Vault & Verification Metrics
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* 1. Total Documents */}
                <KpiCard
                    title="Total Documents"
                    value={totalCount}
                    unit="Records"
                    subtitle="Central statutory repository"
                    icon={FileStack}
                    accentColor="ink"
                />

                {/* 2. Verified Documents */}
                <KpiCard
                    title="Statutory Verified"
                    value={verifiedCount}
                    unit={`(${verifiedPercent}%)`}
                    subtitle="LAO sealed & verified"
                    change={{ value: `${verifiedPercent}%`, direction: 'up' }}
                    icon={CheckCircle2}
                    accentColor="signal"
                />

                {/* 3. Under Review */}
                <KpiCard
                    title="Under Scrutiny"
                    value={underReviewCount}
                    unit="Files"
                    subtitle="Active officer review"
                    icon={Clock}
                    accentColor="amber"
                />

                {/* 4. Pending Verification */}
                <KpiCard
                    title="Pending Review"
                    value={pendingCount}
                    unit="Uploads"
                    subtitle="Awaiting initial scrutiny"
                    icon={FileText}
                    accentColor="ink"
                />

                {/* 5. Defective / Rejected */}
                <KpiCard
                    title="Rejected / Defective"
                    value={rejectedCount}
                    unit="Notices"
                    subtitle="Disputed or illegible records"
                    change={
                        rejectedCount > 0
                            ? { value: `${rejectedCount} Defective`, direction: 'down' }
                            : { value: 'Zero Defective', direction: 'neutral' }
                    }
                    icon={AlertTriangle}
                    accentColor={rejectedCount > 0 ? 'rust' : 'signal'}
                />

                {/* 6. Superseded */}
                <KpiCard
                    title="Archived Versions"
                    value={supersededCount}
                    unit="Superseded"
                    subtitle="Previous version history"
                    icon={History}
                    accentColor="ink"
                />
            </div>
        </section>
    )
}
