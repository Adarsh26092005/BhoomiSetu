import { Search, X, RotateCcw, Filter } from 'lucide-react'
import type { WorkflowTaskStatus, WorkflowPriority, WorkflowSlaStatus, ProjectStatus, UserRole } from '@/types'
import {
    WORKFLOW_TASK_STATUS_META,
    WORKFLOW_PRIORITY_META,
    WORKFLOW_SLA_STATUS_META,
} from '@/constants/status'

export interface WorkflowFilterValues {
    search: string
    status: WorkflowTaskStatus | 'ALL'
    priority: WorkflowPriority | 'ALL'
    slaStatus: WorkflowSlaStatus | 'ALL'
    currentStage: ProjectStatus | 'ALL'
    assignedRole: UserRole | 'ALL'
    projectId: string
}

interface WorkflowFiltersProps {
    filters: WorkflowFilterValues
    onFilterChange: (filters: WorkflowFilterValues) => void
    availableProjects: { id: string; code: string; title: string }[]
    totalResults: number
    totalTasks: number
}

export function WorkflowFilters({
    filters,
    onFilterChange,
    availableProjects,
    totalResults,
    totalTasks,
}: WorkflowFiltersProps) {
    const isFiltered =
        Boolean(filters.search) ||
        filters.status !== 'ALL' ||
        filters.priority !== 'ALL' ||
        filters.slaStatus !== 'ALL' ||
        filters.currentStage !== 'ALL' ||
        filters.assignedRole !== 'ALL' ||
        filters.projectId !== 'ALL'

    const handleReset = () => {
        onFilterChange({
            search: '',
            status: 'ALL',
            priority: 'ALL',
            slaStatus: 'ALL',
            currentStage: 'ALL',
            assignedRole: 'ALL',
            projectId: 'ALL',
        })
    }

    const roles: { label: string; value: UserRole | 'ALL' }[] = [
        { label: 'All Officer Roles', value: 'ALL' },
        { label: 'LAO Officer', value: 'LAND_ACQUISITION_OFFICER' },
        { label: 'District Officer / DM', value: 'DISTRICT_OFFICER' },
        { label: 'State Authority Officer', value: 'STATE_OFFICER' },
        { label: 'Central Ministry Officer', value: 'CENTRAL_OFFICER' },
        { label: 'Verification Officer', value: 'VERIFICATION_OFFICER' },
        { label: 'Survey Officer', value: 'SURVEY_OFFICER' },
        { label: 'Finance Officer', value: 'FINANCE_OFFICER' },
        { label: 'R&R Officer', value: 'R_AND_R_OFFICER' },
    ]

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-4 sm:p-5 shadow-xs space-y-4">
            {/* Search and Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                {/* Search Bar (3 cols) */}
                <div className="lg:col-span-3 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                        placeholder="Search task title, scheme, officer..."
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper pl-9 pr-9 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => onFilterChange({ ...filters, search: '' })}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Status Selector (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                status: e.target.value as WorkflowTaskStatus | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Statuses ({totalTasks})</option>
                        {Object.entries(WORKFLOW_TASK_STATUS_META).map(([statusKey, meta]) => (
                            <option key={statusKey} value={statusKey}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priority Selector (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.priority}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                priority: e.target.value as WorkflowPriority | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Priorities</option>
                        {Object.entries(WORKFLOW_PRIORITY_META).map(([priKey, meta]) => (
                            <option key={priKey} value={priKey}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Role Selector (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.assignedRole}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                assignedRole: e.target.value as UserRole | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        {roles.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* SLA Status (1.5 cols) */}
                <div className="lg:col-span-1.5">
                    <select
                        value={filters.slaStatus}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                slaStatus: e.target.value as WorkflowSlaStatus | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">SLA</option>
                        {Object.entries(WORKFLOW_SLA_STATUS_META).map(([slaKey, meta]) => (
                            <option key={slaKey} value={slaKey}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Scheme Selector (1.5 cols) */}
                <div className="lg:col-span-1.5">
                    <select
                        value={filters.projectId}
                        onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value })}
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">Schemes</option>
                        {availableProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.code}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters Bar & Result Counter */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-ink-500 font-semibold text-[11px] uppercase tracking-wider">
                        <Filter className="h-3 w-3 text-terracotta-600" />
                        <span>Active Filter:</span>
                    </div>

                    {filters.status !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Status: {WORKFLOW_TASK_STATUS_META[filters.status]?.label ?? filters.status}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, status: 'ALL' })}
                                className="hover:text-rust-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.priority !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Priority: {filters.priority}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, priority: 'ALL' })}
                                className="hover:text-rust-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.slaStatus !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>SLA: {WORKFLOW_SLA_STATUS_META[filters.slaStatus]?.label ?? filters.slaStatus}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, slaStatus: 'ALL' })}
                                className="hover:text-rust-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.projectId !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200 font-mono">
                            <span>Scheme: {availableProjects.find((p) => p.id === filters.projectId)?.code ?? filters.projectId}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, projectId: 'ALL' })}
                                className="hover:text-rust-700 font-sans"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {isFiltered && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-700 hover:text-terracotta-900 underline ml-1 cursor-pointer"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset Filters</span>
                        </button>
                    )}
                </div>

                <div className="font-mono text-[11px] text-ink-500">
                    Showing <strong className="text-ink-900">{totalResults}</strong> of {totalTasks} Workflow Tasks
                </div>
            </div>
        </div>
    )
}
