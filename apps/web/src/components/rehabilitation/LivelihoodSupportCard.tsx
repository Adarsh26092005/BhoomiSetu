import { Briefcase, CheckCircle2, Clock, User } from 'lucide-react'
import type { LivelihoodSupport } from '@/types'
import { formatDate } from '@/lib/format'

interface LivelihoodSupportCardProps {
    livelihood?: LivelihoodSupport
}

export function LivelihoodSupportCard({ livelihood }: LivelihoodSupportCardProps) {
    if (!livelihood) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Briefcase className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Livelihood Restoration Support
                    </h3>
                </div>
                <div className="p-4 text-center text-xs text-ink-500 bg-ink-50 rounded-lg border border-ink-100">
                    Livelihood restoration plan under drafting with Agriculture / Skill Development Dept.
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Livelihood Restoration & Skill Training
                    </h3>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {livelihood.status === 'COMPLETED' ? (
                        <span className="text-signal-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Restored</span>
                        </span>
                    ) : (
                        <span className="text-amber-800 font-bold flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>In Progress</span>
                        </span>
                    )}
                </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Original Livelihood Base</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5">{livelihood.livelihoodType}</dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Responsible Officer</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5 flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-ink-400" />
                        <span>{livelihood.responsibleOfficer}</span>
                    </dd>
                </div>

                <div className="sm:col-span-2">
                    <dt className="text-ink-400 font-medium text-[11px]">Support & Grant Scheme</dt>
                    <dd className="font-medium text-ink-800 mt-0.5 leading-relaxed bg-ink-50 p-2.5 rounded-lg border border-ink-100">
                        {livelihood.supportCategory}
                    </dd>
                </div>

                {livelihood.completionDate && (
                    <div className="sm:col-span-2">
                        <dt className="text-ink-400 font-medium text-[11px]">Completion Date</dt>
                        <dd className="font-mono font-bold text-signal-700 mt-0.5">
                            {formatDate(livelihood.completionDate)}
                        </dd>
                    </div>
                )}
            </dl>

            {livelihood.remarks && (
                <div className="text-[11px] text-ink-600 bg-ink-50/50 p-2.5 rounded-lg border border-ink-100 italic">
                    "{livelihood.remarks}"
                </div>
            )}
        </div>
    )
}
