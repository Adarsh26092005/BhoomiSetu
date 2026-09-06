import { Layers, ShieldCheck, FileText, Calendar, MapPin, Clock, Award, PauseCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { PossessionRecord } from '@/types'

export type PossessionQueueTab =
    | 'ALL'
    | 'READY'
    | 'NOTICE'
    | 'SCHEDULED'
    | 'SITE_VERIFICATION'
    | 'POSSESSION_PENDING'
    | 'CERT_PENDING'
    | 'ON_HOLD'
    | 'DISPUTED'
    | 'COMPLETED'

interface PossessionQueueTabsProps {
    activeTab: PossessionQueueTab
    onTabChange: (tab: PossessionQueueTab) => void
    records: PossessionRecord[]
}

export function PossessionQueueTabs({ activeTab, onTabChange, records }: PossessionQueueTabsProps) {
    const counts = {
        ALL: records.length,
        READY: records.filter((r) => r.possessionStatus === 'READY_FOR_POSSESSION').length,
        NOTICE: records.filter((r) => r.possessionStatus === 'NOTICE_PREPARED' || r.possessionStatus === 'NOTICE_ISSUED').length,
        SCHEDULED: records.filter((r) => r.possessionStatus === 'SCHEDULED').length,
        SITE_VERIFICATION: records.filter((r) => r.possessionStatus === 'SITE_VERIFICATION').length,
        POSSESSION_PENDING: records.filter((r) => r.possessionStatus === 'POSSESSION_PENDING').length,
        CERT_PENDING: records.filter((r) => r.possessionStatus === 'CERTIFICATE_PENDING' || r.possessionStatus === 'POSSESSION_TAKEN').length,
        ON_HOLD: records.filter((r) => r.possessionStatus === 'ON_HOLD').length,
        DISPUTED: records.filter((r) => r.possessionStatus === 'DISPUTED').length,
        COMPLETED: records.filter((r) => r.possessionStatus === 'CERTIFICATE_ISSUED').length,
    }

    const tabs: { key: PossessionQueueTab; label: string; icon: any; count: number; badgeColor?: string }[] = [
        { key: 'ALL', label: 'All Cases', icon: Layers, count: counts.ALL },
        { key: 'READY', label: 'Ready for Notice', icon: ShieldCheck, count: counts.READY, badgeColor: 'bg-ink-100 text-ink-800' },
        { key: 'NOTICE', label: 'Form 21 Notice', icon: FileText, count: counts.NOTICE, badgeColor: 'bg-ink-100 text-ink-800' },
        { key: 'SCHEDULED', label: 'Scheduled', icon: Calendar, count: counts.SCHEDULED, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'SITE_VERIFICATION', label: 'Site Verification', icon: MapPin, count: counts.SITE_VERIFICATION, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'POSSESSION_PENDING', label: 'Possession Pending', icon: Clock, count: counts.POSSESSION_PENDING, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'CERT_PENDING', label: 'Certs Due', icon: Award, count: counts.CERT_PENDING, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'ON_HOLD', label: 'On Hold', icon: PauseCircle, count: counts.ON_HOLD, badgeColor: 'bg-amber-100 text-amber-900' },
        { key: 'DISPUTED', label: 'Disputed', icon: AlertTriangle, count: counts.DISPUTED, badgeColor: counts.DISPUTED > 0 ? 'bg-rust-100 text-rust-800' : undefined },
        { key: 'COMPLETED', label: '100% Handed Over', icon: CheckCircle2, count: counts.COMPLETED, badgeColor: 'bg-signal-100 text-signal-900' },
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
