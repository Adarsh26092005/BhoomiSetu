import { CheckCircle2, Clock, AlertTriangle, ListChecks, ShieldAlert } from 'lucide-react'
import type { PossessionReadinessItem } from '@/types'

interface PossessionReadinessChecklistProps {
    items: PossessionReadinessItem[]
    readinessStatus: 'READY' | 'CONDITIONAL' | 'BLOCKED'
    holdReason?: string
    disputeReason?: string
}

export function PossessionReadinessChecklist({
    items,
    readinessStatus,
    holdReason,
    disputeReason,
}: PossessionReadinessChecklistProps) {
    const metCount = items.filter((i) => i.status === 'MET').length
    const totalCount = items.length
    const percentMet = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <ListChecks className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Statutory Possession Readiness Checklist</h3>
                        <p className="text-[11px] text-ink-500">
                            Pre-requisite legal, financial, and on-ground verification criteria before physical possession
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ink-700">
                        {metCount}/{totalCount} Met ({percentMet}%)
                    </span>
                </div>
            </div>

            {holdReason && (
                <div className="rounded-lg border border-rust-200 bg-rust-50/70 p-3.5 text-xs text-rust-900 flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 text-rust-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <strong className="block font-bold">Judicial Stay / Statutory Hold Active:</strong>
                        <p>{holdReason}</p>
                    </div>
                </div>
            )}

            {disputeReason && (
                <div className="rounded-lg border border-rust-200 bg-rust-50/70 p-3.5 text-xs text-rust-900 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-rust-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <strong className="block font-bold">Title Dispute / Judicial Partition:</strong>
                        <p>{disputeReason}</p>
                    </div>
                </div>
            )}

            {/* Checklist items list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {items.map((item) => {
                    const isMet = item.status === 'MET'
                    const isBlocked = item.status === 'BLOCKED'

                    return (
                        <div
                            key={item.id}
                            className={`rounded-lg border p-3 text-xs flex items-start gap-2.5 transition-colors ${
                                isMet
                                    ? 'border-signal-200 bg-signal-50/40 text-signal-950'
                                    : isBlocked
                                    ? 'border-rust-200 bg-rust-50/40 text-rust-950'
                                    : 'border-amber-200 bg-amber-50/40 text-amber-950'
                            }`}
                        >
                            <div className="shrink-0 mt-0.5">
                                {isMet ? (
                                    <CheckCircle2 className="h-4 w-4 text-signal-600" />
                                ) : isBlocked ? (
                                    <AlertTriangle className="h-4 w-4 text-rust-600" />
                                ) : (
                                    <Clock className="h-4 w-4 text-amber-600" />
                                )}
                            </div>

                            <div className="space-y-0.5 min-w-0 flex-1">
                                <span className="font-semibold block leading-tight">
                                    {item.label}
                                </span>
                                {item.supportingRef && (
                                    <span className="font-mono text-[10px] text-ink-500 block truncate">
                                        Ref: {item.supportingRef}
                                    </span>
                                )}
                            </div>

                            {item.isBlocking && !isMet && (
                                <span className="rounded bg-rust-100 px-1.5 py-0.2 text-[9px] font-bold text-rust-800 uppercase tracking-wider shrink-0">
                                    Blocking
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-ink-500 pt-2 border-t border-ink-100 font-sans">
                <span>
                    <strong>Statutory Rule:</strong> Section 38 RFCTLARR 2013 mandates 80% compensation credit and statutory notice prior to physical possession.
                </span>
                <span className={`font-bold ${readinessStatus === 'READY' ? 'text-signal-700' : 'text-amber-700'}`}>
                    Status: {readinessStatus}
                </span>
            </div>
        </div>
    )
}
