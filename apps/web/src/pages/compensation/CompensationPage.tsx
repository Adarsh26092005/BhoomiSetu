import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { IndianRupee, Loader2, CheckCircle2, Clock, Scale } from 'lucide-react'
import { useCompensationRecords } from '@/hooks/use-compensation'
import { useProjects } from '@/hooks/use-projects'
import { CompensationKpiSummary } from '@/components/compensation/CompensationKpiSummary'
import { CompensationQueueTabs, type CompensationQueueTab } from '@/components/compensation/CompensationQueueTabs'
import { CompensationFilters, type CompensationFilterValues } from '@/components/compensation/CompensationFilters'
import { CompensationTable } from '@/components/compensation/CompensationTable'
import { formatINR } from '@/lib/format'

export function CompensationPage() {
    const [searchParams] = useSearchParams()
    const queryProjectId = searchParams.get('projectId') ?? 'ALL'
    const queryParcelId = searchParams.get('parcelId') ?? ''

    const { data: records = [], isLoading } = useCompensationRecords()
    const { data: projects = [] } = useProjects()

    const [activeQueueTab, setActiveQueueTab] = React.useState<CompensationQueueTab>('ALL')

    const [filters, setFilters] = React.useState<CompensationFilterValues>({
        search: queryParcelId ? queryParcelId : '',
        assessmentStatus: 'ALL',
        paymentStatus: 'ALL',
        projectId: queryProjectId,
        classification: 'ALL',
    })

    const availableProjects = React.useMemo(() => {
        return projects.map((p) => ({ id: p.id, code: p.code, title: p.title }))
    }, [projects])

    // Filter records based on Queue Tab + Filters
    const filteredRecords = React.useMemo(() => {
        return records.filter((rec) => {
            // Tab filter
            if (activeQueueTab === 'UNDER_ASSESSMENT' && rec.assessmentStatus !== 'UNDER_ASSESSMENT' && rec.assessmentStatus !== 'ASSESSMENT_PENDING') {
                return false
            }
            if (activeQueueTab === 'AWARD_DECLARED' && rec.assessmentStatus !== 'AWARD_DECLARED' && rec.assessmentStatus !== 'AWARD_PENDING') {
                return false
            }
            if (activeQueueTab === 'DISBURSEMENT_PENDING' && rec.paymentStatus !== 'PENDING' && rec.assessmentStatus !== 'DISBURSEMENT_PENDING') {
                return false
            }
            if (activeQueueTab === 'PARTIALLY_DISBURSED' && rec.paymentStatus !== 'PARTIALLY_DISBURSED') {
                return false
            }
            if (activeQueueTab === 'ON_HOLD' && rec.paymentStatus !== 'ON_HOLD' && rec.assessmentStatus !== 'ON_HOLD') {
                return false
            }
            if (activeQueueTab === 'DISPUTED' && rec.paymentStatus !== 'DISPUTED' && rec.assessmentStatus !== 'DISPUTED') {
                return false
            }
            if (activeQueueTab === 'DISBURSED' && rec.paymentStatus !== 'DISBURSED') {
                return false
            }

            // Search query
            if (filters.search) {
                const q = filters.search.toLowerCase()
                const matchId = rec.id.toLowerCase().includes(q)
                const matchSurvey = rec.surveyNumber.toLowerCase().includes(q)
                const matchParcel = rec.parcelId.toLowerCase().includes(q)
                const matchProject = rec.projectName.toLowerCase().includes(q) || rec.projectCode.toLowerCase().includes(q)
                const matchLandowners = rec.landowners.some((lo) => lo.displayName.toLowerCase().includes(q))
                const matchAward = rec.awardId?.toLowerCase().includes(q)

                if (!matchId && !matchSurvey && !matchParcel && !matchProject && !matchLandowners && !matchAward) {
                    return false
                }
            }

            // Status filter
            if (filters.assessmentStatus !== 'ALL' && rec.assessmentStatus !== filters.assessmentStatus) {
                return false
            }
            if (filters.paymentStatus !== 'ALL' && rec.paymentStatus !== filters.paymentStatus) {
                return false
            }

            // Project filter
            if (filters.projectId !== 'ALL' && rec.projectId !== filters.projectId) {
                return false
            }

            // Classification filter
            if (filters.classification !== 'ALL' && rec.landClassification !== filters.classification) {
                return false
            }

            return true
        })
    }, [records, activeQueueTab, filters])

    const totalCount = records.length
    const totalPayable = records.reduce((sum, r) => sum + r.totalPayableAmountInr, 0)
    const totalDisbursed = records.reduce((sum, r) => sum + r.amountDisbursedInr, 0)

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Compensation & Award Registers...</p>
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
                                <IndianRupee className="h-4 w-4" />
                            </div>
                            <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-200 uppercase tracking-wider">
                                STATUTORY FINANCIAL ENTITLEMENT
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                            Compensation Assessment & Disbursement
                        </h1>
                        <p className="text-xs text-ink-500 max-w-2xl">
                            Monitor landowner entitlements, award assessments and compensation disbursement across acquisition projects.
                        </p>
                    </div>
                </div>

                {/* Scope Stats Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200">
                        <Scale className="h-3.5 w-3.5 text-ink-600" />
                        <span>Cases Tracked: {totalCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200 font-mono">
                        <IndianRupee className="h-3.5 w-3.5 text-ink-700" />
                        <span>Net Sanction: {formatINR(totalPayable, { compact: true })}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-semibold text-signal-900 border border-signal-200 font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5 text-signal-700" />
                        <span>DBT Disbursed: {formatINR(totalDisbursed, { compact: true })}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200 font-mono">
                        <Clock className="h-3.5 w-3.5 text-amber-700" />
                        <span>PFMS Direct Settlement Gateway: Ready</span>
                    </span>
                </div>
            </div>

            {/* 2. Compensation KPI Summary (6 Metrics) */}
            <CompensationKpiSummary records={records} />

            {/* 3. Quick Queue Tabs */}
            <CompensationQueueTabs
                activeTab={activeQueueTab}
                onTabChange={setActiveQueueTab}
                records={records}
            />

            {/* 4. Interactive Search & Filters */}
            <CompensationFilters
                filters={filters}
                onFilterChange={setFilters}
                availableProjects={availableProjects}
                totalResults={filteredRecords.length}
                totalRecords={totalCount}
            />

            {/* 5. Compensation Table */}
            <CompensationTable
                records={filteredRecords}
                onResetFilters={() => {
                    setActiveQueueTab('ALL')
                    setFilters({
                        search: '',
                        assessmentStatus: 'ALL',
                        paymentStatus: 'ALL',
                        projectId: 'ALL',
                        classification: 'ALL',
                    })
                }}
                isFiltered={
                    activeQueueTab !== 'ALL' ||
                    Boolean(filters.search) ||
                    filters.assessmentStatus !== 'ALL' ||
                    filters.paymentStatus !== 'ALL' ||
                    filters.projectId !== 'ALL' ||
                    filters.classification !== 'ALL'
                }
            />
        </div>
    )
}
