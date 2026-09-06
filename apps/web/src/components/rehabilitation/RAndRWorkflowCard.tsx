import { useNavigate } from 'react-router-dom'
import { GitBranch, ExternalLink, User, Clock } from 'lucide-react'
import { useWorkflowByProject } from '@/hooks/use-workflow'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface RAndRWorkflowCardProps {
    projectId: string
}

export function RAndRWorkflowCard({ projectId }: RAndRWorkflowCardProps) {
    const navigate = useNavigate()
    const { data: task, isLoading } = useWorkflowByProject(projectId)

    if (isLoading || !task) return null

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Statutory Approval Milestone
                    </h3>
                </div>
                <StatusBadge status={task.status} type="workflow" />
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink-900 bg-ink-100 px-2 py-0.5 rounded border border-ink-200">
                        {task.id}
                    </span>
                    <span className="font-bold text-ink-900 block truncate">{task.title}</span>
                </div>

                <div className="space-y-1 text-ink-600">
                    <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-ink-400" />
                        <span>Assigned: <strong>{task.assignedOfficer}</strong> ({task.assignedRole.replace(/_/g, ' ')})</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-500">
                        <Clock className="h-3.5 w-3.5 text-ink-400" />
                        <span>Due: {formatDate(task.dueAt)}</span>
                        <StatusBadge status={task.slaStatus} type="sla" />
                    </div>
                </div>

                <div className="pt-2 border-t border-ink-100">
                    <Button
                        type="button"
                        variant="outline"
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
