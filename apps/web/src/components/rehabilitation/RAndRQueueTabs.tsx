import type { RAndRCase } from '@/types'

export type RAndRQueueTab =
    | 'ALL'
    | 'ASSESSMENT_PENDING'
    | 'ELIGIBILITY_REVIEW'
    | 'ENTITLEMENT_PENDING'
    | 'APPROVAL_PENDING'
    | 'BENEFIT_IN_PROGRESS'
    | 'RELOCATION_IN_PROGRESS'
    | 'POST_RELOCATION_VERIFICATION'
    | 'COMPLETED'
    | 'ON_HOLD'
    | 'DISPUTED'

interface RAndRQueueTabsProps {
    activeTab: RAndRQueueTab
    onTabChange: (tab: RAndRQueueTab) => void
    records: RAndRCase[]
}

export function RAndRQueueTabs({ activeTab, onTabChange, records }: RAndRQueueTabsProps) {
    const tabs: { key: RAndRQueueTab; label: string; count: number }[] = [
        { key: 'ALL', label: 'All Cases', count: records.length },
        {
            key: 'ASSESSMENT_PENDING',
            label: 'Assessment Pending',
            count: records.filter((r) => r.rAndRStatus === 'ASSESSMENT_PENDING' || r.eligibilityStatus === 'REQUIRES_DOCUMENTATION').length,
        },
        {
            key: 'ELIGIBILITY_REVIEW',
            label: 'Eligibility Review',
            count: records.filter((r) => r.rAndRStatus === 'ELIGIBILITY_REVIEW' || r.eligibilityStatus === 'UNDER_REVIEW').length,
        },
        {
            key: 'ENTITLEMENT_PENDING',
            label: 'Entitlement Pending',
            count: records.filter((r) => r.rAndRStatus === 'ENTITLEMENT_DEFINED' || r.rAndRStatus === 'PLAN_PREPARED').length,
        },
        {
            key: 'APPROVAL_PENDING',
            label: 'Approval Pending',
            count: records.filter((r) => r.rAndRStatus === 'APPROVAL_PENDING').length,
        },
        {
            key: 'BENEFIT_IN_PROGRESS',
            label: 'Benefits In Progress',
            count: records.filter((r) => r.rAndRStatus === 'BENEFIT_IN_PROGRESS' || r.rAndRStatus === 'BENEFIT_APPROVED').length,
        },
        {
            key: 'RELOCATION_IN_PROGRESS',
            label: 'Relocation In Progress',
            count: records.filter((r) => r.relocationStatus === 'IN_PROGRESS' || r.rAndRStatus === 'RELOCATION_IN_PROGRESS').length,
        },
        {
            key: 'POST_RELOCATION_VERIFICATION',
            label: 'Verification Pending',
            count: records.filter((r) => r.rAndRStatus === 'POST_RELOCATION_VERIFICATION' || r.postRelocationVerificationStatus === 'REQUIRES_REVIEW').length,
        },
        {
            key: 'COMPLETED',
            label: 'Completed',
            count: records.filter((r) => r.rAndRStatus === 'COMPLETED').length,
        },
        {
            key: 'ON_HOLD',
            label: 'On Hold',
            count: records.filter((r) => r.rAndRStatus === 'ON_HOLD').length,
        },
        {
            key: 'DISPUTED',
            label: 'Disputed',
            count: records.filter((r) => r.rAndRStatus === 'DISPUTED' || r.eligibilityStatus === 'DISPUTED').length,
        },
    ]

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-ink-200 pb-2 scrollbar-thin">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key
                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onTabChange(tab.key)}
                        className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                                ? 'bg-ink-900 text-paper shadow-xs'
                                : 'bg-ink-100/70 text-ink-600 hover:bg-ink-200/80 hover:text-ink-900'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold font-mono ${
                                isActive ? 'bg-paper/20 text-paper' : 'bg-ink-200 text-ink-700'
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
