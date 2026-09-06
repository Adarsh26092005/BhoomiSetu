import { IndianRupee, CheckCircle2, Clock, AlertTriangle, Scale, ShieldAlert } from 'lucide-react'
import type { CompensationRecord } from '@/types'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { formatINR } from '@/lib/format'

interface CompensationKpiSummaryProps {
    records: CompensationRecord[]
}

export function CompensationKpiSummary({ records }: CompensationKpiSummaryProps) {
    const totalAssessed = records.reduce((sum, r) => sum + r.totalAssessedAmountInr, 0)
    const totalPayable = records.reduce((sum, r) => sum + r.totalPayableAmountInr, 0)
    const totalDisbursed = records.reduce((sum, r) => sum + r.amountDisbursedInr, 0)
    const totalPending = records.reduce((sum, r) => sum + r.amountPendingInr, 0)

    const underAssessmentCount = records.filter(
        (r) => r.assessmentStatus === 'UNDER_ASSESSMENT' || r.assessmentStatus === 'ASSESSMENT_PENDING',
    ).length
    const onHoldCount = records.filter((r) => r.assessmentStatus === 'ON_HOLD' || r.paymentStatus === 'ON_HOLD').length
    const disputedCount = records.filter((r) => r.assessmentStatus === 'DISPUTED' || r.paymentStatus === 'DISPUTED').length

    const disbursedPercent = totalPayable > 0 ? Math.round((totalDisbursed / totalPayable) * 100) : 0

    return (
        <section aria-labelledby="compensation-kpi-heading" className="space-y-3">
            <h2 id="compensation-kpi-heading" className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Statutory Compensation Entitlement & Disbursement Totals
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* 1. Total Assessed */}
                <KpiCard
                    title="Total Assessed"
                    value={formatINR(totalAssessed, { compact: true })}
                    unit="Gross Award"
                    subtitle="Gross valuation + solatium"
                    icon={Scale}
                    accentColor="ink"
                />

                {/* 2. Total Payable */}
                <KpiCard
                    title="Total Net Payable"
                    value={formatINR(totalPayable, { compact: true })}
                    unit="Statutory Net"
                    subtitle="Net entitlement post deductions"
                    icon={IndianRupee}
                    accentColor="ink"
                />

                {/* 3. Total Disbursed */}
                <KpiCard
                    title="Disbursed via DBT"
                    value={formatINR(totalDisbursed, { compact: true })}
                    unit={`(${disbursedPercent}%)`}
                    subtitle="Direct PFMS bank credit"
                    change={{ value: `${disbursedPercent}% Paid`, direction: 'up' }}
                    icon={CheckCircle2}
                    accentColor="signal"
                />

                {/* 4. Total Pending */}
                <KpiCard
                    title="Disbursement Pending"
                    value={formatINR(totalPending, { compact: true })}
                    unit="Remaining"
                    subtitle="In treasury disbursement pipeline"
                    icon={Clock}
                    accentColor="amber"
                />

                {/* 5. Under Assessment */}
                <KpiCard
                    title="Under Assessment"
                    value={underAssessmentCount}
                    unit="Parcels"
                    subtitle="Active spot valuation & enquiry"
                    icon={ShieldAlert}
                    accentColor="ink"
                />

                {/* 6. On Hold & Disputed */}
                <KpiCard
                    title="Holds & Litigation"
                    value={onHoldCount + disputedCount}
                    unit="Cases"
                    subtitle={`${onHoldCount} on hold, ${disputedCount} disputed`}
                    change={
                        onHoldCount + disputedCount > 0
                            ? { value: `${onHoldCount + disputedCount} Held/Disputed`, direction: 'down' }
                            : { value: 'Zero Disputes', direction: 'neutral' }
                    }
                    icon={AlertTriangle}
                    accentColor={onHoldCount + disputedCount > 0 ? 'rust' : 'signal'}
                />
            </div>
        </section>
    )
}
