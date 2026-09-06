import type { ProjectStatus, ParcelStatus, LandType } from '@/types'

export type AnalyticsPeriod = '30D' | '90D' | '6M' | '12M' | 'FY' | 'ALL'

export interface AnalyticsFilterState {
    period: AnalyticsPeriod
    state: string
    district: string
    projectId: string
    projectStatus: ProjectStatus | 'ALL'
    parcelStatus: ParcelStatus | 'ALL'
    landType: LandType | 'ALL'
    compensationStatus: 'ALL' | 'PAID' | 'PENDING' | 'UNDER_ASSESSMENT'
    possessionStatus: 'ALL' | 'POSSESSION_TAKEN' | 'POSSESSION_PENDING'
    randrStatus: 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'DISPUTED'
}

export interface ExecutiveKpiMetrics {
    totalProjects: number
    totalProposedAreaHectares: number
    totalAcquiredAreaHectares: number
    acquisitionProgressPercentage: number
    cadastralSampleAreaHectares: number
    totalParcels: number
    parcelsAcquired: number
    totalCompensationAssessedInr: number
    totalCompensationPayableInr: number
    totalCompensationDisbursedInr: number
    totalCompensationPendingInr: number
    disbursementPercentage: number
    possessionCompletedParcels: number
    possessionPendingParcels: number
    possessionCompletedPercentage: number
    randrActiveCases: number
    randrCompletedCases: number
    randrPendingCases: number
    projectsRequiringAttention: number
    pendingWorkflowTasks: number
    slaBreachedTasks: number
}

export interface AcquisitionTrendPoint {
    date: string
    periodLabel: string
    proposedAreaHectares: number
    acquiredAreaHectares: number
    cumulativeProposedHectares: number
    cumulativeAcquiredHectares: number
    schemeCount: number
}

export interface NamedCountMetric {
    key: string
    label: string
    count: number
    areaHectares?: number
    amountInr?: number
}

export interface AcquisitionBreakdown {
    proposedVsAcquired: {
        proposedAreaHectares: number
        acquiredAreaHectares: number
        pendingAreaHectares: number
        progressPercentage: number
    }
    byState: NamedCountMetric[]
    byDistrict: NamedCountMetric[]
    byProject: NamedCountMetric[]
    byLandType: NamedCountMetric[]
}

export interface ProjectPerformanceMetric {
    projectId: string
    code: string
    title: string
    implementingAgency: string
    state: string
    districts: string[]
    totalAreaHectares: number
    acquiredAreaHectares: number
    acquisitionPercentage: number | null
    parcelCount: number
    sampleParcelCount: number
    currentStage: ProjectStatus
    estimatedCompensationInr: number
    ledgerAssessedInr: number
    ledgerDisbursedInr: number
    compensationPercentage: number | null
    possessionTakenCount: number
    possessionCaseCount: number
    possessionPercentage: number | null
    randrActiveCount: number
    randrCompletedCount: number
    randrCaseCount: number
    randrPercentage: number | null
    overdueWorkflowCount: number
    isDelayed: boolean
    attentionFlagCount: number
    lastUpdated: string
}

export interface LifecycleStageMetric {
    stageId: string
    stageLabel: string
    projectCount: number
    pendingCount: number
    averageDaysInStage: number | null
    hasBottleneck: boolean
    bottleneckReason?: string
}

export interface WorkflowAnalytics {
    totalTasks: number
    pendingTasks: number
    inReviewTasks: number
    completedTasks: number
    rejectedTasks: number
    onHoldTasks: number
    slaOverdueCount: number
    slaWarningCount: number
    slaCompliantCount: number
    slaCompletedCount: number
    averageTurnaroundDays: number | null
    priorityDistribution: Array<{ priority: string; count: number }>
    tasksByStage: Array<{ stage: string; label: string; count: number; overdue: number }>
    tasksByRole: Array<{ role: string; count: number; overdue: number }>
    tasksByOfficer: Array<{ officer: string; role: string; count: number; pending: number; overdue: number }>
}

export interface DocumentAnalytics {
    totalDocuments: number
    verifiedCount: number
    pendingCount: number
    underReviewCount: number
    rejectedCount: number
    supersededCount: number
    verificationRatePercentage: number
    totalVersions: number
    backlogCount: number
    averageVerificationDays: number | null
    documentsByCategory: Array<{ category: string; count: number }>
    documentsByStatus: Array<{ status: string; count: number }>
    documentsByProject: Array<{
        projectId: string
        projectCode: string
        count: number
        verified: number
        pending: number
        completenessPercentage: number
    }>
    documentsByParcel: Array<{
        parcelId: string
        surveyNumber: string
        count: number
        verified: number
    }>
}

