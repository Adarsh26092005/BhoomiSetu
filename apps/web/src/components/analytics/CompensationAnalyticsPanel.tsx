import { useNavigate } from 'react-router-dom'
import { IndianRupee, AlertTriangle, ExternalLink } from 'lucide-react'
import type { CompensationAnalytics } from '@/types/analytics'
import { formatINR } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface CompensationAnalyticsPanelProps {
    compensation: CompensationAnalytics
}

export function CompensationAnalyticsPanel({ compensation }: CompensationAnalyticsPanelProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-signal-700" />
                        <span>Compensation Assessment & DBT Disbursement Audit</span>
                    </h3>
                    <p className="text-[11px] text-ink-500">
                        Statutory awards, PFMS direct benefit transfers, and Section 77 escrow deposit ledgers
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.compensation)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
                >
                    <span>Open Compensation Ledger</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Financial Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-bold uppercase tracking-wider block">
                        Assessed Valuation
                    </span>
                    <span className="font-mono text-base font-black text-ink-900 block">
                        {formatINR(compensation.totalAssessedInr, { compact: true })}
                    </span>
                    <span className="text-[10px] text-ink-500">{compensation.awardsDeclaredCount} Awards Declared</span>
                </div>

                <div className="rounded-lg bg-signal-50/60 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] text-signal-800 font-bold uppercase tracking-wider block">
                        Disbursed DBT
                    </span>
                    <span className="font-mono text-base font-black text-signal-950 block">
                        {formatINR(compensation.totalDisbursedInr, { compact: true })}
                    </span>
                    <span className="text-[10px] text-signal-700">{compensation.disbursementRatePercentage}% Paid to Beneficiaries</span>
                </div>

                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                        Pending DBT Release
                    </span>
                    <span className="font-mono text-base font-black text-amber-950 block">
                        {formatINR(compensation.totalPendingInr, { compact: true })}
                    </span>
                    <span className="text-[10px] text-amber-700">{compensation.parcelsPendingDisbursementCount} Plots in pipeline</span>
                </div>

                <div className="rounded-lg bg-rust-50/60 p-3 border border-rust-200 space-y-0.5">
                    <span className="text-[10px] text-rust-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-rust-600" />
                        <span>Held in Escrow</span>
                    </span>
                    <span className="font-mono text-base font-black text-rust-950 block">
                        {formatINR(compensation.heldOrDisputedAmountInr, { compact: true })}
                    </span>
                    <span className="text-[10px] text-rust-700">Section 77 Dispute Deposits</span>
                </div>
            </div>

            {/* Scheme-wise Compensation Table */}
            <div className="space-y-2 pt-2">
                <span className="font-bold text-ink-800 block text-xs">
                    Scheme-Wise Compensation Disbursement Matrix:
                </span>
                <div className="rounded-lg border border-ink-200 overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-ink-50/70 border-b border-ink-100 text-[10px] font-bold text-ink-600 uppercase tracking-wider">
                                <th scope="col" className="py-2 px-3">Scheme Code</th>
                                <th scope="col" className="py-2 px-3">Assessed Amount</th>
                                <th scope="col" className="py-2 px-3">Disbursed DBT</th>
                                <th scope="col" className="py-2 px-3">Pending Amount</th>
                                <th scope="col" className="py-2 px-3">Disbursement %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100">
                            {compensation.projectWiseCompensation.map((p) => (
                                <tr key={p.projectId} className="hover:bg-ink-50/40">
                                    <td className="py-2 px-3 font-mono font-bold text-ink-900">{p.projectCode}</td>
                                    <td className="py-2 px-3 font-mono">{formatINR(p.assessedInr, { compact: true })}</td>
                                    <td className="py-2 px-3 font-mono text-signal-700 font-semibold">{formatINR(p.disbursedInr, { compact: true })}</td>
                                    <td className="py-2 px-3 font-mono text-amber-700">{formatINR(p.pendingInr, { compact: true })}</td>
                                    <td className="py-2 px-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 rounded-full bg-ink-200 overflow-hidden">
                                                <div
                                                    className="h-full bg-signal-600 rounded-full"
                                                    style={{ width: `${p.percentage}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-[11px] font-bold text-ink-800">{p.percentage}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
