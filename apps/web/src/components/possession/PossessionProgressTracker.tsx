import { CheckCircle2, Circle, ShieldCheck, FileText, Calendar, MapPin, Flag, Award } from 'lucide-react'
import type { PossessionStatus } from '@/types'

interface PossessionProgressTrackerProps {
    status: PossessionStatus
}

export function PossessionProgressTracker({ status }: PossessionProgressTrackerProps) {
    const stages = [
        { key: 'READY_FOR_POSSESSION', label: '1. Eligible & Ready', icon: ShieldCheck },
        { key: 'NOTICE_ISSUED', label: '2. Form 21 Notice', icon: FileText },
        { key: 'SCHEDULED', label: '3. Handover Scheduled', icon: Calendar },
        { key: 'SITE_VERIFICATION', label: '4. DGPS Demarcation', icon: MapPin },
        { key: 'POSSESSION_TAKEN', label: '5. Possession Taken', icon: Flag },
        { key: 'CERTIFICATE_ISSUED', label: '6. Form 22 Certificate', icon: Award },
    ]

    const getStageIndex = (st: PossessionStatus): number => {
        switch (st) {
            case 'READY_FOR_POSSESSION':
                return 0
            case 'NOTICE_PREPARED':
            case 'NOTICE_ISSUED':
                return 1
            case 'SCHEDULED':
                return 2
            case 'SITE_VERIFICATION':
            case 'POSSESSION_PENDING':
                return 3
            case 'POSSESSION_TAKEN':
            case 'CERTIFICATE_PENDING':
                return 4
            case 'CERTIFICATE_ISSUED':
                return 5
            case 'ON_HOLD':
            case 'DISPUTED':
                return 1 // show as stalled in earlier stage
            default:
                return 0
        }
    }

    const currentIndex = getStageIndex(status)
    const isBlocked = status === 'ON_HOLD' || status === 'DISPUTED'

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-ink-100 pb-2.5">
                <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Statutory Possession Lifecycle Pipeline
                    </h3>
                </div>
                {isBlocked && (
                    <span className="rounded bg-rust-50 px-2 py-0.5 text-[10px] font-bold text-rust-800 border border-rust-200">
                        PROGRESSION PAUSED ({status.replace(/_/g, ' ')})
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                {stages.map((stage, idx) => {
                    const isPassed = idx < currentIndex || (idx === 5 && status === 'CERTIFICATE_ISSUED')
                    const isCurrent = idx === currentIndex && status !== 'CERTIFICATE_ISSUED'
                    const StageIcon = stage.icon

                    return (
                        <div
                            key={stage.key}
                            className={`rounded-lg border p-2.5 text-xs transition-all relative ${
                                isPassed
                                    ? 'border-signal-200 bg-signal-50/50 text-signal-900'
                                    : isCurrent
                                    ? isBlocked
                                        ? 'border-rust-300 bg-rust-50/50 text-rust-900 ring-1 ring-rust-400'
                                        : 'border-ink-900 bg-ink-50 text-ink-900 ring-1 ring-ink-900 shadow-xs'
                                    : 'border-ink-100 bg-ink-50/30 text-ink-400'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <StageIcon className={`h-4 w-4 ${isPassed ? 'text-signal-600' : isCurrent ? (isBlocked ? 'text-rust-600' : 'text-terracotta-600') : 'text-ink-400'}`} />
                                {isPassed ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-signal-600 shrink-0" />
                                ) : isCurrent ? (
                                    <span className="h-2 w-2 rounded-full bg-terracotta-600 animate-pulse shrink-0" />
                                ) : (
                                    <Circle className="h-3.5 w-3.5 text-ink-300 shrink-0" />
                                )}
                            </div>

                            <span className="font-semibold block text-[11px] leading-tight">
                                {stage.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
