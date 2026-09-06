import { Users, Landmark } from 'lucide-react'
import type { LandownerCompensation } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatINR, formatArea } from '@/lib/format'

interface LandownerCompensationTableProps {
    landowners: LandownerCompensation[]
}

export function LandownerCompensationTable({ landowners }: LandownerCompensationTableProps) {
    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <Users className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Landowner Entitlement & DBT Share Breakdown</h3>
                        <p className="text-[11px] text-ink-500">Co-parcenary ownership quota and individual PFMS disbursement records</p>
                    </div>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {landowners.length} {landowners.length === 1 ? 'Landowner' : 'Co-owners'} Entitled
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-ink-200 bg-ink-50/70 text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                            <th scope="col" className="py-3 px-3">Landowner Name</th>
                            <th scope="col" className="py-3 px-3 text-center">Title Share</th>
                            <th scope="col" className="py-3 px-3">Area Share</th>
                            <th scope="col" className="py-3 px-3 text-right">Market Value</th>
                            <th scope="col" className="py-3 px-3 text-right">100% Solatium</th>
                            <th scope="col" className="py-3 px-3 text-right">Net Payable</th>
                            <th scope="col" className="py-3 px-3 text-right">Disbursed</th>
                            <th scope="col" className="py-3 px-3 text-right">Pending</th>
                            <th scope="col" className="py-3 px-3">DBT Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {landowners.map((lo) => (
                            <tr key={lo.id} className="hover:bg-ink-50/50 transition-colors">
                                {/* Name & Bank Ref */}
                                <td className="py-3 px-3">
                                    <div className="space-y-0.5">
                                        <strong className="text-ink-900 block">{lo.displayName}</strong>
                                        <span className="font-mono text-[10px] text-ink-500 flex items-center gap-1">
                                            <Landmark className="h-3 w-3 text-ink-400" />
                                            <span>{lo.bankReferenceMasked}</span>
                                        </span>
                                    </div>
                                </td>

                                {/* Ownership Share */}
                                <td className="py-3 px-3 text-center">
                                    <span className="font-mono font-bold text-ink-900 bg-ink-100 px-2 py-0.5 rounded border border-ink-200 text-xs">
                                        {Math.round(lo.ownershipShare * 100)}%
                                    </span>
                                </td>

                                {/* Area */}
                                <td className="py-3 px-3 font-mono text-ink-700">
                                    {formatArea(lo.eligibleAreaHectares)}
                                </td>

                                {/* Market Value */}
                                <td className="py-3 px-3 text-right font-mono text-ink-900">
                                    {formatINR(lo.marketValueShareInr)}
                                </td>

                                {/* Solatium */}
                                <td className="py-3 px-3 text-right font-mono text-ink-900">
                                    {formatINR(lo.solatiumShareInr)}
                                </td>

                                {/* Net Payable */}
                                <td className="py-3 px-3 text-right font-mono font-bold text-ink-900">
                                    {formatINR(lo.payableAmountInr)}
                                </td>

                                {/* Disbursed */}
                                <td className="py-3 px-3 text-right font-mono font-bold text-signal-700">
                                    {formatINR(lo.disbursedAmountInr)}
                                </td>

                                {/* Pending */}
                                <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                                    {formatINR(lo.pendingAmountInr)}
                                </td>

                                {/* Payment Status */}
                                <td className="py-3 px-3">
                                    <StatusBadge status={lo.paymentStatus} type="compensation-payment" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
