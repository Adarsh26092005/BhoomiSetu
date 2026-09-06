import { useNavigate } from 'react-router-dom'
import { Clock, User, ExternalLink, ShieldAlert } from 'lucide-react'
import type { WorkflowAnalytics } from '@/types/analytics'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface WorkflowAnalyticsPanelProps {
    workflow: WorkflowAnalytics
}

export function WorkflowAnalyticsPanel({ workflow }: WorkflowAnalyticsPanelProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-terracotta-600" />
                        <span>Workflow & Citizen Charter SLA Performance</span>
                    </h3>
                    <p className="text-[11px] text-ink-500">
                        Task backlog, review velocity, and statutory SLA breach tracking across officer desks
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.workflow)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
                >
                    <span>View Workflow Queue</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-bold uppercase tracking-wider block">
                        Total Tasks
                    </span>
                    <span className="font-mono text-lg font-black text-ink-900 block">
                        {workflow.totalTasks}
                    </span>
                    <span className="text-[10px] text-ink-500">Across all modules</span>
                </div>

                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                        Pending In-Flight
                    </span>
                    <span className="font-mono text-lg font-black text-amber-950 block">
                        {workflow.pendingTasks + workflow.inReviewTasks}
                    </span>
                    <span className="text-[10px] text-amber-700">
                        {workflow.inReviewTasks} actively in review
                    </span>
                </div>

                <div className="rounded-lg bg-rust-50/60 p-3 border border-rust-200 space-y-0.5">
                    <span className="text-[10px] text-rust-800 font-bold uppercase tracking-wider block">
                        SLA Overdue
                    </span>
                    <span className="font-mono text-lg font-black text-rust-950 block flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-rust-600" />
                        <span>{workflow.slaOverdueCount}</span>
                    </span>
                    <span className="text-[10px] text-rust-700">
                        {workflow.slaWarningCount} due in 24 hours
                    </span>
                </div>

                <div className="rounded-lg bg-signal-50/60 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] text-signal-800 font-bold uppercase tracking-wider block">
                        Avg. Turnaround
                    </span>
                    <span className="font-mono text-lg font-black text-signal-950 block">
                        {workflow.averageTurnaroundDays} Days
                    </span>
                    <span className="text-[10px] text-signal-700">7-Day Charter target</span>
                </div>
            </div>

            {/* Officer Workload Breakdown */}
            <div className="space-y-2 pt-2">
                <span className="font-bold text-ink-800 block text-xs">
                    Officer Desk Task Load & SLA Compliance:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {workflow.tasksByOfficer.map((off) => (
                        <div
                            key={off.officer}
                            className="rounded-lg border border-ink-200 bg-paper p-3 space-y-1 hover:border-ink-300 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-ink-900 truncate flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-ink-400" />
                                    <span>{off.officer}</span>
                                </span>
                                <span className="font-mono text-[10px] bg-ink-100 px-1.5 py-0.2 rounded font-bold text-ink-700">
                                    {off.pending} Pending
                                </span>
                            </div>
                            <span className="text-[10px] text-ink-500 block truncate">
                                Role: {off.role}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
