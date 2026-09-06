import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Landmark, FileStack, Map, Calendar, GitBranch } from 'lucide-react'
import type { WorkflowTask } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface WorkflowDetailHeaderProps {
    task: WorkflowTask
}

export function WorkflowDetailHeader({ task }: WorkflowDetailHeaderProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-3">
                <button
                    type="button"
                    onClick={() => navigate(ROUTES.workflow)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Workflow Queues</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-ink-500 font-mono">
                    <span>Task ID: <strong className="text-ink-900">{task.id}</strong></span>
                </div>
            </div>

            {/* Main Title & Scope Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-ink-900 bg-ink-100 px-2.5 py-0.5 rounded border border-ink-200">
                            {task.id}
                        </span>
                        <StatusBadge status={task.status} type="workflow" />
                        <StatusBadge status={task.priority} type="priority" />
                        <StatusBadge status={task.slaStatus} type="sla" />
                        <span className="rounded bg-ink-100 px-2 py-0.5 text-[11px] font-mono font-semibold text-ink-800 border border-ink-200">
                            Stage: {task.currentStage}
                        </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                        {task.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-ink-600">
                        <span className="flex items-center gap-1 font-mono text-ink-900 font-semibold">
                            <Landmark className="h-3.5 w-3.5 text-terracotta-600" />
                            <span>{task.projectCode} — {task.projectName}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <GitBranch className="h-3.5 w-3.5 text-ink-500" />
                            <span>{task.taskType}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-ink-500 font-mono">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Due Date: {formatDate(task.dueAt)} ({task.slaDays}d SLA)</span>
                        </span>
                    </div>
                </div>

                {/* Module Action Shortcuts */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.projectDetail(task.projectId))}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <Landmark className="h-3.5 w-3.5 text-ink-600" />
                        <span>Scheme Dossier</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.documents}?projectId=${task.projectId}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/50"
                    >
                        <FileStack className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>Vault Documents</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.gis)}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <Map className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>GIS Cadastre</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
