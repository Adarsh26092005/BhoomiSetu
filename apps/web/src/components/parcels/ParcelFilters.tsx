import { Search, X, RotateCcw, Filter } from 'lucide-react'
import type { ParcelStatus, LandType } from '@/types'
import { PARCEL_STATUS_META } from '@/constants/status'

export interface ParcelFilterValues {
    search: string
    status: ParcelStatus | 'ALL'
    state: string
    district: string
    landType: LandType | 'ALL'
    projectId: string
}

interface ParcelFiltersProps {
    filters: ParcelFilterValues
    onFilterChange: (filters: ParcelFilterValues) => void
    availableStates: string[]
    availableDistricts: string[]
    availableProjects: { id: string; code: string; title: string }[]
    totalResults: number
    totalParcels: number
}

export function ParcelFilters({
    filters,
    onFilterChange,
    availableStates,
    availableDistricts,
    availableProjects,
    totalResults,
    totalParcels,
}: ParcelFiltersProps) {
    const isFiltered =
        Boolean(filters.search) ||
        filters.status !== 'ALL' ||
        filters.state !== 'ALL' ||
        filters.district !== 'ALL' ||
        filters.landType !== 'ALL' ||
        filters.projectId !== 'ALL'

    const handleReset = () => {
        onFilterChange({
            search: '',
            status: 'ALL',
            state: 'ALL',
            district: 'ALL',
            landType: 'ALL',
            projectId: 'ALL',
        })
    }

    const landTypes: { label: string; value: LandType | 'ALL' }[] = [
        { label: 'All Land Types', value: 'ALL' },
        { label: 'Agricultural', value: 'AGRICULTURAL' },
        { label: 'Homestead / Residential', value: 'HOMESTEAD' },
        { label: 'Commercial', value: 'COMMERCIAL' },
        { label: 'Forest / Tribal Land', value: 'FOREST' },
        { label: 'Government Waste', value: 'GOVERNMENT_WASTE' },
    ]

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
                        placeholder="Search survey/khasra no, village, district, or owner..."
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
                                status: e.target.value as ParcelStatus | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Statuses ({totalParcels})</option>
                        {Object.entries(PARCEL_STATUS_META).map(([statusKey, meta]) => (
                            <option key={statusKey} value={statusKey}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Project Selector (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.projectId}
                        onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value })}
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Schemes / Projects</option>
                        {availableProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.code}
                            </option>
                        ))}
                    </select>
                </div>

                {/* State (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.state}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                state: e.target.value,
                                district: 'ALL',
                            })
                        }
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

                {/* District (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.district}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                district: e.target.value,
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Districts</option>
                        {availableDistricts.map((dst) => (
                            <option key={dst} value={dst}>
                                {dst}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Land Classification (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.landType}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                landType: e.target.value as LandType | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        {landTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filter Chips & Counter */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-ink-500 font-semibold text-[11px] uppercase tracking-wider">
                        <Filter className="h-3 w-3 text-terracotta-600" />
                        <span>Filter Summary:</span>
                    </div>

                    {filters.status !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Status: {PARCEL_STATUS_META[filters.status]?.label ?? filters.status}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, status: 'ALL' })}
                                className="hover:text-rust-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.projectId !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200 font-mono">
                            <span>Project: {availableProjects.find((p) => p.id === filters.projectId)?.code ?? filters.projectId}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, projectId: 'ALL' })}
                                className="hover:text-rust-700 font-sans"
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

                    {filters.landType !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Type: {filters.landType}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, landType: 'ALL' })}
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
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-700 hover:text-terracotta-900 underline ml-1 cursor-pointer"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset Filters</span>
                        </button>
                    )}
                </div>

                <div className="font-mono text-[11px] text-ink-500">
                    Showing <strong className="text-ink-900">{totalResults}</strong> of {totalParcels} Cadastral Parcels
                </div>
            </div>
        </div>
    )
}
