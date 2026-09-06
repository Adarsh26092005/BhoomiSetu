import { Search, X, RotateCcw, Filter } from 'lucide-react'
import type { CompensationAssessmentStatus, CompensationPaymentStatus } from '@/types'
import {
    COMPENSATION_ASSESSMENT_STATUS_META,
    COMPENSATION_PAYMENT_STATUS_META,
} from '@/constants/status'

export interface CompensationFilterValues {
    search: string
    assessmentStatus: CompensationAssessmentStatus | 'ALL'
    paymentStatus: CompensationPaymentStatus | 'ALL'
    projectId: string
    classification: string
}

interface CompensationFiltersProps {
    filters: CompensationFilterValues
    onFilterChange: (filters: CompensationFilterValues) => void
    availableProjects: { id: string; code: string; title: string }[]
    totalResults: number
    totalRecords: number
}

export function CompensationFilters({
    filters,
    onFilterChange,
    availableProjects,
    totalResults,
    totalRecords,
}: CompensationFiltersProps) {
    const isFiltered =
        Boolean(filters.search) ||
        filters.assessmentStatus !== 'ALL' ||
        filters.paymentStatus !== 'ALL' ||
        filters.projectId !== 'ALL' ||
        filters.classification !== 'ALL'

    const handleReset = () => {
        onFilterChange({
            search: '',
            assessmentStatus: 'ALL',
            paymentStatus: 'ALL',
            projectId: 'ALL',
            classification: 'ALL',
        })
    }

    const classifications = [
        'ALL',
        'Dry Agricultural (Bagayat)',
        'Commercial / Semi-Urban',
        'Wet Irrigated (Chalka)',
        'Industrial / Non-Agricultural',
        'Dry Agricultural (Manavari)',
        'Barren / Desert Pasture (Banjar)',
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
                        placeholder="Search compensation ID, survey no, plot, landowner..."
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

                {/* Assessment Status (2.5 cols) */}
                <div className="lg:col-span-2.5">
                    <select
                        value={filters.assessmentStatus}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                assessmentStatus: e.target.value as CompensationAssessmentStatus | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Assessment Stages ({totalRecords})</option>
                        {Object.entries(COMPENSATION_ASSESSMENT_STATUS_META).map(([statusKey, meta]) => (
                            <option key={statusKey} value={statusKey}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Payment Status (2 cols) */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.paymentStatus}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                paymentStatus: e.target.value as CompensationPaymentStatus | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Payment Statuses</option>
                        {Object.entries(COMPENSATION_PAYMENT_STATUS_META).map(([statusKey, meta]) => (
                            <option key={statusKey} value={statusKey}>
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

                {/* Land Classification (1.5 cols) */}
                <div className="lg:col-span-1.5">
                    <select
                        value={filters.classification}
                        onChange={(e) => onFilterChange({ ...filters, classification: e.target.value })}
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        {classifications.map((c) => (
                            <option key={c} value={c}>
                                {c === 'ALL' ? 'Classification' : c.split(' ')[0]}
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

                    {filters.assessmentStatus !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Stage: {COMPENSATION_ASSESSMENT_STATUS_META[filters.assessmentStatus]?.label ?? filters.assessmentStatus}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, assessmentStatus: 'ALL' })}
                                className="hover:text-rust-700 cursor-pointer"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.paymentStatus !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Payment: {COMPENSATION_PAYMENT_STATUS_META[filters.paymentStatus]?.label ?? filters.paymentStatus}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, paymentStatus: 'ALL' })}
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

                    {filters.classification !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Land: {filters.classification}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, classification: 'ALL' })}
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
                    Showing <strong className="text-ink-900">{totalResults}</strong> of {totalRecords} Compensation Cases
                </div>
            </div>
        </div>
    )
}