export interface CompensationAnalytics {
    totalAssessedInr: number
    totalPayableInr: number
    totalDisbursedInr: number
    totalPendingInr: number
    disbursementRatePercentage: number
    awardsDeclaredCount: number
    parcelsDisbursedCount: number
    parcelsPartiallyDisbursedCount: number
    parcelsPendingDisbursementCount: number
    heldOrDisputedCount: number
    heldOrDisputedAmountInr: number
    reconciliationGapInr: number
    assessmentStatusDistribution: Array<{ status: string; count: number; amountInr: number }>
    paymentStatusDistribution: Array<{ status: string; count: number; amountInr: number }>
    projectWiseCompensation: Array<{
        projectId: string
        projectCode: string
        assessedInr: number
        payableInr: number
        disbursedInr: number
        pendingInr: number
        percentage: number
    }>
    geographyCompensation: Array<{
        state: string
        district: string
        assessedInr: number
        disbursedInr: number
        pendingInr: number
        count: number
    }>
}

export interface PossessionAnalytics {
    totalPossessionCases: number
    noticesPreparedCount: number
    noticesIssuedCount: number
    siteInspectionVerifiedCount: number
    possessionScheduledCount: number
    possessionCompletedCount: number
    casesOnHoldCount: number
    casesDisputedCount: number
    pendingCount: number
    readyCount: number
    blockedCount: number
    possessionRatePercentage: number
    statusDistribution: Array<{ status: string; count: number }>
    projectWisePossession: Array<{
        projectId: string
        projectCode: string
        total: number
        completed: number
        pending: number
        percentage: number
    }>
}

export interface RAndRAnalytics {
    totalCases: number
    affectedFamiliesCount: number
    eligibilityPendingCount: number
    eligibleFamiliesCount: number
    notEligibleCount: number
    entitlementsDefinedCount: number
    benefitsApprovedInr: number
    benefitsDeliveredInr: number
    livelihoodInProgressCount: number
    relocationInProgressCount: number
    relocationCompletedCount: number
    postRelocationVerifiedCount: number
    completedCasesCount: number
    pendingCasesCount: number
    disputedOrHoldCount: number
    rAndRCompletionPercentage: number
    eligibilityDistribution: Array<{ status: string; count: number }>
    projectWiseRandR: Array<{
        projectId: string
        projectCode: string
        total: number
        completed: number
        pending: number
        percentage: number
    }>
}

export interface ParcelAnalytics {
    totalParcels: number
    totalAreaHectares: number
    acquiredCount: number
    verifiedCount: number
    disputedCount: number
    compensationPendingCount: number
    compensationPaidCount: number
    possessionPendingCount: number
    possessionCompletedCount: number
    statusDistribution: Array<{ status: string; count: number; areaHectares: number }>
    landTypeDistribution: Array<{ landType: string; count: number; areaHectares: number }>
    projectDistribution: Array<{ projectId: string; projectCode: string; count: number; areaHectares: number }>
    districtDistribution: Array<{ district: string; state: string; count: number; areaHectares: number }>
}

export interface StateDistrictAnalytics {
    state: string
    district: string
    projectsCount: number
    parcelsCount: number
    proposedAreaHectares: number
    acquiredAreaHectares: number
    acquisitionPercentage: number
    disputedCount: number
    compensationDisbursedInr: number
    compensationPendingInr: number
    possessionCompletedCount: number
    randrActiveCount: number
}

export type InsightSeverity = 'CRITICAL' | 'WARNING' | 'INFO'

export interface AnalyticsInsight {
    id: string
    title: string
    severity: InsightSeverity
    category: 'ACQUISITION' | 'COMPENSATION' | 'POSSESSION' | 'R_AND_R' | 'WORKFLOW' | 'DOCUMENT' | 'LIFECYCLE'
    explanation: string
    affectedEntity: string
    metricValue?: string
    recommendedAction: string
    targetRoute: string
    actionLabel: string
}

export type AttentionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM'

export interface AttentionItem {
    id: string
    severity: AttentionSeverity
    title: string
    reason: string
    entityLabel: string
    metricValue?: string
    targetRoute: string
}

export type ReportType =
    | 'EXECUTIVE_SUMMARY'
    | 'PROJECT_PERFORMANCE'
    | 'LAND_ACQUISITION_STATUS'
    | 'COMPENSATION_FINANCIAL'
    | 'POSSESSION_HANDOVER'
    | 'R_AND_R_RESETTLEMENT'
    | 'WORKFLOW_SLA_AUDIT'
    | 'DISTRICT_JURISDICTION'

export type ReportModuleCategory =
    | 'EXECUTIVE'
    | 'PROJECTS'
    | 'PARCELS'
    | 'COMPENSATION'
    | 'POSSESSION'
    | 'R_AND_R'
    | 'WORKFLOW'
    | 'DOCUMENTS'
    | 'GEOGRAPHY'

export interface ReportPreviewRow {
    [key: string]: string | number
}

export interface GeneratedReport {
    id: string
    reportType: ReportType
    title: string
    generatedAt: string
    generatedBy: string
    reportingPeriod: string
    scopeDescription: string
    filterSummary: string
    kpiSnapshot: Record<string, string | number>
    summaryText: string
    columns: string[]
    dataRows: ReportPreviewRow[]
    dataRowsCount: number
    status: 'GENERATED' | 'ARCHIVED'
}
