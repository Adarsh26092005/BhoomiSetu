import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeartHandshake, Loader2, Users, IndianRupee, Truck, CheckCheck } from 'lucide-react'
import { useRAndRCases } from '@/hooks/use-rehabilitation'
import { useProjects } from '@/hooks/use-projects'
import { RAndRKpiSummary } from '@/components/rehabilitation/RAndRKpiSummary'
import { RAndRQueueTabs, type RAndRQueueTab } from '@/components/rehabilitation/RAndRQueueTabs'
import { RAndRFilters, type RAndRFilterValues } from '@/components/rehabilitation/RAndRFilters'
import { RAndRTable } from '@/components/rehabilitation/RAndRTable'
import { formatINR } from '@/lib/format'

export function RehabilitationPage() {
    const [searchParams] = useSearchParams()
    const queryProjectId = searchParams.get('projectId') ?? 'ALL'
    const queryParcelId = searchParams.get('parcelId') ?? ''

    const { data: records = [], isLoading } = useRAndRCases()
    const { data: projects = [] } = useProjects()

    const [activeQueueTab, setActiveQueueTab] = React.useState<RAndRQueueTab>('ALL')

    const [filters, setFilters] = React.useState<RAndRFilterValues>({
        search: queryParcelId ? queryParcelId : '',
        rAndRStatus: 'ALL',
        eligibilityStatus: 'ALL',
        benefitStatus: 'ALL',
        benefitType: 'ALL',
        projectId: queryProjectId,
        district: 'ALL',
        relocationRequired: 'ALL',
        assignedOfficer: 'ALL',
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

    const availableOfficers = React.useMemo(() => {
        const set = new Set<string>()
        records.forEach((r) => {
            if (r.assignedOfficer) set.add(r.assignedOfficer)
        })
        return Array.from(set).sort()
    }, [records])

    // Filter records based on Queue Tab + Filters
    const filteredRecords = React.useMemo(() => {
        return records.filter((rec) => {
            // Queue Tab filter
            if (activeQueueTab === 'ASSESSMENT_PENDING' && rec.rAndRStatus !== 'ASSESSMENT_PENDING' && rec.eligibilityStatus !== 'REQUIRES_DOCUMENTATION') {
                return false
            }
            if (activeQueueTab === 'ELIGIBILITY_REVIEW' && rec.rAndRStatus !== 'ELIGIBILITY_REVIEW' && rec.eligibilityStatus !== 'UNDER_REVIEW') {
                return false
            }
            if (activeQueueTab === 'ENTITLEMENT_PENDING' && rec.rAndRStatus !== 'ENTITLEMENT_DEFINED' && rec.rAndRStatus !== 'PLAN_PREPARED') {
                return false
            }
            if (activeQueueTab === 'APPROVAL_PENDING' && rec.rAndRStatus !== 'APPROVAL_PENDING') {
                return false
            }
            if (activeQueueTab === 'BENEFIT_IN_PROGRESS' && rec.rAndRStatus !== 'BENEFIT_IN_PROGRESS' && rec.rAndRStatus !== 'BENEFIT_APPROVED') {
                return false
            }
            if (activeQueueTab === 'RELOCATION_IN_PROGRESS' && rec.relocationStatus !== 'IN_PROGRESS' && rec.rAndRStatus !== 'RELOCATION_IN_PROGRESS') {
                return false
            }
            if (activeQueueTab === 'POST_RELOCATION_VERIFICATION' && rec.rAndRStatus !== 'POST_RELOCATION_VERIFICATION' && rec.postRelocationVerificationStatus !== 'REQUIRES_REVIEW') {
                return false
            }
            if (activeQueueTab === 'COMPLETED' && rec.rAndRStatus !== 'COMPLETED') {
                return false
            }
            if (activeQueueTab === 'ON_HOLD' && rec.rAndRStatus !== 'ON_HOLD') {
                return false
            }
            if (activeQueueTab === 'DISPUTED' && rec.rAndRStatus !== 'DISPUTED' && rec.eligibilityStatus !== 'DISPUTED') {
                return false
            }

            // Search query
            if (filters.search) {
                const q = filters.search.toLowerCase()
                const matchId = rec.id.toLowerCase().includes(q)
                const matchHousehold = rec.household.householdReference.toLowerCase().includes(q)
                const matchSurvey = rec.surveyNumber.toLowerCase().includes(q)
                const matchParcel = rec.parcelId.toLowerCase().includes(q)
                const matchProject = rec.projectName.toLowerCase().includes(q) || rec.projectCode.toLowerCase().includes(q)
                const matchVillage = rec.village.toLowerCase().includes(q)
                const matchOfficer = rec.assignedOfficer.toLowerCase().includes(q)

                if (!matchId && !matchHousehold && !matchSurvey && !matchParcel && !matchProject && !matchVillage && !matchOfficer) {
                    return false
                }
            }

            // R&R Status filter
            if (filters.rAndRStatus !== 'ALL' && rec.rAndRStatus !== filters.rAndRStatus) {
                return false
            }

            // Eligibility filter
            if (filters.eligibilityStatus !== 'ALL' && rec.eligibilityStatus !== filters.eligibilityStatus) {
                return false
            }

            // Benefit Status filter
            if (filters.benefitStatus !== 'ALL') {
                const hasStatus = rec.benefits.some((b) => b.status === filters.benefitStatus)
                if (!hasStatus) return false
            }

            // Benefit Type filter
            if (filters.benefitType !== 'ALL') {
                const hasType = rec.benefits.some((b) => b.benefitType === filters.benefitType) ||
                    rec.entitlements.some((e) => e.entitlementType === filters.benefitType)
                if (!hasType) return false
            }

            // Project filter
            if (filters.projectId !== 'ALL' && rec.projectId !== filters.projectId) {
                return false
            }

            // District filter
            if (filters.district !== 'ALL' && rec.district !== filters.district) {
                return false
            }

            // Relocation Required filter
            if (filters.relocationRequired === 'YES' && !rec.relocationRequired) {
                return false
            }
            if (filters.relocationRequired === 'NO' && rec.relocationRequired) {
                return false
            }

            // Assigned Officer filter
            if (filters.assignedOfficer !== 'ALL' && rec.assignedOfficer !== filters.assignedOfficer) {
                return false
            }

            return true
        })
    }, [records, activeQueueTab, filters])

    const totalCount = records.length
    const totalFamilies = records.reduce((acc, r) => acc + r.affectedFamilyCount, 0)
    const totalDeliveredInr = records.reduce((acc, r) => acc + r.benefits.reduce((bAcc, b) => bAcc + b.deliveredValue, 0), 0)
    const completedCount = records.filter((r) => r.rAndRStatus === 'COMPLETED').length

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Statutory R&R Registers...</p>
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
                                <HeartHandshake className="h-4 w-4" />
                            </div>
                            <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-200 uppercase tracking-wider">
                                SECOND SCHEDULE RFCTLARR 2013
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                            Rehabilitation & Resettlement Management
                        </h1>
                        <p className="text-xs text-ink-500 max-w-2xl">
                            Monitor affected families, entitlements, assistance delivery, relocation progress and R&R completion.
                        </p>
                    </div>
                </div>

                {/* Scope Stats Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200 font-mono">
                        <HeartHandshake className="h-3.5 w-3.5 text-ink-600" />
                        <span>R&R Dockets: {totalCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200 font-mono">
                        <Users className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>Affected Families: {totalFamilies}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-semibold text-signal-900 border border-signal-200 font-mono">
                        <IndianRupee className="h-3.5 w-3.5 text-signal-700" />
                        <span>Assistance Disbursed: {formatINR(totalDeliveredInr, { compact: true })}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200 font-mono">
                        <Truck className="h-3.5 w-3.5 text-amber-700" />
                        <span>Relocation Tracking: Active</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-semibold text-signal-900 border border-signal-200 font-mono">
                        <CheckCheck className="h-3.5 w-3.5 text-signal-700" />
                        <span>Completed: {completedCount} ({totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%)</span>
                    </span>
                </div>
            </div>

            {/* 2. Executive KPI Summary */}
            <RAndRKpiSummary records={records} />

            {/* 3. Quick Queue Tabs */}
            <RAndRQueueTabs
                activeTab={activeQueueTab}
                onTabChange={setActiveQueueTab}
                records={records}
            />

            {/* 4. Interactive Search & Filters */}
            <RAndRFilters
                filters={filters}
                onFilterChange={setFilters}
                availableProjects={availableProjects}
                availableDistricts={availableDistricts}
                availableOfficers={availableOfficers}
                totalResults={filteredRecords.length}
                totalRecords={totalCount}
            />

            {/* 5. R&R Register Table */}
            <RAndRTable
                records={filteredRecords}
                onResetFilters={() => {
                    setActiveQueueTab('ALL')
                    setFilters({
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
                }}
                isFiltered={
                    activeQueueTab !== 'ALL' ||
                    Boolean(filters.search) ||
                    filters.rAndRStatus !== 'ALL' ||
                    filters.eligibilityStatus !== 'ALL' ||
                    filters.benefitStatus !== 'ALL' ||
                    filters.benefitType !== 'ALL' ||
                    filters.projectId !== 'ALL' ||
                    filters.district !== 'ALL' ||
                    filters.relocationRequired !== 'ALL' ||
                    filters.assignedOfficer !== 'ALL'
                }
            />
        </div>
    )
}
