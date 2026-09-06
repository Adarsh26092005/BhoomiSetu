import { Search, X, RotateCcw, Filter } from 'lucide-react'
import type { PossessionStatus, PossessionType } from '@/types'
import { POSSESSION_STATUS_META, POSSESSION_TYPE_META } from '@/constants/status'

export interface PossessionFilterValues {
    search: string
    possessionStatus: PossessionStatus | 'ALL'
    possessionType: PossessionType | 'ALL'
    projectId: string
    district: string
    readiness: 'ALL' | 'READY' | 'CONDITIONAL' | 'BLOCKED'
}

interface PossessionFiltersProps {
    filters: PossessionFilterValues
    onFilterChange: (filters: PossessionFilterValues) => void
    availableProjects: { id: string; code: string; title: string }[]
    availableDistricts: string[]
    totalResults: number
    totalRecords: number
}

export function PossessionFilters({
    filters,
    onFilterChange,
    availableProjects,
    availableDistricts,
    totalResults,
    totalRecords,
}: PossessionFiltersProps) {
    const isFiltered =
        Boolean(filters.search) ||
        filters.possessionStatus !== 'ALL' ||
        filters.possessionType !== 'ALL' ||
        filters.projectId !== 'ALL' ||
        filters.district !== 'ALL' ||
        filters.readiness !== 'ALL'

    const handleReset = () => {
        onFilterChange({
            search: '',
            possessionStatus: 'ALL',
            possessionType: 'ALL',
            projectId: 'ALL',
            district: 'ALL',
            readiness: 'ALL',
        })
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-4 sm:p-5 shadow-xs space-y-4">
            {/* Search and Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                {/* Search Bar (4 cols) */}
                <div className="lg:col-span-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                        placeholder="Search possession ID, survey no, plot, officer, village..."
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

                {/* Possession Status (2.5 cols) */}
                <div className="lg:col-span-2.5">
                    <select
                        value={filters.possessionStatus}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                possessionStatus: e.target.value as PossessionStatus | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Possession Stages ({totalRecords})</option>
                        {Object.entries(POSSESSION_STATUS_META).map(([statusKey, meta]) => (
                            <option key={statusKey} value={statusKey}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Possession Type (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.possessionType}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                possessionType: e.target.value as PossessionType | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Handover Types</option>
                        {Object.entries(POSSESSION_TYPE_META).map(([typeKey, meta]) => (
                            <option key={typeKey} value={typeKey}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Scheme Selector (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.projectId}
                        onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value })}
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Schemes</option>
                        {availableProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.code}
                            </option>
                        ))}
                    </select>
                </div>

                {/* District Filter (1.5 cols) */}
                <div className="lg:col-span-1.5">
                    <select
                        value={filters.district}
                        onChange={(e) => onFilterChange({ ...filters, district: e.target.value })}
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Districts</option>
                        {availableDistricts.map((d) => (
                            <option key={d} value={d}>
                                {d}
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

                    {filters.possessionStatus !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Stage: {POSSESSION_STATUS_META[filters.possessionStatus]?.label ?? filters.possessionStatus}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, possessionStatus: 'ALL' })}
                                className="hover:text-rust-700 cursor-pointer"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.possessionType !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Type: {POSSESSION_TYPE_META[filters.possessionType]?.label ?? filters.possessionType}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, possessionType: 'ALL' })}
                                className="hover:text-rust-700 cursor-pointer"
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
                                className="hover:text-rust-700 font-sans cursor-pointer"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.district !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>District: {filters.district}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, district: 'ALL' })}
                                className="hover:text-rust-700 cursor-pointer"
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
                    Showing <strong className="text-ink-900">{totalResults}</strong> of {totalRecords} Possession Dockets
                </div>
            </div>
        </div>
    )
}
