import { useNavigate } from 'react-router-dom'
import { GitBranch, ExternalLink, Clock, User, ArrowRight } from 'lucide-react'
import { useWorkflowByProject } from '@/hooks/use-workflow'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ProjectWorkflowCardProps {
    projectId: string
}

export function ProjectWorkflowCard({ projectId }: ProjectWorkflowCardProps) {
    const navigate = useNavigate()
    const { data: task, isLoading } = useWorkflowByProject(projectId)

    if (isLoading) return null

    if (!task) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                    <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-terracotta-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                            Statutory Approval & Workflow Pipeline
                        </h3>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-ink-500">
                    <span>No active approval bottlenecks for this scheme.</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.workflow)}
                        className="text-xs"
                    >
                        <span>View All Queues</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Active Statutory Workflow Task
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} type="workflow" />
                    <StatusBadge status={task.priority} type="priority" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Task Details */}
                <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink-900 bg-ink-100 px-2 py-0.5 rounded border border-ink-200">
                            {task.id}
                        </span>
                        <span className="font-bold text-ink-900 text-xs truncate">{task.title}</span>
                    </div>
                    <p className="text-ink-500 text-[11px] line-clamp-2">
                        {task.description}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-ink-600">
                        <span>Current Stage:</span>
                        <StatusBadge status={task.currentStage} type="project" />
                        {task.targetStage && (
                            <>
                                <ArrowRight className="h-3 w-3 text-ink-400" />
                                <span>Next: <strong>{task.targetStage}</strong></span>
                            </>
                        )}
                    </div>
                </div>

                {/* Officer & Action */}
                <div className="space-y-3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-ink-100 pt-3 md:pt-0 md:pl-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-ink-700 font-medium">
                            <User className="h-3.5 w-3.5 text-ink-400" />
                            <span className="truncate">{task.assignedOfficer}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-ink-500 text-[11px] font-mono">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Due: {formatDate(task.dueAt)}</span>
                            <StatusBadge status={task.slaStatus} type="sla" />
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(ROUTES.workflowDetail(task.id))}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold w-full cursor-pointer"
                    >
                        <span>Open Decision Dossier</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
