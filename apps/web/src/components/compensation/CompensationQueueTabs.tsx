import { Layers, Clock, Scale, CheckCircle2, PauseCircle, AlertTriangle, IndianRupee } from 'lucide-react'
import type { CompensationRecord } from '@/types'

export type CompensationQueueTab =
    | 'ALL'
    | 'UNDER_ASSESSMENT'
    | 'AWARD_DECLARED'
    | 'DISBURSEMENT_PENDING'
    | 'PARTIALLY_DISBURSED'
    | 'ON_HOLD'
    | 'DISPUTED'
    | 'DISBURSED'

interface CompensationQueueTabsProps {
    activeTab: CompensationQueueTab
    onTabChange: (tab: CompensationQueueTab) => void
    records: CompensationRecord[]
}

export function CompensationQueueTabs({ activeTab, onTabChange, records }: CompensationQueueTabsProps) {
    const counts = {
        ALL: records.length,
        UNDER_ASSESSMENT: records.filter((r) => r.assessmentStatus === 'UNDER_ASSESSMENT' || r.assessmentStatus === 'ASSESSMENT_PENDING').length,
        AWARD_DECLARED: records.filter((r) => r.assessmentStatus === 'AWARD_DECLARED' || r.assessmentStatus === 'AWARD_PENDING').length,
        DISBURSEMENT_PENDING: records.filter((r) => r.paymentStatus === 'PENDING' || r.assessmentStatus === 'DISBURSEMENT_PENDING').length,
        PARTIALLY_DISBURSED: records.filter((r) => r.paymentStatus === 'PARTIALLY_DISBURSED').length,
        ON_HOLD: records.filter((r) => r.paymentStatus === 'ON_HOLD' || r.assessmentStatus === 'ON_HOLD').length,
        DISPUTED: records.filter((r) => r.paymentStatus === 'DISPUTED' || r.assessmentStatus === 'DISPUTED').length,
        DISBURSED: records.filter((r) => r.paymentStatus === 'DISBURSED').length,
    }

    const tabs: { key: CompensationQueueTab; label: string; icon: any; count: number; badgeColor?: string }[] = [
        { key: 'ALL', label: 'All Compensation Cases', icon: Layers, count: counts.ALL },
        { key: 'UNDER_ASSESSMENT', label: 'Under Valuation', icon: Scale, count: counts.UNDER_ASSESSMENT, badgeColor: 'bg-ink-100 text-ink-800' },
        { key: 'AWARD_DECLARED', label: 'Award Declared', icon: IndianRupee, count: counts.AWARD_DECLARED, badgeColor: 'bg-ink-100 text-ink-800' },
        { key: 'DISBURSEMENT_PENDING', label: 'Disbursement Pending', icon: Clock, count: counts.DISBURSEMENT_PENDING, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'PARTIALLY_DISBURSED', label: 'Partially Paid', icon: Clock, count: counts.PARTIALLY_DISBURSED, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'ON_HOLD', label: 'Payment On Hold', icon: PauseCircle, count: counts.ON_HOLD, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'DISPUTED', label: 'Disputed Cases', icon: AlertTriangle, count: counts.DISPUTED, badgeColor: counts.DISPUTED > 0 ? 'bg-rust-100 text-rust-800' : undefined },
        { key: 'DISBURSED', label: '100% Disbursed', icon: CheckCircle2, count: counts.DISBURSED, badgeColor: 'bg-signal-100 text-signal-900' },
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
