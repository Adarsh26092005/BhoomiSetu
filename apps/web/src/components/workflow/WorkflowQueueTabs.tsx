import { CheckCircle2, Clock, AlertTriangle, PauseCircle, Layers, ShieldAlert } from 'lucide-react'
import type { WorkflowTask } from '@/types'

export type WorkflowQueueTab = 'ALL' | 'PENDING' | 'IN_REVIEW' | 'OVERDUE' | 'ON_HOLD' | 'COMPLETED'

interface WorkflowQueueTabsProps {
    activeTab: WorkflowQueueTab
    onTabChange: (tab: WorkflowQueueTab) => void
    tasks: WorkflowTask[]
}

export function WorkflowQueueTabs({ activeTab, onTabChange, tasks }: WorkflowQueueTabsProps) {
    const counts = {
        ALL: tasks.length,
        PENDING: tasks.filter((t) => t.status === 'PENDING').length,
        IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
        OVERDUE: tasks.filter((t) => t.slaStatus === 'OVERDUE' || t.priority === 'CRITICAL').length,
        ON_HOLD: tasks.filter((t) => t.status === 'ON_HOLD').length,
        COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
    }

    const tabs: { key: WorkflowQueueTab; label: string; icon: any; count: number; badgeColor?: string }[] = [
        { key: 'ALL', label: 'All Action Items', icon: Layers, count: counts.ALL },
        { key: 'PENDING', label: 'Pending Decisions', icon: Clock, count: counts.PENDING, badgeColor: 'bg-ink-100 text-ink-800' },
        { key: 'IN_REVIEW', label: 'In Scrutiny', icon: ShieldAlert, count: counts.IN_REVIEW, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'OVERDUE', label: 'Overdue / Critical', icon: AlertTriangle, count: counts.OVERDUE, badgeColor: counts.OVERDUE > 0 ? 'bg-rust-100 text-rust-800' : undefined },
        { key: 'ON_HOLD', label: 'Stayed / On Hold', icon: PauseCircle, count: counts.ON_HOLD, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'COMPLETED', label: 'Approved & Passed', icon: CheckCircle2, count: counts.COMPLETED, badgeColor: 'bg-signal-100 text-signal-900' },
    ]

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-ink-200 pb-2">
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key

                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onTabChange(tab.key)}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                            isActive
                                ? 'bg-ink-900 text-paper shadow-xs'
                                : 'bg-paper text-ink-600 hover:bg-ink-100 hover:text-ink-900 border border-ink-200'
                        }`}
                    >
                        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-paper' : 'text-ink-500'}`} />
                        <span>{tab.label}</span>
                        <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                                isActive
                                    ? 'bg-paper/20 text-paper'
                                    : tab.badgeColor ?? 'bg-ink-100 text-ink-700'
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
