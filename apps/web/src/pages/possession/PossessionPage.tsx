import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Flag, Loader2, CheckCircle2, Calendar, Award } from 'lucide-react'
import { usePossessionRecords } from '@/hooks/use-possession'
import { useProjects } from '@/hooks/use-projects'
import { PossessionKpiSummary } from '@/components/possession/PossessionKpiSummary'
import { PossessionQueueTabs, type PossessionQueueTab } from '@/components/possession/PossessionQueueTabs'
import { PossessionFilters, type PossessionFilterValues } from '@/components/possession/PossessionFilters'
import { PossessionTable } from '@/components/possession/PossessionTable'

export function PossessionPage() {
    const [searchParams] = useSearchParams()
    const queryProjectId = searchParams.get('projectId') ?? 'ALL'
    const queryParcelId = searchParams.get('parcelId') ?? ''

    const { data: records = [], isLoading } = usePossessionRecords()
    const { data: projects = [] } = useProjects()

    const [activeQueueTab, setActiveQueueTab] = React.useState<PossessionQueueTab>('ALL')

    const [filters, setFilters] = React.useState<PossessionFilterValues>({
        search: queryParcelId ? queryParcelId : '',
        possessionStatus: 'ALL',
        possessionType: 'ALL',
        projectId: queryProjectId,
        district: 'ALL',
        readiness: 'ALL',
    })

    const availableProjects = React.useMemo(() => {
        return projects.map((p) => ({ id: p.id, code: p.code, title: p.title }))
    }, [projects])

    const availableDistricts = React.useMemo(() => {
        const set = new Set<string>()
        records.forEach((r) => {
            if (r.district) set.add(r.district)
        })
        return Array.from(set).sort()
    }, [records])

    // Filter records based on Queue Tab + Filters
    const filteredRecords = React.useMemo(() => {
        return records.filter((rec) => {
            // Queue Tab filter
            if (activeQueueTab === 'READY' && rec.possessionStatus !== 'READY_FOR_POSSESSION') {
                return false
            }
            if (activeQueueTab === 'NOTICE' && rec.possessionStatus !== 'NOTICE_PREPARED' && rec.possessionStatus !== 'NOTICE_ISSUED') {
                return false
            }
            if (activeQueueTab === 'SCHEDULED' && rec.possessionStatus !== 'SCHEDULED') {
                return false
            }
            if (activeQueueTab === 'SITE_VERIFICATION' && rec.possessionStatus !== 'SITE_VERIFICATION') {
                return false
            }
            if (activeQueueTab === 'POSSESSION_PENDING' && rec.possessionStatus !== 'POSSESSION_PENDING') {
                return false
            }
            if (activeQueueTab === 'CERT_PENDING' && rec.possessionStatus !== 'CERTIFICATE_PENDING' && rec.possessionStatus !== 'POSSESSION_TAKEN') {
                return false
            }
            if (activeQueueTab === 'ON_HOLD' && rec.possessionStatus !== 'ON_HOLD') {
                return false
            }
            if (activeQueueTab === 'DISPUTED' && rec.possessionStatus !== 'DISPUTED') {
                return false
            }
            if (activeQueueTab === 'COMPLETED' && rec.possessionStatus !== 'CERTIFICATE_ISSUED') {
                return false
            }

            // Search query
            if (filters.search) {
                const q = filters.search.toLowerCase()
                const matchId = rec.id.toLowerCase().includes(q)
                const matchSurvey = rec.surveyNumber.toLowerCase().includes(q)
                const matchParcel = rec.parcelId.toLowerCase().includes(q)
                const matchProject = rec.projectName.toLowerCase().includes(q) || rec.projectCode.toLowerCase().includes(q)
                const matchVillage = rec.village.toLowerCase().includes(q)
                const matchOfficer = rec.assignedOfficer.toLowerCase().includes(q)
                const matchNotice = rec.noticeReference?.toLowerCase().includes(q)

                if (!matchId && !matchSurvey && !matchParcel && !matchProject && !matchVillage && !matchOfficer && !matchNotice) {
                    return false
                }
            }

            // Possession Status filter
            if (filters.possessionStatus !== 'ALL' && rec.possessionStatus !== filters.possessionStatus) {
                return false
            }

            // Possession Type filter
            if (filters.possessionType !== 'ALL' && rec.possessionType !== filters.possessionType) {
                return false
            }

            // Project filter
            if (filters.projectId !== 'ALL' && rec.projectId !== filters.projectId) {
                return false
            }

            // District filter
            if (filters.district !== 'ALL' && rec.district !== filters.district) {
                return false
            }

            // Readiness filter
            if (filters.readiness !== 'ALL' && rec.readinessStatus !== filters.readiness) {
                return false
            }

            return true
        })
    }, [records, activeQueueTab, filters])

    const totalCount = records.length
    const takenCount = records.filter((r) => r.possessionStatus === 'POSSESSION_TAKEN' || r.possessionStatus === 'CERTIFICATE_PENDING' || r.possessionStatus === 'CERTIFICATE_ISSUED').length
    const certCount = records.filter((r) => r.possessionStatus === 'CERTIFICATE_ISSUED').length

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Statutory Possession Registers...</p>
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
                                <Flag className="h-4 w-4" />
                            </div>
                            <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-200 uppercase tracking-wider">
                                STATUTORY LAND POSSESSION (SEC 38)
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                            Possession Management
                        </h1>
                        <p className="text-xs text-ink-500 max-w-2xl">
                            Track physical possession of acquired land parcels, site verification, possession certificates and pending handovers.
                        </p>
                    </div>
                </div>

                {/* Scope Stats Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200 font-mono">
                        <Flag className="h-3.5 w-3.5 text-ink-600" />
                        <span>Cases Tracked: {totalCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-semibold text-signal-900 border border-signal-200 font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5 text-signal-700" />
                        <span>Possession Secured: {takenCount} ({Math.round((takenCount / (totalCount || 1)) * 100)}%)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200 font-mono">
                        <Award className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>Form 22 Handover Certificates: {certCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200 font-mono">
                        <Calendar className="h-3.5 w-3.5 text-amber-700" />
                        <span>DGPS Demarcation Engine: Active</span>
                    </span>
                </div>
            </div>

            {/* 2. Executive KPI Summary */}
            <PossessionKpiSummary records={records} />

            {/* 3. Quick Queue Tabs */}
            <PossessionQueueTabs
                activeTab={activeQueueTab}
                onTabChange={setActiveQueueTab}
                records={records}
            />

            {/* 4. Interactive Search & Filters */}
            <PossessionFilters
                filters={filters}
                onFilterChange={setFilters}
                availableProjects={availableProjects}
                availableDistricts={availableDistricts}
                totalResults={filteredRecords.length}
                totalRecords={totalCount}
            />

            {/* 5. Possession Table */}
            <PossessionTable
                records={filteredRecords}
                onResetFilters={() => {
                    setActiveQueueTab('ALL')
                    setFilters({
                        search: '',
                        possessionStatus: 'ALL',
                        possessionType: 'ALL',
                        projectId: 'ALL',
                        district: 'ALL',
                        readiness: 'ALL',
                    })
                }}
                isFiltered={
                    activeQueueTab !== 'ALL' ||
                    Boolean(filters.search) ||
                    filters.possessionStatus !== 'ALL' ||
                    filters.possessionType !== 'ALL' ||
                    filters.projectId !== 'ALL' ||
                    filters.district !== 'ALL' ||
                    filters.readiness !== 'ALL'
                }
            />
        </div>
    )
}
