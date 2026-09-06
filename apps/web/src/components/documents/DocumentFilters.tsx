import { Search, X, RotateCcw, Filter } from 'lucide-react'
import type { VerificationStatus, DocumentCategory } from '@/types'
import { DOCUMENT_VERIFICATION_STATUS_META } from '@/constants/status'

export interface DocumentFilterValues {
    search: string
    status: VerificationStatus | 'ALL'
    category: DocumentCategory | 'ALL'
    projectId: string
    fileType: string
}

interface DocumentFiltersProps {
    filters: DocumentFilterValues
    onFilterChange: (filters: DocumentFilterValues) => void
    availableProjects: { id: string; code: string; title: string }[]
    totalResults: number
    totalDocuments: number
}

export function DocumentFilters({
    filters,
    onFilterChange,
    availableProjects,
    totalResults,
    totalDocuments,
}: DocumentFiltersProps) {
    const isFiltered =
        Boolean(filters.search) ||
        filters.status !== 'ALL' ||
        filters.category !== 'ALL' ||
        filters.projectId !== 'ALL' ||
        filters.fileType !== 'ALL'

    const handleReset = () => {
        onFilterChange({
            search: '',
            status: 'ALL',
            category: 'ALL',
            projectId: 'ALL',
            fileType: 'ALL',
        })
    }

    const categories: { label: string; value: DocumentCategory | 'ALL' }[] = [
        { label: 'All Document Types', value: 'ALL' },
        { label: 'Gazette Notifications (Sec. 11/19)', value: 'GAZETTE_NOTIFICATION' },
        { label: 'Title Deeds & Revenue Pahani', value: 'TITLE_DOCUMENT' },
        { label: 'Survey Maps & DGPS Vectors', value: 'SURVEY_RECORD' },
        { label: 'Statutory Award Orders', value: 'AWARD_DOCUMENT' },
        { label: 'Compensation & DBT Receipts', value: 'COMPENSATION_DOCUMENT' },
        { label: 'Possession Handover Certificates', value: 'POSSESSION_DOCUMENT' },
        { label: 'Section 15 Objections & Petitions', value: 'OBJECTION_FILING' },
        { label: 'Project Proposal & SIA Reports', value: 'PROJECT_PROPOSAL' },
        { label: 'R&R / Rehabilitation Plans', value: 'R_AND_R_DOCUMENT' },
        { label: 'Court Orders & Stays', value: 'COURT_ORDER' },
        { label: 'Other Statutory Records', value: 'OTHER' },
    ]

    const fileTypes = ['ALL', 'PDF', 'GEOJSON', 'XLSX', 'DWG', 'IMAGE', 'DOCX']

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
                        placeholder="Search document title, ref no, file name, survey no, or uploader..."
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
                                status: e.target.value as VerificationStatus | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Verification Statuses ({totalDocuments})</option>
                        {Object.entries(DOCUMENT_VERIFICATION_STATUS_META).map(([statusKey, meta]) => (
                            <option key={statusKey} value={statusKey}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Selector (3 cols) */}
                <div className="lg:col-span-3">
                    <select
                        value={filters.category}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                category: e.target.value as DocumentCategory | 'ALL',
                            })
                        }
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        {categories.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
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
                        <option value="ALL">All Schemes</option>
                        {availableProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.code}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Format / File Type (1 col) */}
                <div className="lg:col-span-1">
                    <select
                        value={filters.fileType}
                        onChange={(e) => onFilterChange({ ...filters, fileType: e.target.value })}
                        className="h-10 w-full rounded-md border border-ink-300 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        {fileTypes.map((ft) => (
                            <option key={ft} value={ft}>
                                {ft === 'ALL' ? 'Format' : ft}
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
                            <span>Status: {DOCUMENT_VERIFICATION_STATUS_META[filters.status]?.label ?? filters.status}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, status: 'ALL' })}
                                className="hover:text-rust-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {filters.category !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Type: {filters.category.replace('_', ' ')}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, category: 'ALL' })}
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

                    {filters.fileType !== 'ALL' && (
                        <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800 border border-ink-200">
                            <span>Format: {filters.fileType}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, fileType: 'ALL' })}
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
                    Showing <strong className="text-ink-900">{totalResults}</strong> of {totalDocuments} Statutory Records
                </div>
            </div>
        </div>
    )
}
