import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    BarChart3,
    TrendingUp,
    Building2,
    IndianRupee,
    Flag,
    HeartHandshake,
    Clock,
    FileStack,
    MapPin,
    FileSpreadsheet,
} from 'lucide-react'

// Hooks
import {
    useExecutiveSummary,
    useAcquisitionTrend,
    useProjectPerformance,
    useStagePerformance,
    useWorkflowAnalytics,
    useDocumentAnalytics,
    useCompensationAnalytics,
    usePossessionAnalytics,
    useRandRAnalytics,
    useStateDistrictAnalytics,
    useAnalyticsInsights,
    useReportHistory,
} from '@/hooks/use-analytics'
import { useProjects } from '@/hooks/use-projects'
import type { AnalyticsFilterState, AnalyticsPeriod } from '@/types/analytics'

// Analytics UI Components
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader'
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters'
import { ExecutiveAnalyticsKpis } from '@/components/analytics/ExecutiveAnalyticsKpis'
import { AcquisitionTrendChart } from '@/components/analytics/AcquisitionTrendChart'
import { ProjectPerformanceTable } from '@/components/analytics/ProjectPerformanceTable'
import { ProjectProgressChart } from '@/components/analytics/ProjectProgressChart'
import { LifecycleBottleneckChart } from '@/components/analytics/LifecycleBottleneckChart'
import { WorkflowAnalyticsPanel } from '@/components/analytics/WorkflowAnalyticsPanel'
import { DocumentAnalyticsPanel } from '@/components/analytics/DocumentAnalyticsPanel'
import { CompensationAnalyticsPanel } from '@/components/analytics/CompensationAnalyticsPanel'
import { PossessionAnalyticsPanel } from '@/components/analytics/PossessionAnalyticsPanel'
import { RAndRAnalyticsPanel } from '@/components/analytics/RAndRAnalyticsPanel'
import { ParcelAnalyticsPanel } from '@/components/analytics/ParcelAnalyticsPanel'
import { GeographicAnalyticsPanel } from '@/components/analytics/GeographicAnalyticsPanel'
import { AnalyticsMapPreview } from '@/components/analytics/AnalyticsMapPreview'
import { AnalyticsInsights } from '@/components/analytics/AnalyticsInsights'
import { ReportBuilder } from '@/components/analytics/ReportBuilder'
import { ReportHistory } from '@/components/analytics/ReportHistory'

type AnalyticsTab =
    | 'executive'
    | 'acquisition'
    | 'projects'
    | 'financial'
    | 'possession'
    | 'randr'
    | 'workflow'
    | 'documents'
    | 'geography'
    | 'reports'

