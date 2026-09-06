import * as React from 'react'
import { useProjects } from '@/hooks/use-projects'
import { MOCK_AUDIT_LOG } from '@/mock/activity'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ExecutiveKpiGrid } from '@/components/dashboard/ExecutiveKpiGrid'
import { LifecycleOverview } from '@/components/dashboard/LifecycleOverview'
import { AcquisitionProgress } from '@/components/dashboard/AcquisitionProgress'
import { AttentionRequired } from '@/components/dashboard/AttentionRequired'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { ProjectRegisterTable } from '@/components/dashboard/ProjectRegisterTable'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Loader2 } from 'lucide-react'

export function DashboardPage() {
    const { data: projects = [], isLoading, refetch } = useProjects()
    const [isRefreshing, setIsRefreshing] = React.useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await refetch()
        } finally {
            setTimeout(() => setIsRefreshing(false), 400)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading National Land Acquisition Dashboard...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Dashboard Header & National Context */}
            <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

            {/* 2. Executive Key Performance Indicators (8 Cards) */}
            <ExecutiveKpiGrid projects={projects} />

            {/* 3. Primary Grid: Visualizations, Action Items & Registers */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left 8 Cols: Visual Distribution & Full Register */}
                <div className="space-y-6 lg:col-span-8">
                    <LifecycleOverview projects={projects} />
                    <ProjectRegisterTable projects={projects} />
                </div>

                {/* Right 4 Cols: Progress, Priority Attention & Live Audit */}
                <div className="space-y-6 lg:col-span-4">
                    <AcquisitionProgress projects={projects} />
                    <AttentionRequired projects={projects} />
                    <RecentActivity auditLogs={MOCK_AUDIT_LOG} />
                </div>
            </div>

            {/* 4. Officer Quick Actions */}
            <QuickActions />
        </div>
    )
}
