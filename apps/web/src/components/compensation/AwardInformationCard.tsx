import { Award, Calendar, UserCheck, ShieldCheck } from 'lucide-react'
import type { CompensationRecord } from '@/types'
import { formatDate, formatINR } from '@/lib/format'

interface AwardInformationCardProps {
    record: CompensationRecord
}

export function AwardInformationCard({ record }: AwardInformationCardProps) {
    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Gazette Award & Competent Authority
                    </h3>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {record.awardId ?? 'Award Pending'}
                </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Statutory Award Number</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                        {record.awardId ?? 'In Declaration Queue'}
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Declaration Date</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-ink-500" />
                        <span>{record.awardDate ? formatDate(record.awardDate) : 'Pending Publication'}</span>
                    </dd>
                </div>

                <div className="sm:col-span-2">
                    <dt className="text-ink-400 font-medium text-[11px]">Award Authority / Competent Officer</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5 flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>{record.awardAuthority ?? record.assessingOfficer ?? 'Competent Authority LAO'}</span>
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Sanctioned Award Sum</dt>
                    <dd className="font-mono font-bold text-signal-700 text-xs mt-0.5">
                        {formatINR(record.totalPayableAmountInr)}
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Statutory Seal</dt>
                    <dd className="font-medium text-ink-800 mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-signal-600" />
                        <span>Section 19 Gazette Sealed</span>
                    </dd>
                </div>
            </dl>
        </div>
    )
}
