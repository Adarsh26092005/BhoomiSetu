import * as React from 'react'
import { GitBranch, Loader2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useWorkflowTasks } from '@/hooks/use-workflow'
import { useProjects } from '@/hooks/use-projects'
import { WorkflowKpiSummary } from '@/components/workflow/WorkflowKpiSummary'
import { WorkflowQueueTabs, type WorkflowQueueTab } from '@/components/workflow/WorkflowQueueTabs'
import { WorkflowFilters, type WorkflowFilterValues } from '@/components/workflow/WorkflowFilters'
import { WorkflowTable } from '@/components/workflow/WorkflowTable'

export function WorkflowPage() {
    const { data: tasks = [], isLoading } = useWorkflowTasks()
    const { data: projects = [] } = useProjects()

    const [activeQueueTab, setActiveQueueTab] = React.useState<WorkflowQueueTab>('ALL')

    const [filters, setFilters] = React.useState<WorkflowFilterValues>({
        search: '',
        status: 'ALL',
        priority: 'ALL',
        slaStatus: 'ALL',
        currentStage: 'ALL',
        assignedRole: 'ALL',
        projectId: 'ALL',
    })

    const availableProjects = React.useMemo(() => {
        return projects.map((p) => ({ id: p.id, code: p.code, title: p.title }))
    }, [projects])

    // Filter tasks client-side based on Queue Tab + Filters
    const filteredTasks = React.useMemo(() => {
        return tasks.filter((task) => {
            // Tab filter
            if (activeQueueTab === 'PENDING' && task.status !== 'PENDING') return false
            if (activeQueueTab === 'IN_REVIEW' && task.status !== 'IN_REVIEW') return false
            if (activeQueueTab === 'OVERDUE' && task.slaStatus !== 'OVERDUE' && task.priority !== 'CRITICAL') return false
            if (activeQueueTab === 'ON_HOLD' && task.status !== 'ON_HOLD') return false
            if (activeQueueTab === 'COMPLETED' && task.status !== 'COMPLETED') return false

            // Search query
            if (filters.search) {
                const q = filters.search.toLowerCase()
                const matchId = task.id.toLowerCase().includes(q)
                const matchTitle = task.title.toLowerCase().includes(q)
                const matchProject = task.projectName.toLowerCase().includes(q) || task.projectCode.toLowerCase().includes(q)
                const matchOfficer = task.assignedOfficer.toLowerCase().includes(q)
                const matchDesc = task.description.toLowerCase().includes(q)
                const matchType = task.taskType.toLowerCase().includes(q)

                if (!matchId && !matchTitle && !matchProject && !matchOfficer && !matchDesc && !matchType) {
                    return false
                }
            }

            // Status filter
            if (filters.status !== 'ALL' && task.status !== filters.status) return false

            // Priority filter
            if (filters.priority !== 'ALL' && task.priority !== filters.priority) return false

            // SLA status filter
            if (filters.slaStatus !== 'ALL' && task.slaStatus !== filters.slaStatus) return false

            // Current project stage
            if (filters.currentStage !== 'ALL' && task.currentStage !== filters.currentStage) return false

            // Assigned role
            if (filters.assignedRole !== 'ALL' && task.assignedRole !== filters.assignedRole) return false

            // Project ID
            if (filters.projectId !== 'ALL' && task.projectId !== filters.projectId) return false

            return true
        })
    }, [tasks, activeQueueTab, filters])

    const totalCount = tasks.length
    const pendingCount = tasks.filter((t) => t.status === 'PENDING').length
    const inReviewCount = tasks.filter((t) => t.status === 'IN_REVIEW').length
    const overdueCount = tasks.filter((t) => t.slaStatus === 'OVERDUE').length

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Statutory Workflow Queues...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Header Section */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper">
                                <GitBranch className="h-4 w-4" />
                            </div>
                            <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-200 uppercase tracking-wider">
                                STATUTORY APPROVAL PIPELINE
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                            Workflow & Approvals
                        </h1>
                        <p className="text-xs text-ink-500 max-w-2xl">
                            Monitor pending decisions, verification tasks and approval actions across the land acquisition lifecycle.
                        </p>
                    </div>
                </div>

                {/* Scope Stats Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200">
                        <GitBranch className="h-3.5 w-3.5 text-ink-600" />
                        <span>Action Items: {totalCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
                        <Clock className="h-3.5 w-3.5 text-amber-700" />
                        <span>Pending Approvals: {pendingCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-800 border border-ink-200">
                        <ShieldCheck className="h-3.5 w-3.5 text-signal-600" />
                        <span>In Scrutiny: {inReviewCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-rust-50 px-2.5 py-1 text-xs font-semibold text-rust-900 border border-rust-200">
                        <AlertTriangle className="h-3.5 w-3.5 text-rust-700" />
                        <span>SLA Overdue: {overdueCount}</span>
                    </span>
                </div>
            </div>

            {/* 2. Workflow KPI Summary (6 Metrics) */}
            <WorkflowKpiSummary tasks={tasks} />

            {/* 3. Quick Queue Tabs */}
            <WorkflowQueueTabs
                activeTab={activeQueueTab}
                onTabChange={setActiveQueueTab}
                tasks={tasks}
            />

            {/* 4. Interactive Search & Filters */}
            <WorkflowFilters
                filters={filters}
                onFilterChange={setFilters}
                availableProjects={availableProjects}
                totalResults={filteredTasks.length}
                totalTasks={totalCount}
            />

            {/* 5. Workflow Table */}
            <WorkflowTable
                tasks={filteredTasks}
                onResetFilters={() => {
                    setActiveQueueTab('ALL')
                    setFilters({
                        search: '',
                        status: 'ALL',
                        priority: 'ALL',
                        slaStatus: 'ALL',
                        currentStage: 'ALL',
                        assignedRole: 'ALL',
                        projectId: 'ALL',
                    })
                }}
                isFiltered={
                    activeQueueTab !== 'ALL' ||
                    Boolean(filters.search) ||
                    filters.status !== 'ALL' ||
                    filters.priority !== 'ALL' ||
                    filters.slaStatus !== 'ALL' ||
                    filters.currentStage !== 'ALL' ||
                    filters.assignedRole !== 'ALL' ||
                    filters.projectId !== 'ALL'
                }
            />
        </div>
    )
}
