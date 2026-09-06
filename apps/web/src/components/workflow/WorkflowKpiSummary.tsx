import { GitBranch, Clock, AlertTriangle, AlertCircle, CheckCircle2, PauseCircle } from 'lucide-react'
import type { WorkflowTask } from '@/types'
import { KpiCard } from '@/components/dashboard/KpiCard'

interface WorkflowKpiSummaryProps {
    tasks: WorkflowTask[]
}

export function WorkflowKpiSummary({ tasks }: WorkflowKpiSummaryProps) {
    const totalCount = tasks.length
    const pendingCount = tasks.filter((t) => t.status === 'PENDING').length
    const inReviewCount = tasks.filter((t) => t.status === 'IN_REVIEW').length
    const overdueCount = tasks.filter((t) => t.slaStatus === 'OVERDUE').length
    const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length
    const onHoldCount = tasks.filter((t) => t.status === 'ON_HOLD').length

    return (
        <section aria-labelledby="workflow-kpi-heading" className="space-y-3">
            <h2 id="workflow-kpi-heading" className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Statutory Decision Queues & SLA Metrics
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* 1. Pending Actions */}
                <KpiCard
                    title="Pending Decisions"
                    value={pendingCount}
                    unit="Tasks"
                    subtitle="Awaiting officer review"
                    icon={GitBranch}
                    accentColor="ink"
                />

                {/* 2. In Review */}
                <KpiCard
                    title="In Active Scrutiny"
                    value={inReviewCount}
                    unit="Files"
                    subtitle="Hearings & SIA scrutiny"
                    icon={Clock}
                    accentColor="amber"
                />

                {/* 3. SLA Overdue */}
                <KpiCard
                    title="SLA Overdue"
                    value={overdueCount}
                    unit="Tasks"
                    subtitle="Exceeded statutory turnaround"
                    change={
                        overdueCount > 0
                            ? { value: `${overdueCount} Overdue`, direction: 'down' }
                            : { value: 'Zero Breaches', direction: 'neutral' }
                    }
                    icon={AlertTriangle}
                    accentColor={overdueCount > 0 ? 'rust' : 'signal'}
                />

                {/* 4. On Hold */}
                <KpiCard
                    title="Stayed / On Hold"
                    value={onHoldCount}
                    unit="Cases"
                    subtitle="Litigation / judicial stay"
                    icon={PauseCircle}
                    accentColor="amber"
                />

                {/* 5. Approved */}
                <KpiCard
                    title="Approved & Passed"
                    value={completedCount}
                    unit="Stages"
                    subtitle="Advanced to next milestone"
                    icon={CheckCircle2}
                    accentColor="signal"
                />

                {/* 6. Total Tracked */}
                <KpiCard
                    title="Total Action Items"
                    value={totalCount}
                    unit="Pipelines"
                    subtitle="Across all state schemes"
                    icon={AlertCircle}
                    accentColor="ink"
                />
            </div>
        </section>
    )
}
