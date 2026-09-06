import { Search, X, RotateCcw, Filter } from 'lucide-react'
import type { ProjectStatus, ProjectCategory } from '@/types'
import { PROJECT_STATUS_META } from '@/constants/status'

export interface ProjectFilterValues {
    search: string
    status: ProjectStatus | 'ALL'
    state: string
    category: ProjectCategory | 'ALL'
}

interface ProjectFiltersProps {
    filters: ProjectFilterValues
    onFilterChange: (filters: ProjectFilterValues) => void
    availableStates: string[]
    totalResults: number
    totalProjects: number
}

export function ProjectFilters({
    filters,
    onFilterChange,
    availableStates,
    totalResults,
    totalProjects,
}: ProjectFiltersProps) {
    const isFiltered =
        Boolean(filters.search) ||
        filters.status !== 'ALL' ||
        filters.state !== 'ALL' ||
        filters.category !== 'ALL'

    const handleReset = () => {
        onFilterChange({
            search: '',
            status: 'ALL',
            state: 'ALL',
            category: 'ALL',
        })
    }

    const categories: { label: string; value: ProjectCategory | 'ALL' }[] = [
        { label: 'All Categories', value: 'ALL' },
        { label: 'Highway / Expressway', value: 'HIGHWAY' },
        { label: 'Railway & Rapid Rail', value: 'RAILWAY' },
        { label: 'Irrigation & Canal', value: 'IRRIGATION' },
        { label: 'Industrial Corridor', value: 'INDUSTRIAL_CORRIDOR' },
        { label: 'Urban Infrastructure', value: 'URBAN_INFRASTRUCTURE' },
        { label: 'Energy & Pipelines', value: 'ENERGY' },
        { label: 'Defence & Strategic', value: 'DEFENCE' },
    ]

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-4 sm:p-5 shadow-xs space-y-4">
            {/* Top Search & Dropdown Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                {/* Search Bar (5 cols) */}
                <div className="lg:col-span-5 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                        placeholder="Search by project title, code, agency, district, or state..."
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

                {/* Status Filter (3 cols) */}
                <div className="lg:col-span-3">
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                status: e.target.value as ProjectStatus | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Statutory Statuses ({totalProjects})</option>
                        {Object.entries(PROJECT_STATUS_META).map(([statusKey, meta]) => (
                            <option key={statusKey} value={statusKey}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* State Filter (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.state}
                        onChange={(e) => onFilterChange({ ...filters, state: e.target.value })}
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All States</option>
                        {availableStates.map((st) => (
                            <option key={st} value={st}>
                                {st}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Filter (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.category}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                category: e.target.value as ProjectCategory | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters Bar & Counter */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-ink-500 font-semibold text-[11px] uppercase tracking-wider">
                        <Filter className="h-3 w-3 text-terracotta-600" />
                        <span>Filter Summary:</span>
                    </div>

                    {filters.status !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Status: {PROJECT_STATUS_META[filters.status]?.label ?? filters.status}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, status: 'ALL' })}
                                className="hover:text-rust-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.state !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>State: {filters.state}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, state: 'ALL' })}
                                className="hover:text-rust-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.category !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Category: {filters.category}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, category: 'ALL' })}
                                className="hover:text-rust-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {isFiltered && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-700 hover:text-terracotta-900 underline ml-1"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset Filters</span>
                        </button>
                    )}
                </div>

                <div className="font-mono text-[11px] text-ink-500">
                    Showing <strong className="text-ink-900">{totalResults}</strong> of {totalProjects} Projects
                </div>
            </div>
        </div>
    )
}
