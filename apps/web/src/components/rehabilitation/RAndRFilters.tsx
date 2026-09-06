import { Search, RotateCcw, X, Filter } from 'lucide-react'
import type {
    RAndRStatus,
    RAndREligibilityStatus,
    RAndRBenefitStatus,
    RAndRBenefitType,
} from '@/types'
import {
    R_AND_R_STATUS_META,
    R_AND_R_ELIGIBILITY_STATUS_META,
    R_AND_R_BENEFIT_STATUS_META,
    R_AND_R_BENEFIT_TYPE_META,
} from '@/constants/status'
import { Button } from '@/components/ui/button'

export interface RAndRFilterValues {
    search: string
    rAndRStatus: RAndRStatus | 'ALL'
    eligibilityStatus: RAndREligibilityStatus | 'ALL'
    benefitStatus: RAndRBenefitStatus | 'ALL'
    benefitType: RAndRBenefitType | 'ALL'
    projectId: string
    district: string
    relocationRequired: 'ALL' | 'YES' | 'NO'
    assignedOfficer: string
}

interface RAndRFiltersProps {
    filters: RAndRFilterValues
    onFilterChange: (filters: RAndRFilterValues) => void
    availableProjects: { id: string; code: string; title: string }[]
    availableDistricts: string[]
    availableOfficers: string[]
    totalResults: number
    totalRecords: number
}

export function RAndRFilters({
    filters,
    onFilterChange,
    availableProjects,
    availableDistricts,
    availableOfficers,
    totalResults,
    totalRecords,
}: RAndRFiltersProps) {
    const handleSearchChange = (val: string) => {
        onFilterChange({ ...filters, search: val })
    }

    const handleSelectChange = (key: keyof RAndRFilterValues, val: string) => {
        onFilterChange({ ...filters, [key]: val })
    }

    const resetFilters = () => {
        onFilterChange({
            search: '',
            rAndRStatus: 'ALL',
            eligibilityStatus: 'ALL',
            benefitStatus: 'ALL',
            benefitType: 'ALL',
            projectId: 'ALL',
            district: 'ALL',
            relocationRequired: 'ALL',
            assignedOfficer: 'ALL',
        })
    }

    const hasActiveFilters =
        Boolean(filters.search) ||
        filters.rAndRStatus !== 'ALL' ||
        filters.eligibilityStatus !== 'ALL' ||
        filters.benefitStatus !== 'ALL' ||
        filters.benefitType !== 'ALL' ||
        filters.projectId !== 'ALL' ||
        filters.district !== 'ALL' ||
        filters.relocationRequired !== 'ALL' ||
        filters.assignedOfficer !== 'ALL'

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-4 shadow-xs space-y-3">
            {/* Top Row: Search Input + Status & Type Selectors */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
                {/* Search Bar */}
                <div className="relative sm:col-span-2 md:col-span-4 lg:col-span-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search Case ID, Household (HH-001), Plot, Village, Officer..."
                        className="h-9 w-full rounded-md border border-ink-200 bg-paper pl-9 pr-8 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => handleSearchChange('')}
                            className="absolute right-2.5 top-2.5 text-ink-400 hover:text-ink-700 cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Scheme Filter */}
                <div className="lg:col-span-3">
                    <select
                        value={filters.projectId}
                        onChange={(e) => handleSelectChange('projectId', e.target.value)}
                        className="h-9 w-full rounded-md border border-ink-200 bg-paper px-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Schemes</option>
                        {availableProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.code} - {p.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* R&R Status Filter */}
                <div className="lg:col-span-3">
                    <select
                        value={filters.rAndRStatus}
                        onChange={(e) => handleSelectChange('rAndRStatus', e.target.value)}
                        className="h-9 w-full rounded-md border border-ink-200 bg-paper px-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All R&R Stages</option>
                        {Object.entries(R_AND_R_STATUS_META).map(([key, meta]) => (
                            <option key={key} value={key}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Eligibility Filter */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.eligibilityStatus}
                        onChange={(e) => handleSelectChange('eligibilityStatus', e.target.value)}
                        className="h-9 w-full rounded-md border border-ink-200 bg-paper px-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Eligibility</option>
                        {Object.entries(R_AND_R_ELIGIBILITY_STATUS_META).map(([key, meta]) => (
                            <option key={key} value={key}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bottom Row: Benefit Type, Benefit Status, Relocation Required, District, Officer, Reset */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 pt-1">
                {/* Benefit Type */}
                <div className="lg:col-span-3">
                    <select
                        value={filters.benefitType}
                        onChange={(e) => handleSelectChange('benefitType', e.target.value)}
                        className="h-9 w-full rounded-md border border-ink-200 bg-paper px-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Benefit Categories</option>
                        {Object.entries(R_AND_R_BENEFIT_TYPE_META).map(([key, meta]) => (
                            <option key={key} value={key}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Benefit Status */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.benefitStatus}
                        onChange={(e) => handleSelectChange('benefitStatus', e.target.value)}
                        className="h-9 w-full rounded-md border border-ink-200 bg-paper px-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Benefit Statuses</option>
                        {Object.entries(R_AND_R_BENEFIT_STATUS_META).map(([key, meta]) => (
                            <option key={key} value={key}>
                                {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Relocation Required */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.relocationRequired}
                        onChange={(e) => handleSelectChange('relocationRequired', e.target.value)}
                        className="h-9 w-full rounded-md border border-ink-200 bg-paper px-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">Relocation: Any</option>
                        <option value="YES">Relocation Required (Displaced)</option>
                        <option value="NO">No Relocation (In-situ)</option>
                    </select>
                </div>

                {/* District Filter */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.district}
                        onChange={(e) => handleSelectChange('district', e.target.value)}
                        className="h-9 w-full rounded-md border border-ink-200 bg-paper px-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Districts</option>
                        {availableDistricts.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Assigned Officer */}
                <div className="lg:col-span-2">
                    <select
                        value={filters.assignedOfficer}
                        onChange={(e) => handleSelectChange('assignedOfficer', e.target.value)}
                        className="h-9 w-full rounded-md border border-ink-200 bg-paper px-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Officers</option>
                        {availableOfficers.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-center justify-end lg:col-span-1">
                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            className="h-9 w-full text-xs font-semibold text-rust-700 hover:bg-rust-50 hover:text-rust-800 border-rust-200 flex items-center justify-center gap-1 cursor-pointer"
                            title="Reset all filters"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Results count indicator */}
            <div className="flex items-center justify-between border-t border-ink-100 pt-2 text-[11px] text-ink-500">
                <span className="flex items-center gap-1">
                    <Filter className="h-3.5 w-3.5 text-ink-400" />
                    <span>
                        Showing <strong className="font-mono text-ink-900">{totalResults}</strong> of <strong className="font-mono text-ink-900">{totalRecords}</strong> R&R dockets
                    </span>
                </span>
                {hasActiveFilters && (
                    <span className="font-semibold text-terracotta-700">Filters Active</span>
                )}
            </div>
        </div>
    )
}
