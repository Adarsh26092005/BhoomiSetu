import { MOCK_PROJECTS } from '@/mock/projects'
import { MOCK_PARCELS } from '@/mock/parcels'
import { MOCK_DOCUMENTS } from '@/mock/documents'
import { MOCK_WORKFLOW_TASKS } from '@/mock/workflow'
import { MOCK_COMPENSATION_RECORDS } from '@/mock/compensation'
import { MOCK_POSSESSION_RECORDS } from '@/mock/possession'
import { MOCK_R_AND_R_CASES } from '@/mock/rehabilitation'
import { PROJECT_STATUS_META, PARCEL_STATUS_META } from '@/constants/status'
import { ROUTES } from '@/constants/routes'
import { formatArea, formatINR } from '@/lib/format'
import type {
    AcquisitionProject,
    LandParcel,
    ProjectDocument,
    WorkflowTask,
    CompensationRecord,
    PossessionRecord,
    RAndRCase,
    LandType,
} from '@/types'
import type {
    AnalyticsFilterState,
    AnalyticsPeriod,
    ExecutiveKpiMetrics,
    AcquisitionTrendPoint,
    ProjectPerformanceMetric,
    LifecycleStageMetric,
    WorkflowAnalytics,
    DocumentAnalytics,
    CompensationAnalytics,
    PossessionAnalytics,
    RAndRAnalytics,
    ParcelAnalytics,
    StateDistrictAnalytics,
    AnalyticsInsight,
    AttentionItem,
    GeneratedReport,
    ReportType,
    ReportPreviewRow,
    NamedCountMetric,
    AcquisitionBreakdown,
} from '@/types/analytics'

const LAND_TYPE_LABELS: Record<LandType, string> = {
    AGRICULTURAL: 'Agricultural',
    HOMESTEAD: 'Homestead / Residential',
    FOREST: 'Forest / Tribal Land',
    COMMERCIAL: 'Commercial',
    GOVERNMENT_WASTE: 'Government Waste',
}

const LIFECYCLE_STAGES: Array<{ id: string; label: string; statuses: AcquisitionProject['status'][] }> = [
    { id: 'PROPOSAL', label: 'Proposal', statuses: ['DRAFT', 'SUBMITTED'] },
    { id: 'LAND_IDENTIFICATION', label: 'Land Identification', statuses: ['UNDER_SCRUTINY'] },
    { id: 'PARCEL_LANDOWNER', label: 'Parcel & Landowner', statuses: [] },
    { id: 'DOCUMENTS', label: 'Documents', statuses: ['DOCUMENT_VERIFICATION'] },
    { id: 'VERIFICATION', label: 'Verification', statuses: [] },
    { id: 'APPROVAL', label: 'Approval', statuses: ['DISTRICT_APPROVAL', 'STATE_APPROVAL', 'CENTRAL_APPROVAL'] },
    { id: 'NOTIFICATION', label: 'Notification', statuses: ['NOTIFICATION_ISSUED'] },
    { id: 'AWARD', label: 'Award', statuses: ['AWARD_DECLARED'] },
    { id: 'COMPENSATION', label: 'Compensation', statuses: ['COMPENSATION_ASSESSED', 'COMPENSATION_DISBURSED'] },
    { id: 'POSSESSION', label: 'Possession', statuses: ['POSSESSION_PENDING', 'POSSESSION_COMPLETED'] },
    { id: 'R_AND_R', label: 'R&R', statuses: ['R_AND_R_IN_PROGRESS'] },
    { id: 'COMPLETION', label: 'Completion', statuses: ['COMPLETED'] },
]

const REFERENCE_NOW = new Date('2026-09-04T00:00:00+05:30')

function daysBetween(from: string, to: Date = REFERENCE_NOW): number {
    const start = new Date(from)
    if (Number.isNaN(start.getTime())) return 0
    return Math.max(0, Math.round((to.getTime() - start.getTime()) / 86_400_000))
}

function periodStart(period: AnalyticsPeriod | undefined): Date | null {
    if (!period || period === 'ALL') return null
    if (period === 'FY') return new Date('2025-04-01T00:00:00+05:30')
    const start = new Date(REFERENCE_NOW)
    if (period === '30D') start.setDate(start.getDate() - 30)
    if (period === '90D') start.setDate(start.getDate() - 90)
    if (period === '6M') start.setMonth(start.getMonth() - 6)
    if (period === '12M') start.setFullYear(start.getFullYear() - 1)
    return start
}

function inPeriod(dateValue: string | undefined, period: AnalyticsPeriod | undefined): boolean {
    if (!period || period === 'ALL') return true
    if (!dateValue) return true
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return true
    const start = periodStart(period)
    if (!start) return true
    if (period === 'FY') {
        const end = new Date('2026-03-31T23:59:59+05:30')
        return date >= start && date <= end
    }
    return date >= start && date <= REFERENCE_NOW
}

function isParcelAcquired(status: LandParcel['status']): boolean {
    return status === 'POSSESSION_TAKEN'
}

function isParcelAcquisitionProgressed(status: LandParcel['status']): boolean {
    return status === 'POSSESSION_TAKEN' || status === 'COMPENSATION_PAID'
}

function pct(numerator: number, denominator: number): number {
    if (denominator <= 0) return 0
    return Math.round((numerator / denominator) * 100)
}

function roundHa(value: number): number {
    return Number(value.toFixed(2))
}

function projectCodeOf(projectId: string): string {
    return MOCK_PROJECTS.find((p) => p.id === projectId)?.code ?? projectId
}

interface AnalyticsScope {
    projects: AcquisitionProject[]
    parcels: LandParcel[]
    documents: ProjectDocument[]
    tasks: WorkflowTask[]
    compensation: CompensationRecord[]
    possession: PossessionRecord[]
    randr: RAndRCase[]
    projectIds: Set<string>
}

function getScope(filters?: Partial<AnalyticsFilterState>): AnalyticsScope {
    const period = filters?.period

    let projects = MOCK_PROJECTS.filter((p) => {
        if (filters?.projectId && filters.projectId !== 'ALL' && p.id !== filters.projectId) return false
        if (filters?.state && filters.state !== 'ALL' && p.state !== filters.state) return false
        if (filters?.district && filters.district !== 'ALL' && !p.districts.includes(filters.district)) return false
        if (filters?.projectStatus && filters.projectStatus !== 'ALL' && p.status !== filters.projectStatus) return false
        if (!inPeriod(p.notifiedOn, period)) return false
        return true
    })

    if (filters?.landType && filters.landType !== 'ALL') {
        const matchingProjectIds = new Set(
            MOCK_PARCELS.filter((pcl) => pcl.landType === filters.landType).map((pcl) => pcl.projectId),
        )
        projects = projects.filter((p) => matchingProjectIds.has(p.id))
    }

    const projectIds = new Set(projects.map((p) => p.id))

    const parcels = MOCK_PARCELS.filter((pcl) => {
        if (!projectIds.has(pcl.projectId)) return false
        if (filters?.state && filters.state !== 'ALL' && pcl.state !== filters.state) return false
        if (filters?.district && filters.district !== 'ALL' && pcl.district !== filters.district) return false
        if (filters?.parcelStatus && filters.parcelStatus !== 'ALL' && pcl.status !== filters.parcelStatus) return false
        if (filters?.landType && filters.landType !== 'ALL' && pcl.landType !== filters.landType) return false
        if (!inPeriod(pcl.lastUpdated, period)) return false
        return true
    })

    const parcelIds = new Set(parcels.map((p) => p.id))

    const documents = MOCK_DOCUMENTS.filter((d) => {
        if (!projectIds.has(d.projectId)) return false
        if (d.parcelId && filters?.landType && filters.landType !== 'ALL' && !parcelIds.has(d.parcelId)) return false
        if (!inPeriod(d.uploadedAt, period)) return false
        return true
    })

    const tasks = MOCK_WORKFLOW_TASKS.filter((t) => {
        if (!projectIds.has(t.projectId)) return false
        if (!inPeriod(t.createdAt, period)) return false
        return true
    })

    const compensation = MOCK_COMPENSATION_RECORDS.filter((c) => {
        if (!projectIds.has(c.projectId)) return false
        if (filters?.landType && filters.landType !== 'ALL' && !parcelIds.has(c.parcelId)) return false
        if (filters?.compensationStatus && filters.compensationStatus !== 'ALL') {
            if (filters.compensationStatus === 'PAID' && c.paymentStatus !== 'DISBURSED') return false
            if (filters.compensationStatus === 'PENDING' && c.paymentStatus !== 'PENDING' && c.paymentStatus !== 'PROCESSING') {
                return false
            }
            if (
                filters.compensationStatus === 'UNDER_ASSESSMENT' &&
                c.assessmentStatus !== 'UNDER_ASSESSMENT' &&
                c.assessmentStatus !== 'ASSESSMENT_PENDING'
            ) {
                return false
            }
        }
        if (!inPeriod(c.lastUpdatedAt || c.assessmentDate, period)) return false
        return true
    })

    const possession = MOCK_POSSESSION_RECORDS.filter((pos) => {
        if (!projectIds.has(pos.projectId)) return false
        if (filters?.state && filters.state !== 'ALL' && pos.state !== filters.state) return false
        if (filters?.district && filters.district !== 'ALL' && pos.district !== filters.district) return false
        if (filters?.landType && filters.landType !== 'ALL' && !parcelIds.has(pos.parcelId)) return false
        if (filters?.possessionStatus && filters.possessionStatus !== 'ALL') {
            if (filters.possessionStatus === 'POSSESSION_TAKEN' && pos.possessionStatus !== 'POSSESSION_TAKEN' && pos.possessionStatus !== 'CERTIFICATE_ISSUED') {
                return false
            }
            if (
                filters.possessionStatus === 'POSSESSION_PENDING' &&
                (pos.possessionStatus === 'POSSESSION_TAKEN' || pos.possessionStatus === 'CERTIFICATE_ISSUED')
            ) {
                return false
            }
        }
        if (!inPeriod(pos.createdAt, period)) return false
        return true
    })

    const randr = MOCK_R_AND_R_CASES.filter((r) => {
        if (!projectIds.has(r.projectId)) return false
        if (filters?.state && filters.state !== 'ALL' && r.state !== filters.state) return false
        if (filters?.district && filters.district !== 'ALL' && r.district !== filters.district) return false
        if (filters?.landType && filters.landType !== 'ALL' && !parcelIds.has(r.parcelId)) return false
        if (filters?.randrStatus && filters.randrStatus !== 'ALL') {
            if (filters.randrStatus === 'COMPLETED' && r.rAndRStatus !== 'COMPLETED') return false
            if (
                filters.randrStatus === 'IN_PROGRESS' &&
                r.rAndRStatus !== 'BENEFIT_IN_PROGRESS' &&
                r.rAndRStatus !== 'RELOCATION_IN_PROGRESS'
            ) {
                return false
            }
            if (filters.randrStatus === 'DISPUTED' && r.rAndRStatus !== 'DISPUTED' && r.rAndRStatus !== 'ON_HOLD') return false
        }
        if (!inPeriod(r.createdAt, period)) return false
        return true
    })

    return { projects, parcels, documents, tasks, compensation, possession, randr, projectIds }
}

