import { useNavigate } from 'react-router-dom'
import { ExternalLink, GitBranch, RotateCcw, SearchX, User } from 'lucide-react'
import type { WorkflowTask } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface WorkflowTableProps {
    tasks: WorkflowTask[]
    onResetFilters?: () => void
    isFiltered?: boolean
}

export function WorkflowTable({ tasks, onResetFilters, isFiltered = false }: WorkflowTableProps) {
    const navigate = useNavigate()

    if (tasks.length === 0) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
                    <SearchX className="h-7 w-7 text-terracotta-600" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink-900">No Workflow Action Items Found</h3>
                    <p className="text-xs text-ink-500 max-w-sm mx-auto">
                        No pending decisions or scrutiny items match the selected queue tab or applied filters.
                    </p>
                </div>
                {isFiltered && onResetFilters && (
                    <div className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onResetFilters}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset All Filters</span>
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-ink-200 bg-ink-50/70 text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                            <th scope="col" className="py-3.5 px-4">Task ID & Subject</th>
                            <th scope="col" className="py-3.5 px-4">Scheme Code</th>
                            <th scope="col" className="py-3.5 px-4">Statutory Stage</th>
                            <th scope="col" className="py-3.5 px-4">Assigned Officer</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Priority</th>
                            <th scope="col" className="py-3.5 px-4">SLA Deadline</th>
                            <th scope="col" className="py-3.5 px-4">Workflow Status</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {tasks.map((task) => (
                            <tr
                                key={task.id}
                                className="group hover:bg-ink-50/60 transition-colors cursor-pointer"
                                onClick={() => navigate(ROUTES.workflowDetail(task.id))}
                            >
                                {/* Task ID & Subject */}
                                <td className="py-3.5 px-4">
                                    <div className="space-y-0.5 max-w-sm">
                                        <div className="flex items-center gap-1.5">
                                            <GitBranch className="h-3.5 w-3.5 text-terracotta-600 shrink-0" />
                                            <span className="font-mono font-bold text-xs text-ink-900 group-hover:text-terracotta-700 transition-colors">
                                                {task.id}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-xs text-ink-900 block truncate" title={task.title}>
                                            {task.title}
                                        </span>
                                        <span className="text-[10px] text-ink-400 block truncate" title={task.taskType}>
                                            {task.taskType}
                                        </span>
                                    </div>
                                </td>

                                {/* Scheme Code */}
                                <td className="py-3.5 px-4 font-mono text-xs">
                                    <span className="font-bold text-ink-900 block">{task.projectCode}</span>
                                    <span className="text-[10px] text-ink-500 block truncate max-w-[140px]" title={task.projectName}>
                                        {task.projectName}
                                    </span>
                                </td>

                                {/* Statutory Stage */}
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={task.currentStage} type="project" />
                                </td>

                                {/* Assigned Officer */}
                                <td className="py-3.5 px-4 text-ink-700">
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3 text-ink-400 shrink-0" />
                                        <span className="font-medium text-xs text-ink-900 truncate max-w-[150px]" title={task.assignedOfficer}>
                                            {task.assignedOfficer}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-ink-400 block pl-4">
                                        {task.assignedRole.replace(/_/g, ' ')}
                                    </span>
                                </td>

                                {/* Priority */}
                                <td className="py-3.5 px-4 text-center">
                                    <StatusBadge status={task.priority} type="priority" />
                                </td>

                                {/* SLA Deadline */}
                                <td className="py-3.5 px-4">
                                    <div className="space-y-1">
                                        <StatusBadge status={task.slaStatus} type="sla" />
                                        <span className="font-mono text-[10px] text-ink-400 block">
                                            Due: {formatDate(task.dueAt)}
                                        </span>
                                    </div>
                                </td>

                                {/* Task Status */}
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={task.status} type="workflow" />
                                </td>

                                {/* Action */}
                                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(ROUTES.workflowDetail(task.id))}
                                        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-ink-800 bg-ink-100 hover:bg-ink-200 transition-colors"
                                        title={`Review task ${task.id}`}
                                    >
                                        <span>Dossier</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
