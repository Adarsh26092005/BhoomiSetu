import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layers, Loader2, MapPin, Scale, ShieldCheck } from 'lucide-react'
import { useParcels } from '@/hooks/use-parcels'
import { useProjects } from '@/hooks/use-projects'
import { ParcelFilters, type ParcelFilterValues } from '@/components/parcels/ParcelFilters'
import { ParcelTable } from '@/components/parcels/ParcelTable'
import { ParcelKpiSummary } from '@/components/parcels/ParcelKpiSummary'
import { formatArea, formatINR } from '@/lib/format'

export function ParcelsPage() {
    const [searchParams] = useSearchParams()
    const queryProjectId = searchParams.get('projectId') ?? 'ALL'

    const { data: parcels = [], isLoading } = useParcels()
    const { data: projects = [] } = useProjects()

    const [filters, setFilters] = React.useState<ParcelFilterValues>({
        search: '',
        status: 'ALL',
        state: 'ALL',
        district: 'ALL',
        landType: 'ALL',
        projectId: queryProjectId,
    })

    // Extract dynamic dropdown options
    const availableStates = React.useMemo(() => {
        const set = new Set(parcels.map((p) => p.state))
        return Array.from(set).sort()
    }, [parcels])

    const availableDistricts = React.useMemo(() => {
        const set = new Set(parcels.map((p) => p.district))
        return Array.from(set).sort()
    }, [parcels])

    const availableProjects = React.useMemo(() => {
        return projects.map((p) => ({ id: p.id, code: p.code, title: p.title }))
    }, [projects])

    // Filter parcels client-side
    const filteredParcels = React.useMemo(() => {
        return parcels.filter((parcel) => {
            // Search query matching survey, khasra, village, district, state, or owner
            if (filters.search) {
                const q = filters.search.toLowerCase()
                const matchSurvey = parcel.surveyNumber.toLowerCase().includes(q)
                const matchKhasra = parcel.khasraNumber?.toLowerCase().includes(q)
                const matchVillage = parcel.village.toLowerCase().includes(q)
                const matchTehsil = parcel.tehsil?.toLowerCase().includes(q)
                const matchDistrict = parcel.district.toLowerCase().includes(q)
                const matchState = parcel.state.toLowerCase().includes(q)
                const matchOwner = parcel.owners.some((o) => o.fullName.toLowerCase().includes(q))
                const matchId = parcel.id.toLowerCase().includes(q)

                if (!matchSurvey && !matchKhasra && !matchVillage && !matchTehsil && !matchDistrict && !matchState && !matchOwner && !matchId) {
                    return false
                }
            }

            // Status filter
            if (filters.status !== 'ALL' && parcel.status !== filters.status) {
                return false
            }

            // Project filter
            if (filters.projectId !== 'ALL' && parcel.projectId !== filters.projectId) {
                return false
            }

            // State filter
            if (filters.state !== 'ALL' && parcel.state !== filters.state) {
                return false
            }

            // District filter
            if (filters.district !== 'ALL' && parcel.district !== filters.district) {
                return false
            }

            // Land classification filter
            if (filters.landType !== 'ALL' && parcel.landType !== filters.landType) {
                return false
            }

            return true
        })
    }, [parcels, filters])

    const totalCount = parcels.length
    const totalAreaHa = parcels.reduce((sum, p) => sum + p.areaHectares, 0)
    const totalComp = parcels.reduce((sum, p) => sum + p.compensationInr, 0)

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Cadastral Land Parcel Register...</p>
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
                                <Layers className="h-4 w-4" />
                            </div>
                            <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-200 uppercase tracking-wider">
                                CADASTRAL & REVENUE REGISTER
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                            Land Parcel Register
                        </h1>
                        <p className="text-xs text-ink-500 max-w-2xl">
                            National cadastral land parcel inventory, survey number verification, and landowner title registry.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span className="rounded-lg border border-ink-200 bg-ink-50/70 px-3 py-1.5 text-xs font-mono font-bold text-ink-900">
                            {totalCount} Digitized Plots
                        </span>
                    </div>
                </div>

                {/* Scope Stats Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200">
                        <Layers className="h-3.5 w-3.5 text-ink-600" />
                        <span>Enrolled Plots: {totalCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-terracotta-50 px-2.5 py-1 text-xs font-semibold text-terracotta-900 border border-terracotta-200">
                        <MapPin className="h-3.5 w-3.5 text-terracotta-700" />
                        <span>Survey Area: {formatArea(totalAreaHa)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-semibold text-signal-900 border border-signal-200">
                        <Scale className="h-3.5 w-3.5 text-signal-700" />
                        <span>Assessed Compensation: {formatINR(totalComp, { compact: true })}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-700 border border-ink-200">
                        <ShieldCheck className="h-3.5 w-3.5 text-signal-600" />
                        <span>PostGIS Spatial Vector Layer: Linked</span>
                    </span>
                </div>
            </div>

            {/* 2. Parcel KPI Summary (6 Metrics) */}
            <ParcelKpiSummary parcels={parcels} />

            {/* 3. Interactive Search & Filters */}
            <ParcelFilters
                filters={filters}
                onFilterChange={setFilters}
                availableStates={availableStates}
                availableDistricts={availableDistricts}
                availableProjects={availableProjects}
                totalResults={filteredParcels.length}
                totalParcels={totalCount}
            />

            {/* 4. Parcels Register Table */}
            <ParcelTable
                parcels={filteredParcels}
                onResetFilters={() =>
                    setFilters({
                        search: '',
                        status: 'ALL',
                        state: 'ALL',
                        district: 'ALL',
                        landType: 'ALL',
                        projectId: 'ALL',
                    })
                }
                isFiltered={
                    Boolean(filters.search) ||
                    filters.status !== 'ALL' ||
                    filters.state !== 'ALL' ||
                    filters.district !== 'ALL' ||
                    filters.landType !== 'ALL' ||
                    filters.projectId !== 'ALL'
                }
            />
        </div>
    )
}
