import { RotateCcw, Filter, AlertTriangle, Layers, Building2, Tag, IndianRupee, Flag, HeartHandshake } from 'lucide-react'
import type { GisFilterState, ParcelStatus, LandType } from '@/types'
import { PARCEL_STATUS_META } from '@/constants/status'
import { Button } from '@/components/ui/button'

interface GisFiltersProps {
    filters: GisFilterState
    onFilterChange: (filters: GisFilterState) => void
    onResetFilters: () => void
    availableProjects: Array<{ id: string; code: string; title: string }>
    availableStates: string[]
    availableDistricts: string[]
    availableVillages: string[]
    activeCount: number
}

export function GisFilters({
    filters,
    onFilterChange,
    onResetFilters,
    availableProjects,
    availableStates,
    availableDistricts,
    availableVillages,
    activeCount,
}: GisFiltersProps) {
    const handleChange = (key: keyof GisFilterState, value: any) => {
        onFilterChange({ ...filters, [key]: value })
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-4 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-2.5">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                        Spatial Query Filters
                    </h3>
                </div>

                {activeCount > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-7 px-2 text-[11px] font-semibold text-rust-700 hover:bg-rust-50 border-rust-200 flex items-center gap-1 cursor-pointer"
                    >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reset ({activeCount})</span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {/* 1. Project / Scheme */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-terracotta-600" />
                        <span>Scheme / Corridor</span>
                    </label>
                    <select
                        value={filters.projectId}
                        onChange={(e) => handleChange('projectId', e.target.value)}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Acquisition Schemes</option>
                        {availableProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.code} - {p.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. State & District Jurisdiction */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <span>State & District</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                        <select
                            value={filters.state}
                            onChange={(e) => handleChange('state', e.target.value)}
                            className="h-8 w-full rounded-md border border-ink-200 bg-paper px-1.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                        >
                            <option value="ALL">All States</option>
                            {availableStates.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <select
                            value={filters.district}
                            onChange={(e) => handleChange('district', e.target.value)}
                            className="h-8 w-full rounded-md border border-ink-200 bg-paper px-1.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                        >
                            <option value="ALL">All Districts</option>
                            {availableDistricts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. Village */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <span>Revenue Village</span>
                    </label>
                    <select
                        value={filters.village}
                        onChange={(e) => handleChange('village', e.target.value)}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Villages</option>
                        {availableVillages.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>

                {/* 4. Cadastral Parcel Status */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <Layers className="h-3 w-3 text-sky-600" />
                        <span>Parcel Status</span>
                    </label>
                    <select
                        value={filters.parcelStatus}
                        onChange={(e) => handleChange('parcelStatus', e.target.value as ParcelStatus | 'ALL')}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Parcel Stages</option>
                        {Object.entries(PARCEL_STATUS_META).map(([k, m]) => (
                            <option key={k} value={k}>{m.label}</option>
                        ))}
                    </select>
                </div>

                {/* 5. Land Classification */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <Tag className="h-3 w-3 text-ink-500" />
                        <span>Land Type</span>
                    </label>
                    <select
                        value={filters.landType}
                        onChange={(e) => handleChange('landType', e.target.value as LandType | 'ALL')}
                        className="h-8 w-full rounded-md border border-ink-200 bg-paper px-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                        <option value="ALL">All Land Classifications</option>
                        <option value="AGRICULTURAL">Agricultural</option>
                        <option value="HOMESTEAD">Homestead / Residential</option>
                        <option value="COMMERCIAL">Commercial / Industrial</option>
                        <option value="FOREST">Forest / Tribal Land</option>
                        <option value="GOVERNMENT_WASTE">Government / Poramboke</option>
                    </select>
                </div>

                {/* 6. Compensation / Possession / R&R Quick Filters */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-700 flex items-center gap-1">
                        <IndianRupee className="h-3 w-3 text-signal-700" />
                        <span>Compensation & R&R</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                        <select
                            value={filters.compensationStatus}
                            onChange={(e) => handleChange('compensationStatus', e.target.value)}
                            className="h-8 w-full rounded-md border border-ink-200 bg-paper px-1 text-[11px] text-ink-900 focus:border-terracotta-500 focus:outline-none"
                        >
                            <option value="ALL">Award: Any</option>
                            <option value="PAID">Disbursed</option>
                            <option value="PENDING">Pending</option>
                        </select>
                        <select
                            value={filters.possessionStatus}
                            onChange={(e) => handleChange('possessionStatus', e.target.value)}
                            className="h-8 w-full rounded-md border border-ink-200 bg-paper px-1 text-[11px] text-ink-900 focus:border-terracotta-500 focus:outline-none"
                        >
                            <option value="ALL">Handover: Any</option>
                            <option value="POSSESSION_TAKEN">Taken</option>
                            <option value="POSSESSION_PENDING">Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Quick Status Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-100">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleChange('disputedOnly', !filters.disputedOnly)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer border ${
                            filters.disputedOnly
                                ? 'bg-rust-700 text-paper border-rust-800 shadow-xs'
                                : 'bg-ink-100 text-ink-700 border-ink-200 hover:bg-ink-200'
                        }`}
                    >
                        <AlertTriangle className="h-3 w-3" />
                        <span>Disputed Plots Only</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleChange('parcelStatus', filters.parcelStatus === 'COMPENSATION_PENDING' ? 'ALL' : 'COMPENSATION_PENDING')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer border ${
                            filters.parcelStatus === 'COMPENSATION_PENDING'
                                ? 'bg-amber-600 text-paper border-amber-700 shadow-xs'
                                : 'bg-ink-100 text-ink-700 border-ink-200 hover:bg-ink-200'
                        }`}
                    >
                        <IndianRupee className="h-3 w-3" />
                        <span>Compensation Pending</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleChange('possessionStatus', filters.possessionStatus === 'POSSESSION_PENDING' ? 'ALL' : 'POSSESSION_PENDING')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer border ${
                            filters.possessionStatus === 'POSSESSION_PENDING'
                                ? 'bg-indigo-600 text-paper border-indigo-700 shadow-xs'
                                : 'bg-ink-100 text-ink-700 border-ink-200 hover:bg-ink-200'
                        }`}
                    >
                        <Flag className="h-3 w-3" />
                        <span>Possession Pending</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleChange('randrStatus', filters.randrStatus === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer border ${
                            filters.randrStatus === 'IN_PROGRESS'
                                ? 'bg-pink-600 text-paper border-pink-700 shadow-xs'
                                : 'bg-ink-100 text-ink-700 border-ink-200 hover:bg-ink-200'
                        }`}
                    >
                        <HeartHandshake className="h-3 w-3" />
                        <span>R&R Active</span>
                    </button>
                </div>

                <span className="text-[11px] text-ink-500 font-mono">
                    Multi-criteria PostGIS layer query ready
                </span>
            </div>
        </div>
    )
}
