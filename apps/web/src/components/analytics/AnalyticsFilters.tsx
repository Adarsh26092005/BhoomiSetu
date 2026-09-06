import { Filter, RotateCcw, Building2, MapPin, Layers, IndianRupee, Flag } from 'lucide-react'
import type { AnalyticsFilterState, ProjectStatus } from '@/types'
import { PROJECT_STATUS_META } from '@/constants/status'
import { Button } from '@/components/ui/button'

interface AnalyticsFiltersProps {
    filters: AnalyticsFilterState
    onFilterChange: (filters: AnalyticsFilterState) => void
    onResetFilters: () => void
    availableProjects: Array<{ id: string; code: string; title: string }>
    availableStates: string[]
    availableDistricts: string[]
    activeCount: number
}

export function AnalyticsFilters({
    filters,
    onFilterChange,
    onResetFilters,
    availableProjects,
    availableStates,
    availableDistricts,
    activeCount,
}: AnalyticsFiltersProps) {
    const handleChange = (key: keyof AnalyticsFilterState, value: any) => {
        onFilterChange({ ...filters, [key]: value })
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-4 shadow-xs space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-2.5">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                        Multi-Sector Analytics Query Filter
                    </h3>
                </div>

                {activeCount > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-7 px-2.5 text-[11px] font-semibold text-rust-700 hover:bg-rust-50 border-rust-200 flex items-center gap-1 cursor-pointer"
                    >
                        <RotateCcw className="h-3 w-3" />
                        <span>Clear Filters ({activeCount})</span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* 1. Scheme */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-terracotta-600" />
                        <span>Scheme / Corridor</span>
                    </label>
                    <select
                        value={filters.projectId}
                        onChange={(e) => handleChange('projectId', e.target.value)}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none"
                    >
                        <option value="ALL">All National Schemes</option>
                        {availableProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.code} - {p.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. State Jurisdiction */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-ink-500" />
                        <span>State</span>
                    </label>
                    <select
                        value={filters.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none"
                    >
                        <option value="ALL">All States</option>
                        {availableStates.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* 3. District */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-ink-500" />
                        <span>District</span>
                    </label>
                    <select
                        value={filters.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none"
                    >
                        <option value="ALL">All Districts</option>
                        {availableDistricts.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* 4. Project Stage */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <Layers className="h-3 w-3 text-sky-600" />
                        <span>Lifecycle Stage</span>
                    </label>
                    <select
                        value={filters.projectStatus}
                        onChange={(e) => handleChange('projectStatus', e.target.value as ProjectStatus | 'ALL')}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none"
                    >
                        <option value="ALL">All Lifecycle Stages</option>
                        {Object.entries(PROJECT_STATUS_META).map(([k, m]) => (
                            <option key={k} value={k}>{m.label}</option>
                        ))}
                    </select>
                </div>

                {/* 5. Compensation Status */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <IndianRupee className="h-3 w-3 text-signal-700" />
                        <span>Compensation DBT</span>
                    </label>
                    <select
                        value={filters.compensationStatus}
                        onChange={(e) => handleChange('compensationStatus', e.target.value)}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none"
                    >
                        <option value="ALL">All DBT Statuses</option>
                        <option value="PAID">Disbursed (Paid)</option>
                        <option value="PENDING">Pending DBT Release</option>
                        <option value="UNDER_ASSESSMENT">Under Award Assessment</option>
                    </select>
                </div>

                {/* 6. Possession & R&R Status */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <Flag className="h-3 w-3 text-terracotta-600" />
                        <span>Physical Possession</span>
                    </label>
                    <select
                        value={filters.possessionStatus}
                        onChange={(e) => handleChange('possessionStatus', e.target.value)}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none"
                    >
                        <option value="ALL">All Possession Stages</option>
                        <option value="POSSESSION_TAKEN">Possession Taken</option>
                        <option value="POSSESSION_PENDING">Pending Handover</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
