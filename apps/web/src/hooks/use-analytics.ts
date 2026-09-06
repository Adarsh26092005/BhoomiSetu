import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'
import type { AnalyticsFilterState, ReportType } from '@/types/analytics'

export const ANALYTICS_KEYS = {
    all: ['analytics'] as const,
    executive: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'executive', filters] as const,
    trend: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'trend', filters] as const,
    acquisition: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'acquisition', filters] as const,
    projects: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'projects', filters] as const,
    stages: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'stages', filters] as const,
    workflow: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'workflow', filters] as const,
    documents: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'documents', filters] as const,
    compensation: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'compensation', filters] as const,
    possession: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'possession', filters] as const,
    randr: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'randr', filters] as const,
    parcels: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'parcels', filters] as const,
    geography: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'geography', filters] as const,
    insights: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'insights', filters] as const,
    attention: (filters?: Partial<AnalyticsFilterState>) => [...ANALYTICS_KEYS.all, 'attention', filters] as const,
    reports: () => [...ANALYTICS_KEYS.all, 'reports'] as const,
}

export function useExecutiveSummary(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.executive(filters),
        queryFn: () => analyticsService.getExecutiveSummary(filters),
    })
}

export function useAcquisitionTrend(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.trend(filters),
        queryFn: () => analyticsService.getAcquisitionTrend(filters),
    })
}

export function useAcquisitionBreakdown(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.acquisition(filters),
        queryFn: () => analyticsService.getAcquisitionBreakdown(filters),
    })
}

export function useProjectPerformance(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.projects(filters),
        queryFn: () => analyticsService.getProjectPerformance(filters),
    })
}

export function useStagePerformance(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.stages(filters),
        queryFn: () => analyticsService.getStagePerformance(filters),
    })
}

export function useWorkflowAnalytics(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.workflow(filters),
        queryFn: () => analyticsService.getWorkflowAnalytics(filters),
    })
}

export function useDocumentAnalytics(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.documents(filters),
        queryFn: () => analyticsService.getDocumentAnalytics(filters),
    })
}

export function useCompensationAnalytics(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.compensation(filters),
        queryFn: () => analyticsService.getCompensationAnalytics(filters),
    })
}

export function usePossessionAnalytics(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.possession(filters),
        queryFn: () => analyticsService.getPossessionAnalytics(filters),
    })
}

export function useRandRAnalytics(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.randr(filters),
        queryFn: () => analyticsService.getRandRAnalytics(filters),
    })
}

export function useParcelAnalytics(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.parcels(filters),
        queryFn: () => analyticsService.getParcelAnalytics(filters),
    })
}

export function useStateDistrictAnalytics(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.geography(filters),
        queryFn: () => analyticsService.getStateDistrictAnalytics(filters),
    })
}

export function useAnalyticsInsights(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.insights(filters),
        queryFn: () => analyticsService.getAttentionInsights(filters),
    })
}

export function useAttentionQueue(filters?: Partial<AnalyticsFilterState>) {
    return useQuery({
        queryKey: ANALYTICS_KEYS.attention(filters),
        queryFn: () => analyticsService.getAttentionQueue(filters),
    })
}

export function useReportHistory() {
    return useQuery({
        queryKey: ANALYTICS_KEYS.reports(),
        queryFn: () => analyticsService.getReportHistory(),
    })
}

export function useGenerateReportMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ reportType, filters }: { reportType: ReportType; filters?: Partial<AnalyticsFilterState> }) =>
            analyticsService.generateReport(reportType, filters),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.reports() })
        },
    })
}