export function AnalyticsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const queryTab = (searchParams.get('tab') as AnalyticsTab) || 'executive'
    const queryProjectId = searchParams.get('projectId') ?? 'ALL'
    const queryState = searchParams.get('state') ?? 'ALL'
    const queryDistrict = searchParams.get('district') ?? 'ALL'
    const queryPeriod = (searchParams.get('period') as AnalyticsPeriod) || '12M'

    const [activeTab, setActiveTab] = React.useState<AnalyticsTab>(queryTab)
    const [filters, setFilters] = React.useState<AnalyticsFilterState>({
        period: queryPeriod,
        state: queryState,
        district: queryDistrict,
        projectId: queryProjectId,
        projectStatus: 'ALL',
        parcelStatus: 'ALL',
        landType: 'ALL',
        compensationStatus: 'ALL',
        possessionStatus: 'ALL',
        randrStatus: 'ALL',
    })

    // Data Hooks
    const { data: executiveKpis } = useExecutiveSummary(filters)
    const { data: trendData = [] } = useAcquisitionTrend(filters)
    const { data: projectMetrics = [] } = useProjectPerformance(filters)
    const { data: stageMetrics = [] } = useStagePerformance()
    const { data: workflowData } = useWorkflowAnalytics()
    const { data: documentData } = useDocumentAnalytics()
    const { data: compensationData } = useCompensationAnalytics()
    const { data: possessionData } = usePossessionAnalytics()
    const { data: randrData } = useRandRAnalytics()
    const { data: districtData = [] } = useStateDistrictAnalytics()
    const { data: insights = [] } = useAnalyticsInsights()
    const { data: reportHistory = [] } = useReportHistory()
    const { data: projects = [] } = useProjects()

    // Filter Options
    const availableProjects = React.useMemo(() => {
        return projects.map((p) => ({ id: p.id, code: p.code, title: p.title }))
    }, [projects])

    const availableStates = React.useMemo(() => {
        const set = new Set<string>()
        projects.forEach((p) => set.add(p.state))
        return Array.from(set).sort()
    }, [projects])

    const availableDistricts = React.useMemo(() => {
        const set = new Set<string>()
        projects.forEach((p) => p.districts.forEach((d) => set.add(d)))
        return Array.from(set).sort()
    }, [projects])

    const activeFiltersCount = React.useMemo(() => {
        let count = 0
        if (filters.projectId !== 'ALL') count++
        if (filters.state !== 'ALL') count++
        if (filters.district !== 'ALL') count++
        if (filters.projectStatus !== 'ALL') count++
        if (filters.compensationStatus !== 'ALL') count++
        if (filters.possessionStatus !== 'ALL') count++
        return count
    }, [filters])

    const handleResetFilters = () => {
        setFilters({
            period: filters.period,
            state: 'ALL',
            district: 'ALL',
            projectId: 'ALL',
            projectStatus: 'ALL',
            parcelStatus: 'ALL',
            landType: 'ALL',
            compensationStatus: 'ALL',
            possessionStatus: 'ALL',
            randrStatus: 'ALL',
        })
    }

    const handleTabChange = (tab: AnalyticsTab) => {
        setActiveTab(tab)
        setSearchParams((prev) => {
            prev.set('tab', tab)
            return prev
        })
    }

    const tabs: Array<{ id: AnalyticsTab; label: string; icon: any }> = [
        { id: 'executive', label: 'Executive Overview', icon: BarChart3 },
        { id: 'acquisition', label: 'Land Acquisition', icon: TrendingUp },
        { id: 'projects', label: 'Scheme Performance', icon: Building2 },
        { id: 'financial', label: 'Compensation DBT', icon: IndianRupee },
        { id: 'possession', label: 'Physical Possession', icon: Flag },
        { id: 'randr', label: 'R&R Resettlement', icon: HeartHandshake },
        { id: 'workflow', label: 'Workflow & SLA', icon: Clock },
        { id: 'documents', label: 'Document Vault', icon: FileStack },
        { id: 'geography', label: 'State & District', icon: MapPin },
        { id: 'reports', label: 'Statutory Reports', icon: FileSpreadsheet },
    ]

    return (
        <div className="space-y-5 pb-10">
            {/* 1. Header */}
            <AnalyticsHeader
                period={filters.period}
                onPeriodChange={(period) => setFilters({ ...filters, period })}
                onOpenReportBuilder={() => handleTabChange('reports')}
                onPrint={() => window.print()}
            />

            {/* 2. Global Query Filter Bar */}
            <AnalyticsFilters
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={handleResetFilters}
                availableProjects={availableProjects}
                availableStates={availableStates}
                availableDistricts={availableDistricts}
                activeCount={activeFiltersCount}
            />

            {/* 3. Executive KPI Strip */}
            {executiveKpis && <ExecutiveAnalyticsKpis metrics={executiveKpis} />}

            {/* 4. Tab Navigation Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-ink-200 pb-1 scrollbar-none text-xs">
                {tabs.map((t) => {
                    const Icon = t.icon
                    const isActive = activeTab === t.id
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => handleTabChange(t.id)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                isActive
                                    ? 'bg-terracotta-700 text-paper shadow-xs'
                                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{t.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* 5. Tab Content Sections */}

            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {activeTab === 'executive' && (
                <div className="space-y-5">
                    {/* Insights & Exception Banner */}
                    <AnalyticsInsights insights={insights} />

                    {/* Acquisition Velocity Trend */}
                    <AcquisitionTrendChart data={trendData} />

                    {/* Lifecycle Pipeline Bottlenecks */}
                    <LifecycleBottleneckChart stages={stageMetrics} />

                    {/* Normalized Scheme Progress */}
                    <ProjectProgressChart projects={projectMetrics} />

                    {/* Spatial Intelligence Preview */}
                    <AnalyticsMapPreview />
                </div>
            )}

            {/* TAB 2: LAND ACQUISITION */}
            {activeTab === 'acquisition' && (
                <div className="space-y-5">
                    <AcquisitionTrendChart data={trendData} />
                    <ParcelAnalyticsPanel />
                    <ProjectPerformanceTable projects={projectMetrics} />
                </div>
            )}

            {/* TAB 3: SCHEME PERFORMANCE */}
            {activeTab === 'projects' && (
                <div className="space-y-5">
                    <ProjectProgressChart projects={projectMetrics} />
                    <ProjectPerformanceTable projects={projectMetrics} />
                </div>
            )}

            {/* TAB 4: COMPENSATION DBT */}
            {activeTab === 'financial' && (
                <div className="space-y-5">
                    {compensationData && <CompensationAnalyticsPanel compensation={compensationData} />}
                    <ProjectPerformanceTable projects={projectMetrics} />
                </div>
            )}

            {/* TAB 5: PHYSICAL POSSESSION */}
            {activeTab === 'possession' && (
                <div className="space-y-5">
                    {possessionData && <PossessionAnalyticsPanel possession={possessionData} />}
                    <ProjectPerformanceTable projects={projectMetrics} />
                </div>
            )}

            {/* TAB 6: R&R RESETTLEMENT */}
            {activeTab === 'randr' && (
                <div className="space-y-5">
                    {randrData && <RAndRAnalyticsPanel randr={randrData} />}
                    <ProjectPerformanceTable projects={projectMetrics} />
                </div>
            )}

            {/* TAB 7: WORKFLOW & SLA */}
            {activeTab === 'workflow' && (
                <div className="space-y-5">
                    {workflowData && <WorkflowAnalyticsPanel workflow={workflowData} />}
                    <LifecycleBottleneckChart stages={stageMetrics} />
                </div>
            )}

            {/* TAB 8: DOCUMENT VAULT */}
            {activeTab === 'documents' && (
                <div className="space-y-5">
                    {documentData && <DocumentAnalyticsPanel documents={documentData} />}
                </div>
            )}

            {/* TAB 9: STATE & DISTRICT */}
            {activeTab === 'geography' && (
                <div className="space-y-5">
                    <GeographicAnalyticsPanel districts={districtData} />
                    <AnalyticsMapPreview />
                </div>
            )}

            {/* TAB 10: STATUTORY REPORTS */}
            {activeTab === 'reports' && (
                <div className="space-y-5">
                    <ReportBuilder filters={filters} />
                    <ReportHistory reports={reportHistory} />
                </div>
            )}
        </div>
    )
}
