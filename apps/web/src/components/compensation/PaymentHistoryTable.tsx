import { History, Receipt, CheckCircle2 } from 'lucide-react'
import type { CompensationPaymentTransaction } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate, formatINR } from '@/lib/format'

interface PaymentHistoryTableProps {
    transactions: CompensationPaymentTransaction[]
}

export function PaymentHistoryTable({ transactions }: PaymentHistoryTableProps) {
    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <History className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">PFMS Payment Transaction History</h3>
                        <p className="text-[11px] text-ink-500">Auditable record of all disbursed tranches and treasury reference vouchers</p>
                    </div>
                </div>

                <span className="font-mono text-xs text-ink-500">
                    {transactions.length} Transactions
                </span>
            </div>

            {transactions.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-400 bg-ink-50 rounded-lg border border-ink-100">
                    No disbursement tranches recorded yet. Use the DBT workstation to record a payment.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-ink-200 bg-ink-50/70 text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                                <th scope="col" className="py-3 px-3">Transaction Reference</th>
                                <th scope="col" className="py-3 px-3">Date</th>
                                <th scope="col" className="py-3 px-3 text-right">Amount Disbursed</th>
                                <th scope="col" className="py-3 px-3">Recorded By</th>
                                <th scope="col" className="py-3 px-3">Status</th>
                                <th scope="col" className="py-3 px-3">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100 font-sans">
                            {transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-ink-50/50 transition-colors">
                                    <td className="py-3 px-3 font-mono font-bold text-ink-900 flex items-center gap-1.5">
                                        <Receipt className="h-3.5 w-3.5 text-signal-600" />
                                        <span>{t.transactionReference}</span>
                                    </td>
                                    <td className="py-3 px-3 font-mono text-ink-700">
                                        {formatDate(t.date)}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono font-bold text-signal-800">
                                        {formatINR(t.amountInr)}
                                    </td>
                                    <td className="py-3 px-3 text-ink-700">
                                        {t.recordedBy}
                                    </td>
                                    <td className="py-3 px-3">
                                        <StatusBadge status={t.paymentStatus} type="compensation-payment" />
                                    </td>
                                    <td className="py-3 px-3 text-ink-500 text-[11px] max-w-[200px] truncate" title={t.remarks}>
                                        {t.remarks || 'Standard DBT Tranche'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-ink-400 font-mono pt-2 border-t border-ink-100">
                <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-signal-600" />
                    <span>Treasury E-Payment Gateway Cleared</span>
                </span>
                <span>PFMS-Ready Gateway</span>
            </div>
        </div>
    )
}