function countMap<T>(items: T[], keyFn: (item: T) => string): Array<{ key: string; count: number }> {
    const map: Record<string, number> = {}
    items.forEach((item) => {
        const key = keyFn(item)
        map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).map(([key, count]) => ({ key, count }))
}

function currentStageDays(project: AcquisitionProject): number | null {
    const current = project.timeline.find((t) => t.stage === project.status)
    const date = current?.date
    if (!date) return null
    return daysBetween(date)
}

function formatFilterSummary(filters?: Partial<AnalyticsFilterState>): string {
    const parts = [
        `Period: ${filters?.period ?? '12M'}`,
        `State: ${filters?.state && filters.state !== 'ALL' ? filters.state : 'All'}`,
        `District: ${filters?.district && filters.district !== 'ALL' ? filters.district : 'All'}`,
        `Project: ${filters?.projectId && filters.projectId !== 'ALL' ? projectCodeOf(filters.projectId) : 'All'}`,
        `Status: ${filters?.projectStatus && filters.projectStatus !== 'ALL' ? PROJECT_STATUS_META[filters.projectStatus].label : 'All'}`,
        `Land: ${filters?.landType && filters.landType !== 'ALL' ? LAND_TYPE_LABELS[filters.landType] : 'All'}`,
    ]
    return parts.join(' · ')
}

let reportSequence = 2

const REPORT_TITLES: Record<ReportType, string> = {
    EXECUTIVE_SUMMARY: 'National Land Acquisition Executive Intelligence Brief',
    PROJECT_PERFORMANCE: 'Scheme Milestone Delivery & Lifecycle Throughput Audit',
    LAND_ACQUISITION_STATUS: 'Cadastral Survey & Area Handover Register',
    COMPENSATION_FINANCIAL: 'Compensation Award & Disbursement Ledger',
    POSSESSION_HANDOVER: 'Physical Possession & Boundary Handover Report',
    R_AND_R_RESETTLEMENT: 'Rehabilitation & Resettlement Audit',
    WORKFLOW_SLA_AUDIT: 'Administrative Task SLA & Workflow Compliance',
    DISTRICT_JURISDICTION: 'District Revenue Jurisdiction Comparative Performance',
}

function buildSeedReports(): GeneratedReport[] {
    return [
        {
            id: 'RPT-2026-001',
            reportType: 'EXECUTIVE_SUMMARY',
            title: REPORT_TITLES.EXECUTIVE_SUMMARY,
            generatedAt: '2026-09-02T10:30:00+05:30',
            generatedBy: 'Director (Monitoring & Evaluation, NLAMS)',
            reportingPeriod: '12M',
            scopeDescription: 'National scope — all schemes',
            filterSummary: 'Period: 12M · State: All · District: All · Project: All · Status: All · Land: All',
            kpiSnapshot: {},
            summaryText: 'Baseline executive brief retained from the monitoring desk. Figures in newly generated reports are reconciled to the current mock registers.',
            columns: ['Metric', 'Value'],
            dataRows: [],
            dataRowsCount: 0,
            status: 'ARCHIVED',
        },
        {
            id: 'RPT-2026-002',
            reportType: 'COMPENSATION_FINANCIAL',
            title: REPORT_TITLES.COMPENSATION_FINANCIAL,
            generatedAt: '2026-08-28T16:45:00+05:30',
            generatedBy: 'Finance Officer, NLAMS',
            reportingPeriod: 'FY',
            scopeDescription: 'National compensation ledger',
            filterSummary: 'Period: FY · State: All · District: All · Project: All · Status: All · Land: All',
            kpiSnapshot: {},
            summaryText: 'Archived compensation digest. Open Generate Report to refresh against the live mock ledger.',
            columns: ['Metric', 'Value'],
            dataRows: [],
            dataRowsCount: 0,
            status: 'ARCHIVED',
        },
    ]
}

const REPORT_HISTORY: GeneratedReport[] = buildSeedReports()

export const analyticsService = {
    async getExecutiveSummary(filters?: Partial<AnalyticsFilterState>): Promise<ExecutiveKpiMetrics> {
        const { projects, parcels, compensation, possession, randr, tasks } = getScope(filters)

        const totalProposedAreaHectares = roundHa(projects.reduce((sum, p) => sum + p.totalAreaHectares, 0))
        const cadastralSampleAreaHectares = roundHa(parcels.reduce((sum, p) => sum + p.areaHectares, 0))
        const totalAcquiredAreaHectares = roundHa(
            parcels.filter((p) => isParcelAcquisitionProgressed(p.status)).reduce((sum, p) => sum + p.areaHectares, 0),
        )
        const acquisitionProgressPercentage = pct(totalAcquiredAreaHectares, cadastralSampleAreaHectares)

        const parcelsAcquired = parcels.filter((p) => isParcelAcquired(p.status)).length

        const totalCompensationAssessedInr = compensation.reduce((sum, c) => sum + c.totalAssessedAmountInr, 0)
        const totalCompensationPayableInr = compensation.reduce((sum, c) => sum + c.totalPayableAmountInr, 0)
        const totalCompensationDisbursedInr = compensation.reduce((sum, c) => sum + c.amountDisbursedInr, 0)
        const totalCompensationPendingInr = compensation.reduce((sum, c) => sum + c.amountPendingInr, 0)

        const possessionCompletedParcels = possession.filter(
            (p) => p.possessionStatus === 'POSSESSION_TAKEN' || p.possessionStatus === 'CERTIFICATE_ISSUED',
        ).length
        const possessionPendingParcels = Math.max(0, possession.length - possessionCompletedParcels)

        const randrCompletedCases = randr.filter((r) => r.rAndRStatus === 'COMPLETED').length
        const randrPendingCases = randr.filter((r) => r.rAndRStatus !== 'COMPLETED').length

        const delayed = projects.filter((p) => {
            const target = new Date(p.targetCompletionOn)
            return p.status !== 'COMPLETED' && !Number.isNaN(target.getTime()) && target < REFERENCE_NOW
        }).length

        const onHoldOrRejected = projects.filter((p) => p.status === 'ON_HOLD' || p.status === 'REJECTED').length
        const lowVelocity = projects.filter((p) => {
            const sample = parcels.filter((pcl) => pcl.projectId === p.id)
            if (sample.length === 0) return false
            const acquired = sample.filter((pcl) => isParcelAcquisitionProgressed(pcl.status)).reduce((s, pcl) => s + pcl.areaHectares, 0)
            const total = sample.reduce((s, pcl) => s + pcl.areaHectares, 0)
            return pct(acquired, total) < 35
        }).length

        return {
            totalProjects: projects.length,
            totalProposedAreaHectares,
            totalAcquiredAreaHectares,
            acquisitionProgressPercentage,
            cadastralSampleAreaHectares,
            totalParcels: parcels.length,
            parcelsAcquired,
            totalCompensationAssessedInr,
            totalCompensationPayableInr,
            totalCompensationDisbursedInr,
            totalCompensationPendingInr,
            disbursementPercentage: pct(totalCompensationDisbursedInr, totalCompensationPayableInr || totalCompensationAssessedInr),
            possessionCompletedParcels,
            possessionPendingParcels,
            possessionCompletedPercentage: pct(possessionCompletedParcels, possession.length),
            randrActiveCases: randrPendingCases,
            randrCompletedCases,
            randrPendingCases,
            projectsRequiringAttention: onHoldOrRejected + delayed + lowVelocity,
            pendingWorkflowTasks: tasks.filter((w) => w.status === 'PENDING' || w.status === 'IN_REVIEW').length,
            slaBreachedTasks: tasks.filter((w) => w.slaStatus === 'OVERDUE').length,
        }
    },

    async getAcquisitionTrend(filters?: Partial<AnalyticsFilterState>): Promise<AcquisitionTrendPoint[]> {
        const { projects, parcels } = getScope({ ...filters, period: 'ALL' })
        const sorted = [...projects].sort((a, b) => a.notifiedOn.localeCompare(b.notifiedOn))

        let cumulativeProposed = 0
        let cumulativeAcquired = 0

        return sorted.map((project) => {
            const sample = parcels.filter((p) => p.projectId === project.id)
            const acquired = sample.filter((p) => isParcelAcquisitionProgressed(p.status)).reduce((sum, p) => sum + p.areaHectares, 0)
            cumulativeProposed += project.totalAreaHectares
            cumulativeAcquired += acquired
            return {
                date: project.notifiedOn,
                periodLabel: `${project.code} (${new Date(project.notifiedOn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})`,
                proposedAreaHectares: roundHa(project.totalAreaHectares),
                acquiredAreaHectares: roundHa(acquired),
                cumulativeProposedHectares: roundHa(cumulativeProposed),
                cumulativeAcquiredHectares: roundHa(cumulativeAcquired),
                schemeCount: 1,
            }
        })
    },

    async getAcquisitionBreakdown(filters?: Partial<AnalyticsFilterState>): Promise<AcquisitionBreakdown> {
        const { projects, parcels } = getScope(filters)
        const proposedAreaHectares = roundHa(parcels.reduce((sum, p) => sum + p.areaHectares, 0))
        const acquiredAreaHectares = roundHa(
            parcels.filter((p) => isParcelAcquisitionProgressed(p.status)).reduce((sum, p) => sum + p.areaHectares, 0),
        )

        const rollup = (items: LandParcel[], keyFn: (p: LandParcel) => string, labelFn: (key: string, sample: LandParcel) => string): NamedCountMetric[] => {
            const groups: Record<string, LandParcel[]> = {}
            items.forEach((p) => {
                const key = keyFn(p)
                if (!groups[key]) groups[key] = []
                groups[key].push(p)
            })
            return Object.entries(groups).map(([key, group]) => {
                const acquired = group.filter((p) => isParcelAcquisitionProgressed(p.status)).reduce((s, p) => s + p.areaHectares, 0)
                const area = group.reduce((s, p) => s + p.areaHectares, 0)
                return {
                    key,
                    label: labelFn(key, group[0]),
                    count: group.length,
                    areaHectares: roundHa(area),
                    amountInr: roundHa(acquired),
                }
            })
        }

        const byProject = projects.map((project) => {
            const sample = parcels.filter((p) => p.projectId === project.id)
            const area = sample.reduce((s, p) => s + p.areaHectares, 0)
            const acquired = sample.filter((p) => isParcelAcquisitionProgressed(p.status)).reduce((s, p) => s + p.areaHectares, 0)
            return {
                key: project.id,
                label: project.code,
                count: sample.length,
                areaHectares: roundHa(area),
                amountInr: roundHa(acquired),
            }
        })

        return {
            proposedVsAcquired: {
                proposedAreaHectares,
                acquiredAreaHectares,
                pendingAreaHectares: roundHa(Math.max(0, proposedAreaHectares - acquiredAreaHectares)),
                progressPercentage: pct(acquiredAreaHectares, proposedAreaHectares),
            },
            byState: rollup(parcels, (p) => p.state, (key) => key),
            byDistrict: rollup(parcels, (p) => `${p.state}|${p.district}`, (_key, sample) => `${sample.district}, ${sample.state}`),
            byProject,
            byLandType: rollup(parcels, (p) => p.landType, (key) => LAND_TYPE_LABELS[key as LandType] ?? key),
        }
    },

    async getProjectPerformance(filters?: Partial<AnalyticsFilterState>): Promise<ProjectPerformanceMetric[]> {
        const { projects, parcels, compensation, possession, randr, tasks } = getScope(filters)

        return projects.map((p) => {
            const sample = parcels.filter((pcl) => pcl.projectId === p.id)
            const sampleArea = sample.reduce((s, pcl) => s + pcl.areaHectares, 0)
            const acquiredArea = sample.filter((pcl) => isParcelAcquisitionProgressed(pcl.status)).reduce((s, pcl) => s + pcl.areaHectares, 0)
            const acquisitionPercentage = sample.length > 0 ? pct(acquiredArea, sampleArea) : null

            const ledger = compensation.filter((c) => c.projectId === p.id)
            const ledgerAssessedInr = ledger.reduce((s, c) => s + c.totalAssessedAmountInr, 0)
            const ledgerDisbursedInr = ledger.reduce((s, c) => s + c.amountDisbursedInr, 0)
            const ledgerPayable = ledger.reduce((s, c) => s + c.totalPayableAmountInr, 0)
            const compensationPercentage = ledger.length > 0 ? pct(ledgerDisbursedInr, ledgerPayable || ledgerAssessedInr) : null

            const prjPoss = possession.filter((r) => r.projectId === p.id)
            const possTaken = prjPoss.filter((r) => r.possessionStatus === 'POSSESSION_TAKEN' || r.possessionStatus === 'CERTIFICATE_ISSUED').length
            const possessionPercentage = prjPoss.length > 0 ? pct(possTaken, prjPoss.length) : null

            const prjRnr = randr.filter((r) => r.projectId === p.id)
            const rnrDone = prjRnr.filter((r) => r.rAndRStatus === 'COMPLETED').length
            const randrPercentage = prjRnr.length > 0 ? pct(rnrDone, prjRnr.length) : null

            const overdueWorkflowCount = tasks.filter((t) => t.projectId === p.id && t.slaStatus === 'OVERDUE').length
            const target = new Date(p.targetCompletionOn)
            const isDelayed = p.status !== 'COMPLETED' && !Number.isNaN(target.getTime()) && target < REFERENCE_NOW

            const attentionFlagCount =
                (p.status === 'ON_HOLD' || p.status === 'REJECTED' ? 2 : 0) +
                (isDelayed ? 1 : 0) +
                (overdueWorkflowCount > 0 ? 1 : 0) +
                (acquisitionPercentage !== null && acquisitionPercentage < 30 ? 1 : 0)

            return {
                projectId: p.id,
                code: p.code,
                title: p.title,
                implementingAgency: p.implementingAgency,
                state: p.state,
                districts: p.districts,
                totalAreaHectares: p.totalAreaHectares,
                acquiredAreaHectares: roundHa(acquiredArea),
                acquisitionPercentage,
                parcelCount: p.parcelCount,
                sampleParcelCount: sample.length,
                currentStage: p.status,
                estimatedCompensationInr: p.estimatedCompensationInr,
                ledgerAssessedInr,
                ledgerDisbursedInr,
                compensationPercentage,
                possessionTakenCount: possTaken,
                possessionCaseCount: prjPoss.length,
                possessionPercentage,
                randrActiveCount: prjRnr.length - rnrDone,
                randrCompletedCount: rnrDone,
                randrCaseCount: prjRnr.length,
                randrPercentage,
                overdueWorkflowCount,
                isDelayed,
                attentionFlagCount,
                lastUpdated: p.timeline.at(-1)?.date ?? p.notifiedOn,
            }
        })
    },

    async getStagePerformance(filters?: Partial<AnalyticsFilterState>): Promise<LifecycleStageMetric[]> {
        const { projects, parcels, documents, tasks } = getScope(filters)
        const durations = projects.map((p) => currentStageDays(p)).filter((d): d is number => d !== null)
        const median =
            durations.length === 0
                ? null
                : [...durations].sort((a, b) => a - b)[Math.floor(durations.length / 2)]

        return LIFECYCLE_STAGES.map((stage) => {
            let projectCount = 0
            let pendingCount = 0
            const stageDays: number[] = []

            if (stage.id === 'PARCEL_LANDOWNER') {
                pendingCount = parcels.filter((p) => p.status === 'IDENTIFIED' || p.status === 'VERIFICATION_PENDING').length
                projectCount = new Set(
                    parcels.filter((p) => p.status === 'IDENTIFIED' || p.status === 'VERIFICATION_PENDING').map((p) => p.projectId),
                ).size
            } else if (stage.id === 'VERIFICATION') {
                pendingCount = documents.filter((d) => d.verificationStatus === 'PENDING' || d.verificationStatus === 'UNDER_REVIEW').length
                projectCount = new Set(
                    documents
                        .filter((d) => d.verificationStatus === 'PENDING' || d.verificationStatus === 'UNDER_REVIEW')
                        .map((d) => d.projectId),
                ).size
            } else {
                const matched = projects.filter((p) => stage.statuses.includes(p.status))
                projectCount = matched.length
                pendingCount = tasks.filter((t) => stage.statuses.includes(t.currentStage) && t.status !== 'COMPLETED').length
                matched.forEach((p) => {
                    const days = currentStageDays(p)
                    if (days !== null) stageDays.push(days)
                })
            }

            const averageDaysInStage =
                stageDays.length > 0 ? Math.round(stageDays.reduce((s, d) => s + d, 0) / stageDays.length) : null

            const overdueInStage = tasks.filter(
                (t) => stage.statuses.includes(t.currentStage) && t.slaStatus === 'OVERDUE',
            ).length

            const hasBottleneck =
                (projectCount >= 2 && stage.id !== 'COMPLETION') ||
                overdueInStage > 0 ||
                (averageDaysInStage !== null && median !== null && averageDaysInStage > median * 1.5 && projectCount > 0) ||
                (stage.id === 'PARCEL_LANDOWNER' && pendingCount >= 2) ||
                (stage.id === 'VERIFICATION' && pendingCount >= 2)

            let bottleneckReason: string | undefined
            if (hasBottleneck) {
                if (overdueInStage > 0) bottleneckReason = `${overdueInStage} overdue workflow task(s)`
                else if (averageDaysInStage !== null) bottleneckReason = `Average ${averageDaysInStage} days in stage`
                else if (pendingCount > 0) bottleneckReason = `${pendingCount} pending items accumulating`
                else bottleneckReason = `${projectCount} schemes currently in this stage`
            }

            return {
                stageId: stage.id,
                stageLabel: stage.label,
                projectCount,
                pendingCount,
                averageDaysInStage,
                hasBottleneck,
                bottleneckReason,
            }
        })
    },

    async getWorkflowAnalytics(filters?: Partial<AnalyticsFilterState>): Promise<WorkflowAnalytics> {
        const { tasks } = getScope(filters)
        const completed = tasks.filter((t) => t.status === 'COMPLETED' && t.completedAt)
        const turnaround = completed.map((t) => daysBetween(t.createdAt, new Date(t.completedAt as string)))

        const roleMap: Record<string, { count: number; overdue: number }> = {}
        const officerMap: Record<string, { role: string; count: number; pending: number; overdue: number }> = {}
        const stageMap: Record<string, { count: number; overdue: number }> = {}

        tasks.forEach((t) => {
            const role = t.assignedRole.replace(/_/g, ' ')
            if (!roleMap[role]) roleMap[role] = { count: 0, overdue: 0 }
            roleMap[role].count++
            if (t.slaStatus === 'OVERDUE') roleMap[role].overdue++

            const officer = t.assignedOfficer
            if (!officerMap[officer]) officerMap[officer] = { role, count: 0, pending: 0, overdue: 0 }
            officerMap[officer].count++
            if (t.status === 'PENDING' || t.status === 'IN_REVIEW') officerMap[officer].pending++
            if (t.slaStatus === 'OVERDUE') officerMap[officer].overdue++

            if (!stageMap[t.currentStage]) stageMap[t.currentStage] = { count: 0, overdue: 0 }
            stageMap[t.currentStage].count++
            if (t.slaStatus === 'OVERDUE') stageMap[t.currentStage].overdue++
        })

        return {
            totalTasks: tasks.length,
            pendingTasks: tasks.filter((t) => t.status === 'PENDING').length,
            inReviewTasks: tasks.filter((t) => t.status === 'IN_REVIEW').length,
            completedTasks: tasks.filter((t) => t.status === 'COMPLETED').length,
            rejectedTasks: tasks.filter((t) => t.status === 'REJECTED').length,
            onHoldTasks: tasks.filter((t) => t.status === 'ON_HOLD').length,
            slaOverdueCount: tasks.filter((t) => t.slaStatus === 'OVERDUE').length,
            slaWarningCount: tasks.filter((t) => t.slaStatus === 'DUE_SOON').length,
            slaCompliantCount: tasks.filter((t) => t.slaStatus === 'ON_TRACK').length,
            slaCompletedCount: tasks.filter((t) => t.slaStatus === 'COMPLETED').length,
            averageTurnaroundDays:
                turnaround.length > 0 ? Number((turnaround.reduce((s, d) => s + d, 0) / turnaround.length).toFixed(1)) : null,
            priorityDistribution: countMap(tasks, (t) => t.priority).map((row) => ({
                priority: row.key,
                count: row.count,
            })),
            tasksByStage: Object.entries(stageMap).map(([stage, val]) => ({
                stage,
                label: PROJECT_STATUS_META[stage as AcquisitionProject['status']]?.label ?? stage,
                count: val.count,
                overdue: val.overdue,
            })),
            tasksByRole: Object.entries(roleMap).map(([role, val]) => ({
                role,
                count: val.count,
                overdue: val.overdue,
            })),
            tasksByOfficer: Object.entries(officerMap).map(([officer, val]) => ({
                officer,
                role: val.role,
                count: val.count,
                pending: val.pending,
                overdue: val.overdue,
            })),
        }
    },

    async getDocumentAnalytics(filters?: Partial<AnalyticsFilterState>): Promise<DocumentAnalytics> {
        const { documents, projects, parcels } = getScope(filters)
        const verifiedCount = documents.filter((d) => d.verificationStatus === 'VERIFIED').length
        const pendingCount = documents.filter((d) => d.verificationStatus === 'PENDING').length
        const underReviewCount = documents.filter((d) => d.verificationStatus === 'UNDER_REVIEW').length
        const rejectedCount = documents.filter((d) => d.verificationStatus === 'REJECTED').length
        const supersededCount = documents.filter((d) => d.verificationStatus === 'SUPERSEDED').length
        const totalVersions = documents.reduce((sum, d) => sum + (d.versions?.length ?? d.version ?? 1), 0)

        const verifyDays = documents
            .filter((d) => d.verifiedAt && d.uploadedAt)
            .map((d) => daysBetween(d.uploadedAt, new Date(d.verifiedAt as string)))

        const documentsByProject = projects.map((project) => {
            const docs = documents.filter((d) => d.projectId === project.id)
            const verified = docs.filter((d) => d.verificationStatus === 'VERIFIED').length
            return {
                projectId: project.id,
                projectCode: project.code,
                count: docs.length,
                verified,
                pending: docs.filter((d) => d.verificationStatus === 'PENDING' || d.verificationStatus === 'UNDER_REVIEW').length,
                completenessPercentage: pct(verified, Math.max(docs.length, 1)),
            }
        })

        const documentsByParcel = parcels
            .map((parcel) => {
                const docs = documents.filter((d) => d.parcelId === parcel.id)
                return {
                    parcelId: parcel.id,
                    surveyNumber: parcel.surveyNumber,
                    count: docs.length,
                    verified: docs.filter((d) => d.verificationStatus === 'VERIFIED').length,
                }
            })
            .filter((row) => row.count > 0)

        return {
            totalDocuments: documents.length,
            verifiedCount,
            pendingCount,
            underReviewCount,
            rejectedCount,
            supersededCount,
            verificationRatePercentage: pct(verifiedCount, documents.length),
            totalVersions,
            backlogCount: pendingCount + underReviewCount,
            averageVerificationDays:
                verifyDays.length > 0 ? Number((verifyDays.reduce((s, d) => s + d, 0) / verifyDays.length).toFixed(1)) : null,
            documentsByCategory: countMap(documents, (d) => d.category.replace(/_/g, ' ')).map((row) => ({
                category: row.key,
                count: row.count,
            })),
            documentsByStatus: countMap(documents, (d) => d.verificationStatus).map((row) => ({
                status: row.key.replace(/_/g, ' '),
                count: row.count,
            })),
            documentsByProject,
            documentsByParcel,
        }
    },

    async getCompensationAnalytics(filters?: Partial<AnalyticsFilterState>): Promise<CompensationAnalytics> {
        const { compensation, parcels } = getScope(filters)
        const totalAssessedInr = compensation.reduce((sum, c) => sum + c.totalAssessedAmountInr, 0)
        const totalPayableInr = compensation.reduce((sum, c) => sum + c.totalPayableAmountInr, 0)
        const totalDisbursedInr = compensation.reduce((sum, c) => sum + c.amountDisbursedInr, 0)
        const totalPendingInr = compensation.reduce((sum, c) => sum + c.amountPendingInr, 0)

        const held = compensation.filter((c) => c.paymentStatus === 'ON_HOLD' || c.paymentStatus === 'DISPUTED' || c.assessmentStatus === 'ON_HOLD' || c.assessmentStatus === 'DISPUTED')

        const prjMap: Record<string, { assessed: number; payable: number; disbursed: number; pending: number; code: string }> = {}
        compensation.forEach((c) => {
            if (!prjMap[c.projectId]) {
                prjMap[c.projectId] = {
                    assessed: 0,
                    payable: 0,
                    disbursed: 0,
                    pending: 0,
                    code: projectCodeOf(c.projectId),
                }
            }
            prjMap[c.projectId].assessed += c.totalAssessedAmountInr
            prjMap[c.projectId].payable += c.totalPayableAmountInr
            prjMap[c.projectId].disbursed += c.amountDisbursedInr
            prjMap[c.projectId].pending += c.amountPendingInr
        })

        const geoMap: Record<string, { state: string; district: string; assessedInr: number; disbursedInr: number; pendingInr: number; count: number }> = {}
        compensation.forEach((c) => {
            const parcel = parcels.find((p) => p.id === c.parcelId) ?? MOCK_PARCELS.find((p) => p.id === c.parcelId)
            const state = parcel?.state ?? 'Unmapped'
            const district = parcel?.district ?? 'Unmapped'
            const key = `${state}|${district}`
            if (!geoMap[key]) geoMap[key] = { state, district, assessedInr: 0, disbursedInr: 0, pendingInr: 0, count: 0 }
            geoMap[key].assessedInr += c.totalAssessedAmountInr
            geoMap[key].disbursedInr += c.amountDisbursedInr
            geoMap[key].pendingInr += c.amountPendingInr
            geoMap[key].count++
        })

        const assessmentStatusDistribution = countMap(compensation, (c) => c.assessmentStatus).map((row) => ({
            status: row.key.replace(/_/g, ' '),
            count: row.count,
            amountInr: compensation
                .filter((c) => c.assessmentStatus === row.key)
                .reduce((s, c) => s + c.totalAssessedAmountInr, 0),
        }))

        const paymentStatusDistribution = countMap(compensation, (c) => c.paymentStatus).map((row) => ({
            status: row.key.replace(/_/g, ' '),
            count: row.count,
            amountInr: compensation
                .filter((c) => c.paymentStatus === row.key)
                .reduce((s, c) => s + c.amountDisbursedInr, 0),
        }))

        return {
            totalAssessedInr,
            totalPayableInr,
            totalDisbursedInr,
            totalPendingInr,
            disbursementRatePercentage: pct(totalDisbursedInr, totalPayableInr || totalAssessedInr),
            awardsDeclaredCount: compensation.filter((c) => Boolean(c.awardDeclaredDate) || c.assessmentStatus === 'AWARD_DECLARED').length,
            parcelsDisbursedCount: compensation.filter((c) => c.paymentStatus === 'DISBURSED').length,
            parcelsPartiallyDisbursedCount: compensation.filter((c) => c.paymentStatus === 'PARTIALLY_DISBURSED').length,
            parcelsPendingDisbursementCount: compensation.filter((c) => c.paymentStatus === 'PENDING' || c.paymentStatus === 'PROCESSING').length,
            heldOrDisputedCount: held.length,
            heldOrDisputedAmountInr: held.reduce((s, c) => s + c.amountPendingInr, 0),
            reconciliationGapInr: Math.max(0, totalAssessedInr - totalPayableInr),
            assessmentStatusDistribution,
            paymentStatusDistribution,
            projectWiseCompensation: Object.entries(prjMap).map(([projectId, v]) => ({
                projectId,
                projectCode: v.code,
                assessedInr: v.assessed,
                payableInr: v.payable,
                disbursedInr: v.disbursed,
                pendingInr: v.pending,
                percentage: pct(v.disbursed, v.payable || v.assessed),
            })),
            geographyCompensation: Object.values(geoMap),
        }
    },

    async getPossessionAnalytics(filters?: Partial<AnalyticsFilterState>): Promise<PossessionAnalytics> {
        const { possession } = getScope(filters)
        const completed = possession.filter(
            (p) => p.possessionStatus === 'POSSESSION_TAKEN' || p.possessionStatus === 'CERTIFICATE_ISSUED',
        )

        const prjMap: Record<string, { code: string; total: number; completed: number }> = {}
        possession.forEach((p) => {
            if (!prjMap[p.projectId]) prjMap[p.projectId] = { code: projectCodeOf(p.projectId), total: 0, completed: 0 }
            prjMap[p.projectId].total++
            if (p.possessionStatus === 'POSSESSION_TAKEN' || p.possessionStatus === 'CERTIFICATE_ISSUED') {
                prjMap[p.projectId].completed++
            }
        })

        return {
            totalPossessionCases: possession.length,
            noticesPreparedCount: possession.filter((p) => Boolean(p.noticeDate) || p.possessionStatus === 'NOTICE_PREPARED').length,
            noticesIssuedCount: possession.filter((p) => Boolean(p.noticeReference) || p.possessionStatus === 'NOTICE_ISSUED').length,
            siteInspectionVerifiedCount: possession.filter((p) => p.siteVerificationResult === 'VERIFIED').length,
            possessionScheduledCount: possession.filter((p) => p.possessionStatus === 'SCHEDULED' || Boolean(p.scheduledDate)).length,
            possessionCompletedCount: completed.length,
            casesOnHoldCount: possession.filter((p) => p.possessionStatus === 'ON_HOLD').length,
            casesDisputedCount: possession.filter((p) => p.possessionStatus === 'DISPUTED').length,
            pendingCount: possession.filter((p) => p.possessionStatus === 'POSSESSION_PENDING' || p.possessionStatus === 'CERTIFICATE_PENDING').length,
            readyCount: possession.filter((p) => p.readinessStatus === 'READY').length,
            blockedCount: possession.filter((p) => p.readinessStatus === 'BLOCKED').length,
            possessionRatePercentage: pct(completed.length, possession.length),
            statusDistribution: countMap(possession, (p) => p.possessionStatus).map((row) => ({
                status: row.key.replace(/_/g, ' '),
                count: row.count,
            })),
            projectWisePossession: Object.entries(prjMap).map(([projectId, v]) => ({
                projectId,
                projectCode: v.code,
                total: v.total,
                completed: v.completed,
                pending: v.total - v.completed,
                percentage: pct(v.completed, v.total),
            })),
        }
    },

    async getRandRAnalytics(filters?: Partial<AnalyticsFilterState>): Promise<RAndRAnalytics> {
        const { randr } = getScope(filters)
        const completedCasesCount = randr.filter((r) => r.rAndRStatus === 'COMPLETED').length
        const benefitsApprovedInr = randr.reduce(
            (sum, r) => sum + r.benefits.reduce((s, b) => s + b.approvedValue, 0),
            0,
        )
        const benefitsDeliveredInr = randr.reduce(
            (sum, r) => sum + r.benefits.reduce((s, b) => s + b.deliveredValue, 0),
            0,
        )

        const prjMap: Record<string, { code: string; total: number; completed: number }> = {}
        randr.forEach((r) => {
            if (!prjMap[r.projectId]) prjMap[r.projectId] = { code: projectCodeOf(r.projectId), total: 0, completed: 0 }
            prjMap[r.projectId].total++
            if (r.rAndRStatus === 'COMPLETED') prjMap[r.projectId].completed++
        })

        return {
            totalCases: randr.length,
            affectedFamiliesCount: randr.reduce((sum, r) => sum + r.affectedFamilyCount, 0),
            eligibilityPendingCount: randr.filter((r) => r.eligibilityStatus === 'PENDING' || r.eligibilityStatus === 'UNDER_REVIEW' || r.eligibilityStatus === 'REQUIRES_DOCUMENTATION').length,
            eligibleFamiliesCount: randr.filter((r) => r.eligibilityStatus === 'ELIGIBLE').length,
            notEligibleCount: randr.filter((r) => r.eligibilityStatus === 'NOT_ELIGIBLE').length,
            entitlementsDefinedCount: randr.filter((r) => r.entitlements.length > 0).length,
            benefitsApprovedInr,
            benefitsDeliveredInr,
            livelihoodInProgressCount: randr.filter((r) => r.livelihoodSupport?.status === 'IN_PROGRESS' || r.livelihoodSupport?.status === 'PLANNED').length,
            relocationInProgressCount: randr.filter((r) => r.relocationStatus === 'IN_PROGRESS' || r.rAndRStatus === 'RELOCATION_IN_PROGRESS').length,
            relocationCompletedCount: randr.filter((r) => r.relocationStatus === 'COMPLETED').length,
            postRelocationVerifiedCount: randr.filter((r) => r.postRelocationVerificationStatus === 'VERIFIED').length,
            completedCasesCount,
            pendingCasesCount: randr.length - completedCasesCount,
            disputedOrHoldCount: randr.filter((r) => r.rAndRStatus === 'DISPUTED' || r.rAndRStatus === 'ON_HOLD').length,
            rAndRCompletionPercentage: pct(completedCasesCount, randr.length),
            eligibilityDistribution: countMap(randr, (r) => r.eligibilityStatus).map((row) => ({
                status: row.key.replace(/_/g, ' '),
                count: row.count,
            })),
            projectWiseRandR: Object.entries(prjMap).map(([projectId, v]) => ({
                projectId,
                projectCode: v.code,
                total: v.total,
                completed: v.completed,
                pending: v.total - v.completed,
                percentage: pct(v.completed, v.total),
            })),
        }
    },

    async getParcelAnalytics(filters?: Partial<AnalyticsFilterState>): Promise<ParcelAnalytics> {
        const { parcels } = getScope(filters)
        const projectDistributionMap: Record<string, { count: number; area: number }> = {}
        const districtMap: Record<string, { state: string; district: string; count: number; area: number }> = {}
        const statusMap: Record<string, { count: number; area: number }> = {}
        const landMap: Record<string, { count: number; area: number }> = {}

        parcels.forEach((p) => {
            if (!projectDistributionMap[p.projectId]) projectDistributionMap[p.projectId] = { count: 0, area: 0 }
            projectDistributionMap[p.projectId].count++
            projectDistributionMap[p.projectId].area += p.areaHectares

            const dKey = `${p.state}|${p.district}`
            if (!districtMap[dKey]) districtMap[dKey] = { state: p.state, district: p.district, count: 0, area: 0 }
            districtMap[dKey].count++
            districtMap[dKey].area += p.areaHectares

            if (!statusMap[p.status]) statusMap[p.status] = { count: 0, area: 0 }
            statusMap[p.status].count++
            statusMap[p.status].area += p.areaHectares

            if (!landMap[p.landType]) landMap[p.landType] = { count: 0, area: 0 }
            landMap[p.landType].count++
            landMap[p.landType].area += p.areaHectares
        })

        return {
            totalParcels: parcels.length,
            totalAreaHectares: roundHa(parcels.reduce((s, p) => s + p.areaHectares, 0)),
            acquiredCount: parcels.filter((p) => isParcelAcquired(p.status)).length,
            verifiedCount: parcels.filter((p) => p.status === 'VERIFIED' || p.owners.every((o) => o.verificationStatus === 'VERIFIED')).length,
            disputedCount: parcels.filter((p) => p.status === 'DISPUTED').length,
            compensationPendingCount: parcels.filter((p) => p.status === 'COMPENSATION_PENDING' || p.status === 'AWARD_DECLARED').length,
            compensationPaidCount: parcels.filter((p) => p.status === 'COMPENSATION_PAID' || p.status === 'POSSESSION_PENDING' || p.status === 'POSSESSION_TAKEN').length,
            possessionPendingCount: parcels.filter((p) => p.status === 'POSSESSION_PENDING').length,
            possessionCompletedCount: parcels.filter((p) => p.status === 'POSSESSION_TAKEN').length,
            statusDistribution: Object.entries(statusMap).map(([status, v]) => ({
                status: PARCEL_STATUS_META[status as LandParcel['status']]?.label ?? status,
                count: v.count,
                areaHectares: roundHa(v.area),
            })),
            landTypeDistribution: Object.entries(landMap).map(([landType, v]) => ({
                landType: LAND_TYPE_LABELS[landType as LandType] ?? landType,
                count: v.count,
                areaHectares: roundHa(v.area),
            })),
            projectDistribution: Object.entries(projectDistributionMap).map(([projectId, v]) => ({
                projectId,
                projectCode: projectCodeOf(projectId),
                count: v.count,
                areaHectares: roundHa(v.area),
            })),
            districtDistribution: Object.values(districtMap).map((v) => ({
                district: v.district,
                state: v.state,
                count: v.count,
                areaHectares: roundHa(v.area),
            })),
        }
    },

    async getStateDistrictAnalytics(filters?: Partial<AnalyticsFilterState>): Promise<StateDistrictAnalytics[]> {
        const { projects, parcels, compensation, possession, randr } = getScope(filters)
        const map: Record<string, StateDistrictAnalytics> = {}

        const ensure = (state: string, district: string) => {
            const key = `${state}|${district}`
            if (!map[key]) {
                map[key] = {
                    state,
                    district,
                    projectsCount: 0,
                    parcelsCount: 0,
                    proposedAreaHectares: 0,
                    acquiredAreaHectares: 0,
                    acquisitionPercentage: 0,
                    disputedCount: 0,
                    compensationDisbursedInr: 0,
                    compensationPendingInr: 0,
                    possessionCompletedCount: 0,
                    randrActiveCount: 0,
                }
            }
            return map[key]
        }

        projects.forEach((p) => {
            p.districts.forEach((district) => {
                ensure(p.state, district).projectsCount++
            })
        })

        parcels.forEach((p) => {
            const row = ensure(p.state, p.district)
            row.parcelsCount++
            row.proposedAreaHectares += p.areaHectares
            if (isParcelAcquisitionProgressed(p.status)) row.acquiredAreaHectares += p.areaHectares
            if (p.status === 'DISPUTED') row.disputedCount++
        })

        compensation.forEach((c) => {
            const parcel = parcels.find((p) => p.id === c.parcelId) ?? MOCK_PARCELS.find((p) => p.id === c.parcelId)
            if (!parcel) return
            const row = ensure(parcel.state, parcel.district)
            row.compensationDisbursedInr += c.amountDisbursedInr
            row.compensationPendingInr += c.amountPendingInr
        })

        possession.forEach((p) => {
            const row = ensure(p.state, p.district)
            if (p.possessionStatus === 'POSSESSION_TAKEN' || p.possessionStatus === 'CERTIFICATE_ISSUED') {
                row.possessionCompletedCount++
            }
        })

        randr.forEach((r) => {
            const row = ensure(r.state, r.district)
            if (r.rAndRStatus !== 'COMPLETED') row.randrActiveCount++
        })

        return Object.values(map).map((row) => ({
            ...row,
            proposedAreaHectares: roundHa(row.proposedAreaHectares),
            acquiredAreaHectares: roundHa(row.acquiredAreaHectares),
            acquisitionPercentage: pct(row.acquiredAreaHectares, row.proposedAreaHectares),
        }))
    },

    async getAttentionInsights(filters?: Partial<AnalyticsFilterState>): Promise<AnalyticsInsight[]> {
        const { projects, parcels, compensation, possession, randr, tasks, documents } = getScope(filters)
        const insights: AnalyticsInsight[] = []

        const projectAcquisition = projects
            .map((p) => {
                const sample = parcels.filter((pcl) => pcl.projectId === p.id)
                const total = sample.reduce((s, pcl) => s + pcl.areaHectares, 0)
                const acquired = sample.filter((pcl) => isParcelAcquisitionProgressed(pcl.status)).reduce((s, pcl) => s + pcl.areaHectares, 0)
                return { project: p, sample: sample.length, rate: sample.length ? pct(acquired, total) : null }
            })
            .filter((row) => row.rate !== null)
            .sort((a, b) => (a.rate ?? 100) - (b.rate ?? 100))

        if (projectAcquisition[0] && (projectAcquisition[0].rate ?? 100) < 50) {
            const row = projectAcquisition[0]
            insights.push({
                id: 'INS-ACQ-001',
                title: `Highest acquisition backlog — ${row.project.code}`,
                severity: row.project.status === 'ON_HOLD' ? 'CRITICAL' : 'WARNING',
                category: 'ACQUISITION',
                explanation: `${row.project.title} has ${row.rate}% of cadastral sample area progressed to paid/possessed status across ${row.sample} mapped parcels.`,
                affectedEntity: `${row.project.code} · ${row.project.districts.join(', ')}`,
                metricValue: `${row.rate}% progressed`,
                recommendedAction: 'Review outstanding parcels and district coordination for award and possession.',
                targetRoute: ROUTES.projectDetail(row.project.id),
                actionLabel: 'Open scheme dossier',
            })
        }

        const pendingByProject = compensation.reduce<Record<string, number>>((acc, c) => {
            acc[c.projectId] = (acc[c.projectId] || 0) + c.amountPendingInr
            return acc
        }, {})
        const topPending = Object.entries(pendingByProject).sort((a, b) => b[1] - a[1])[0]
        if (topPending && topPending[1] > 0) {
            const project = projects.find((p) => p.id === topPending[0])
            if (project) {
                insights.push({
                    id: 'INS-CMP-001',
                    title: `Largest pending compensation — ${project.code}`,
                    severity: topPending[1] > 1_00_00_000 ? 'CRITICAL' : 'WARNING',
                    category: 'COMPENSATION',
                    explanation: `Ledger pending amount for ${project.title} is ${formatINR(topPending[1], { compact: true })} against assessed awards in the current filter.`,
                    affectedEntity: `${project.code} · ${project.state}`,
                    metricValue: formatINR(topPending[1], { compact: true }),
                    recommendedAction: 'Inspect award ledger, held payments, and disputed shares.',
                    targetRoute: `${ROUTES.compensation}?projectId=${project.id}`,
                    actionLabel: 'Open compensation ledger',
                })
            }
        }

        const overdue = tasks.filter((t) => t.slaStatus === 'OVERDUE')
        if (overdue.length > 0) {
            const task = overdue[0]
            insights.push({
                id: 'INS-WF-001',
                title: `SLA overdue — ${overdue.length} workflow task(s)`,
                severity: 'CRITICAL',
                category: 'WORKFLOW',
                explanation: `${task.title} assigned to ${task.assignedOfficer} is overdue (due ${task.dueAt}). ${overdue.length} overdue task(s) in the current filter.`,
                affectedEntity: `${projectCodeOf(task.projectId)} · ${task.assignedOfficer}`,
                metricValue: `${overdue.length} overdue`,
                recommendedAction: 'Reassign or close overdue desks before further stage movement.',
                targetRoute: ROUTES.workflow,
                actionLabel: 'Open workflow queue',
            })
        }

        const backlogDocs = documents.filter((d) => d.verificationStatus === 'PENDING' || d.verificationStatus === 'UNDER_REVIEW')
        if (backlogDocs.length > 0) {
            insights.push({
                id: 'INS-DOC-001',
                title: `Document verification backlog`,
                severity: backlogDocs.length >= 3 ? 'WARNING' : 'INFO',
                category: 'DOCUMENT',
                explanation: `${backlogDocs.length} document(s) are pending or under review in the current filter.`,
                affectedEntity: `${backlogDocs.length} vault records`,
                metricValue: `${backlogDocs.length} pending`,
                recommendedAction: 'Clear title and gazette verification before approval movement.',
                targetRoute: ROUTES.documents,
                actionLabel: 'Open document register',
            })
        }

        const delayedPossession = possession.filter((p) => p.slaStatus === 'OVERDUE' || p.possessionStatus === 'ON_HOLD' || p.readinessStatus === 'BLOCKED')
        if (delayedPossession.length > 0) {
            const rec = delayedPossession[0]
            insights.push({
                id: 'INS-POS-001',
                title: `Possession delays requiring attention`,
                severity: rec.possessionStatus === 'DISPUTED' || rec.slaStatus === 'OVERDUE' ? 'CRITICAL' : 'WARNING',
                category: 'POSSESSION',
                explanation: `${delayedPossession.length} possession case(s) are overdue, on hold, or blocked. Example: ${rec.surveyNumber} (${projectCodeOf(rec.projectId)}).`,
                affectedEntity: rec.surveyNumber,
                metricValue: `${delayedPossession.length} cases`,
                recommendedAction: 'Resolve readiness blockers and schedule site handover.',
                targetRoute: ROUTES.possession,
                actionLabel: 'Open possession queue',
            })
        }

        const randrBacklog = randr.filter((r) => r.rAndRStatus !== 'COMPLETED')
        if (randrBacklog.length > 0) {
            insights.push({
                id: 'INS-RNR-001',
                title: `R&R cases still open`,
                severity: randr.filter((r) => r.rAndRStatus === 'DISPUTED' || r.rAndRStatus === 'ON_HOLD').length > 0 ? 'WARNING' : 'INFO',
                category: 'R_AND_R',
                explanation: `${randrBacklog.length} of ${randr.length} R&R case(s) are not completed, including eligibility, benefits, or relocation work.`,
                affectedEntity: `${randrBacklog.length} households`,
                metricValue: `${randrBacklog.length} open`,
                recommendedAction: 'Review entitlement delivery and post-relocation verification.',
                targetRoute: ROUTES.rehabilitation,
                actionLabel: 'Open R&R register',
            })
        }

        const disputedParcels = parcels.filter((p) => p.status === 'DISPUTED')
        if (disputedParcels.length > 0) {
            insights.push({
                id: 'INS-PCL-001',
                title: `Disputed cadastral parcels`,
                severity: 'CRITICAL',
                category: 'ACQUISITION',
                explanation: `${disputedParcels.length} mapped parcel(s) are in disputed status, covering ${formatArea(disputedParcels.reduce((s, p) => s + p.areaHectares, 0))}.`,
                affectedEntity: disputedParcels.map((p) => p.surveyNumber).join(', '),
                metricValue: `${disputedParcels.length} disputed`,
                recommendedAction: 'Escalate title and boundary disputes through the revenue desk.',
                targetRoute: `${ROUTES.parcels}?status=DISPUTED`,
                actionLabel: 'Open disputed parcels',
            })
        }

        return insights
    },

    async getAttentionQueue(filters?: Partial<AnalyticsFilterState>): Promise<AttentionItem[]> {
        const { projects, parcels, compensation, possession, randr, tasks, documents } = getScope(filters)
        const items: AttentionItem[] = []

        tasks
            .filter((t) => t.slaStatus === 'OVERDUE')
            .forEach((t) => {
                items.push({
                    id: `ATT-WF-${t.id}`,
                    severity: t.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
                    title: `Overdue workflow — ${projectCodeOf(t.projectId)}`,
                    reason: `${t.title} is overdue (due ${t.dueAt}).`,
                    entityLabel: t.assignedOfficer,
                    metricValue: t.priority,
                    targetRoute: ROUTES.workflowDetail(t.id),
                })
            })

        parcels
            .filter((p) => p.status === 'DISPUTED')
            .forEach((p) => {
                items.push({
                    id: `ATT-PCL-${p.id}`,
                    severity: 'CRITICAL',
                    title: `Disputed parcel ${p.surveyNumber}`,
                    reason: `Cadastral plot in ${p.district} is marked disputed.`,
                    entityLabel: `${projectCodeOf(p.projectId)} · ${p.district}`,
                    metricValue: formatArea(p.areaHectares),
                    targetRoute: ROUTES.parcelDetail(p.id),
                })
            })

        compensation
            .filter((c) => c.paymentStatus === 'DISPUTED' || c.paymentStatus === 'ON_HOLD' || c.amountPendingInr > 50_00_000)
            .forEach((c) => {
                items.push({
                    id: `ATT-CMP-${c.id}`,
                    severity: c.paymentStatus === 'DISPUTED' || c.paymentStatus === 'ON_HOLD' ? 'CRITICAL' : 'HIGH',
                    title: `Compensation attention — ${projectCodeOf(c.projectId)}`,
                    reason: `${c.surveyNumber} has ${formatINR(c.amountPendingInr, { compact: true })} pending (${c.paymentStatus.replace(/_/g, ' ')}).`,
                    entityLabel: c.surveyNumber,
                    metricValue: formatINR(c.amountPendingInr, { compact: true }),
                    targetRoute: ROUTES.compensationDetail(c.id),
                })
            })

        possession
            .filter((p) => p.slaStatus === 'OVERDUE' || p.possessionStatus === 'ON_HOLD' || p.possessionStatus === 'DISPUTED' || p.readinessStatus === 'BLOCKED')
            .forEach((p) => {
                items.push({
                    id: `ATT-POS-${p.id}`,
                    severity: p.possessionStatus === 'DISPUTED' || p.slaStatus === 'OVERDUE' ? 'CRITICAL' : 'HIGH',
                    title: `Possession delay — ${p.surveyNumber}`,
                    reason: `Status ${p.possessionStatus.replace(/_/g, ' ')}; readiness ${p.readinessStatus}.`,
                    entityLabel: `${projectCodeOf(p.projectId)} · ${p.district}`,
                    metricValue: p.slaStatus,
                    targetRoute: ROUTES.possessionDetail(p.id),
                })
            })

        const pendingDocs = documents.filter((d) => d.verificationStatus === 'PENDING' || d.verificationStatus === 'UNDER_REVIEW' || d.verificationStatus === 'REJECTED')
        if (pendingDocs.length > 0) {
            items.push({
                id: 'ATT-DOC-BACKLOG',
                severity: pendingDocs.some((d) => d.verificationStatus === 'REJECTED') ? 'HIGH' : 'MEDIUM',
                title: 'Document verification backlog',
                reason: `${pendingDocs.length} document(s) pending, under review, or rejected.`,
                entityLabel: 'Document vault',
                metricValue: `${pendingDocs.length} records`,
                targetRoute: ROUTES.documents,
            })
        }

        randr
            .filter((r) => r.rAndRStatus === 'DISPUTED' || r.rAndRStatus === 'ON_HOLD' || r.rAndRStatus === 'ELIGIBILITY_REVIEW')
            .forEach((r) => {
                items.push({
                    id: `ATT-RNR-${r.id}`,
                    severity: r.rAndRStatus === 'DISPUTED' || r.rAndRStatus === 'ON_HOLD' ? 'HIGH' : 'MEDIUM',
                    title: `R&R attention — ${projectCodeOf(r.projectId)}`,
                    reason: `Case ${r.id} is ${r.rAndRStatus.replace(/_/g, ' ')} (${r.eligibilityStatus.replace(/_/g, ' ')}).`,
                    entityLabel: r.household.householdReference,
                    metricValue: r.rAndRStatus.replace(/_/g, ' '),
                    targetRoute: ROUTES.rehabilitationDetail(r.id),
                })
            })

        tasks
            .filter((t) => t.slaStatus === 'DUE_SOON')
            .forEach((t) => {
                items.push({
                    id: `ATT-WF-SOON-${t.id}`,
                    severity: 'MEDIUM',
                    title: `SLA due soon — ${projectCodeOf(t.projectId)}`,
                    reason: `${t.title} is due ${t.dueAt}.`,
                    entityLabel: t.assignedOfficer,
                    metricValue: 'DUE SOON',
                    targetRoute: ROUTES.workflowDetail(t.id),
                })
            })

        projects
            .filter((p) => p.status === 'ON_HOLD' || p.status === 'REJECTED')
            .forEach((p) => {
                items.push({
                    id: `ATT-PRJ-${p.id}`,
                    severity: 'CRITICAL',
                    title: `Scheme ${p.status.replace(/_/g, ' ').toLowerCase()} — ${p.code}`,
                    reason: `${p.title} is currently ${PROJECT_STATUS_META[p.status].label}.`,
                    entityLabel: `${p.state} · ${p.districts.join(', ')}`,
                    metricValue: PROJECT_STATUS_META[p.status].label,
                    targetRoute: ROUTES.projectDetail(p.id),
                })
            })

        const order: Record<AttentionItem['severity'], number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 }
        return items.sort((a, b) => order[a.severity] - order[b.severity])
    },

    async getReportHistory(): Promise<GeneratedReport[]> {
        return [...REPORT_HISTORY]
    },

    async generateReport(reportType: ReportType, filters?: Partial<AnalyticsFilterState>): Promise<GeneratedReport> {
        const kpis = await this.getExecutiveSummary(filters)
        const projects = await this.getProjectPerformance(filters)
        const parcels = await this.getParcelAnalytics(filters)
        const compensation = await this.getCompensationAnalytics(filters)
        const possession = await this.getPossessionAnalytics(filters)
        const randr = await this.getRandRAnalytics(filters)
        const workflow = await this.getWorkflowAnalytics(filters)
        const geography = await this.getStateDistrictAnalytics(filters)
        const documents = await this.getDocumentAnalytics(filters)

        reportSequence += 1
        const id = `RPT-2026-${String(reportSequence).padStart(3, '0')}`

        let columns: string[] = []
        let dataRows: ReportPreviewRow[] = []

        switch (reportType) {
            case 'PROJECT_PERFORMANCE':
                columns = ['Code', 'Title', 'State', 'Stage', 'Sample parcels', 'Acquisition %', 'Compensation %', 'Delayed']
                dataRows = projects.map((p) => ({
                    Code: p.code,
                    Title: p.title,
                    State: p.state,
                    Stage: PROJECT_STATUS_META[p.currentStage].label,
                    'Sample parcels': p.sampleParcelCount,
                    'Acquisition %': p.acquisitionPercentage ?? 'N/A',
                    'Compensation %': p.compensationPercentage ?? 'N/A',
                    Delayed: p.isDelayed ? 'Yes' : 'No',
                }))
                break
            case 'LAND_ACQUISITION_STATUS':
                columns = ['Project', 'Parcels', 'Area (ha)']
                dataRows = parcels.projectDistribution.map((row) => ({
                    Project: row.projectCode,
                    Parcels: row.count,
                    'Area (ha)': row.areaHectares,
                }))
                break
            case 'COMPENSATION_FINANCIAL':
                columns = ['Project', 'Assessed', 'Payable', 'Disbursed', 'Pending', 'Disbursement %']
                dataRows = compensation.projectWiseCompensation.map((row) => ({
                    Project: row.projectCode,
                    Assessed: row.assessedInr,
                    Payable: row.payableInr,
                    Disbursed: row.disbursedInr,
                    Pending: row.pendingInr,
                    'Disbursement %': row.percentage,
                }))
                break
            case 'POSSESSION_HANDOVER':
                columns = ['Project', 'Cases', 'Completed', 'Pending', 'Completion %']
                dataRows = possession.projectWisePossession.map((row) => ({
                    Project: row.projectCode,
                    Cases: row.total,
                    Completed: row.completed,
                    Pending: row.pending,
                    'Completion %': row.percentage,
                }))
                break
            case 'R_AND_R_RESETTLEMENT':
                columns = ['Project', 'Cases', 'Completed', 'Pending', 'Completion %']
                dataRows = randr.projectWiseRandR.map((row) => ({
                    Project: row.projectCode,
                    Cases: row.total,
                    Completed: row.completed,
                    Pending: row.pending,
                    'Completion %': row.percentage,
                }))
                break
            case 'WORKFLOW_SLA_AUDIT':
                columns = ['Officer', 'Role', 'Tasks', 'Pending', 'Overdue']
                dataRows = workflow.tasksByOfficer.map((row) => ({
                    Officer: row.officer,
                    Role: row.role,
                    Tasks: row.count,
                    Pending: row.pending,
                    Overdue: row.overdue,
                }))
                break
            case 'DISTRICT_JURISDICTION':
                columns = ['District', 'State', 'Projects', 'Parcels', 'Acquisition %', 'Disputed']
                dataRows = geography.map((row) => ({
                    District: row.district,
                    State: row.state,
                    Projects: row.projectsCount,
                    Parcels: row.parcelsCount,
                    'Acquisition %': row.acquisitionPercentage,
                    Disputed: row.disputedCount,
                }))
                break
            default:
                columns = ['Metric', 'Value']
                dataRows = [
                    { Metric: 'Schemes', Value: kpis.totalProjects },
                    { Metric: 'Proposed scheme area (ha)', Value: kpis.totalProposedAreaHectares },
                    { Metric: 'Cadastral sample area (ha)', Value: kpis.cadastralSampleAreaHectares },
                    { Metric: 'Sample acquired area (ha)', Value: kpis.totalAcquiredAreaHectares },
                    { Metric: 'Sample parcels', Value: kpis.totalParcels },
                    { Metric: 'Parcels acquired', Value: kpis.parcelsAcquired },
                    { Metric: 'Compensation assessed (INR)', Value: kpis.totalCompensationAssessedInr },
                    { Metric: 'Compensation disbursed (INR)', Value: kpis.totalCompensationDisbursedInr },
                    { Metric: 'SLA overdue tasks', Value: kpis.slaBreachedTasks },
                    { Metric: 'R&R pending', Value: kpis.randrPendingCases },
                    { Metric: 'Documents in vault', Value: documents.totalDocuments },
                ]
        }

        const report: GeneratedReport = {
            id,
            reportType,
            title: REPORT_TITLES[reportType],
            generatedAt: REFERENCE_NOW.toISOString(),
            generatedBy: 'Director (Monitoring & Evaluation, NLAMS)',
            reportingPeriod: filters?.period || '12M',
            scopeDescription:
                filters?.projectId && filters.projectId !== 'ALL'
                    ? `Scheme ${projectCodeOf(filters.projectId)}`
                    : filters?.state && filters.state !== 'ALL'
                      ? `State ${filters.state}${filters.district && filters.district !== 'ALL' ? ` / ${filters.district}` : ''}`
                      : 'National scope — filtered mock registers',
            filterSummary: formatFilterSummary(filters),
            kpiSnapshot: {
                'Schemes': kpis.totalProjects,
                'Sample parcels': kpis.totalParcels,
                'Acquisition (sample)': `${kpis.acquisitionProgressPercentage}%`,
                'Disbursement': `${kpis.disbursementPercentage}%`,
                'SLA overdue': kpis.slaBreachedTasks,
            },
            summaryText: `Deterministic report compiled from NLAMS mock registers on ${REFERENCE_NOW.toLocaleDateString('en-IN')}. ${dataRows.length} data row(s). Not a server-generated PDF.`,
            columns,
            dataRows,
            dataRowsCount: dataRows.length,
            status: 'GENERATED',
        }

        REPORT_HISTORY.unshift(report)
        return report
    },
}
