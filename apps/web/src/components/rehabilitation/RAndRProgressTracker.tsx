import { Users, FileCheck, Award, ThumbsUp, HeartHandshake, Truck, CheckCircle2, CheckCheck, Circle } from 'lucide-react'
import type { RAndRStatus } from '@/types'

interface RAndRProgressTrackerProps {
    status: RAndRStatus
}

export function RAndRProgressTracker({ status }: RAndRProgressTrackerProps) {
    const stages = [
        { key: 'IDENTIFIED', label: '1. Identified', icon: Users },
        { key: 'ELIGIBILITY_REVIEW', label: '2. Assessment', icon: FileCheck },
        { key: 'ENTITLEMENT_DEFINED', label: '3. Entitlement', icon: Award },
        { key: 'BENEFIT_APPROVED', label: '4. Approval', icon: ThumbsUp },
        { key: 'BENEFIT_IN_PROGRESS', label: '5. Benefit Delivery', icon: HeartHandshake },
        { key: 'RELOCATION_IN_PROGRESS', label: '6. Relocation', icon: Truck },
        { key: 'POST_RELOCATION_VERIFICATION', label: '7. Verification', icon: CheckCircle2 },
        { key: 'COMPLETED', label: '8. Completed', icon: CheckCheck },
    ]

    const getStageIndex = (st: RAndRStatus): number => {
        switch (st) {
            case 'IDENTIFIED':
                return 0
            case 'ASSESSMENT_PENDING':
            case 'ELIGIBILITY_REVIEW':
                return 1
            case 'ENTITLEMENT_DEFINED':
            case 'PLAN_PREPARED':
                return 2
            case 'APPROVAL_PENDING':
            case 'BENEFIT_APPROVED':
                return 3
            case 'BENEFIT_IN_PROGRESS':
                return 4
            case 'RELOCATION_IN_PROGRESS':
                return 5
            case 'POST_RELOCATION_VERIFICATION':
                return 6
            case 'COMPLETED':
                return 7
            case 'ON_HOLD':
            case 'DISPUTED':
                return 1
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
                    <HeartHandshake className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Statutory R&R Lifecycle Progression
                    </h3>
                </div>
                {isBlocked && (
                    <span className="rounded bg-rust-50 px-2 py-0.5 text-[10px] font-bold text-rust-800 border border-rust-200">
                        PROGRESSION PAUSED ({status.replace(/_/g, ' ')})
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
                {stages.map((stage, idx) => {
                    const isPassed = idx < currentIndex || (idx === 7 && status === 'COMPLETED')
                    const isCurrent = idx === currentIndex && status !== 'COMPLETED'
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
