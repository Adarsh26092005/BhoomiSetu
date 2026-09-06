import * as React from 'react'
import { Send, CheckCircle2, IndianRupee, Loader2, AlertCircle } from 'lucide-react'
import type { CompensationRecord } from '@/types'
import { useRecordDisbursement } from '@/hooks/use-compensation'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatINR } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface DisbursementPanelProps {
    record: CompensationRecord
}

export function DisbursementPanel({ record }: DisbursementPanelProps) {
    const { mutate: recordDisbursement, isPending } = useRecordDisbursement()

    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [disburseAmount, setDisburseAmount] = React.useState<number | null>(null)
    const [txnRef, setTxnRef] = React.useState('')
    const [remarks, setRemarks] = React.useState('')
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

    const currentAmount = disburseAmount ?? record.amountPendingInr

    const handleOpenModal = () => {
        setDisburseAmount(record.amountPendingInr)
        setTxnRef(`PFMS-2026-${Date.now().toString().slice(-6)}`)
        setRemarks('')
        setIsModalOpen(true)
    }

    const handleRecordDisbursement = (e: React.FormEvent) => {
        e.preventDefault()
        if (currentAmount <= 0) {
            alert('Please enter a positive disbursement amount.')
            return
        }
        if (currentAmount > record.amountPendingInr) {
            alert(`Disbursement amount cannot exceed pending balance of ${formatINR(record.amountPendingInr)}.`)
            return
        }

        recordDisbursement(
            {
                id: record.id,
                amountInr: Number(currentAmount),
                transactionReference: txnRef,
                remarks: remarks || `DBT credit sanctioned via PFMS reference ${txnRef}`,
            },
            {
                onSuccess: () => {
                    setIsModalOpen(false)
                    setSuccessMessage(`Disbursement of ${formatINR(currentAmount)} successfully recorded in statutory ledger.`)
                    setTimeout(() => setSuccessMessage(null), 4000)
                },
            },
        )
    }

    const isFullyPaid = record.amountPendingInr === 0

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-signal-900 text-paper">
                        <Send className="h-4 w-4 text-signal-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">PFMS Direct Benefit Transfer (DBT) Workstation</h3>
                        <p className="text-[11px] text-ink-500">Aadhaar-seeded direct bank account disbursement pipeline</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-500">DBT Status:</span>
                    <StatusBadge status={record.paymentStatus} type="compensation-payment" />
                </div>
            </div>

            {successMessage && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3.5 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-ink-500 tracking-wider">Total Net Sanction</span>
                    <span className="font-mono font-bold text-sm text-ink-900 block">{formatINR(record.totalPayableAmountInr)}</span>
                </div>

                <div className="rounded-lg bg-signal-50/50 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-signal-700 tracking-wider">Already Credited</span>
                    <span className="font-mono font-bold text-sm text-signal-900 block">{formatINR(record.amountDisbursedInr)}</span>
                </div>

                <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Pending Balance</span>
                    <span className="font-mono font-bold text-sm text-amber-900 block">{formatINR(record.amountPendingInr)}</span>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ink-100">
                <span className="text-[11px] text-ink-500">
                    {isFullyPaid ? (
                        <span className="text-signal-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>100% Entitlement Disbursed & Settled</span>
                        </span>
                    ) : (
                        <span>Ready for DBT disbursement tranche</span>
                    )}
                </span>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isPending || isFullyPaid || record.paymentStatus === 'ON_HOLD' || record.paymentStatus === 'DISPUTED'}
                    onClick={handleOpenModal}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <Send className="h-3.5 w-3.5" />
                    <span>Record DBT Disbursement</span>
                </Button>
            </div>

            {/* Record Disbursement Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-lg bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-100 text-signal-900">
                                <IndianRupee className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Record PFMS Disbursement Tranche</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Case ID: {record.id} • Plot: {record.surveyNumber}</p>
                            </div>
                        </div>

                        <form onSubmit={handleRecordDisbursement} className="space-y-4 text-xs">
                            <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-3 space-y-1">
                                <div className="flex justify-between text-ink-600">
                                    <span>Total Net Payable:</span>
                                    <strong className="font-mono text-ink-900">{formatINR(record.totalPayableAmountInr)}</strong>
                                </div>
                                <div className="flex justify-between text-ink-600">
                                    <span>Already Disbursed:</span>
                                    <strong className="font-mono text-signal-700">{formatINR(record.amountDisbursedInr)}</strong>
                                </div>
                                <div className="flex justify-between text-ink-600 pt-1 border-t border-ink-200">
                                    <span>Maximum Pending Amount:</span>
                                    <strong className="font-mono text-amber-800">{formatINR(record.amountPendingInr)}</strong>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Disbursement Amount (in INR)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={record.amountPendingInr}
                                    value={currentAmount}
                                    onChange={(e) => setDisburseAmount(Number(e.target.value))}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs font-mono font-bold text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                                <span className="text-[10px] text-ink-400">
                                    Format: {formatINR(currentAmount)}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">PFMS / Treasury Transaction Reference</label>
                                <input
                                    type="text"
                                    value={txnRef}
                                    onChange={(e) => setTxnRef(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs font-mono text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Disbursement Remarks / Memo</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter treasury voucher number or batch disbursement details..."
                                    rows={2}
                                    className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-amber-900 flex items-start gap-2 text-[11px]">
                                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                                <span>
                                    <strong>Demo Execution Note:</strong> This action records a simulated statutory DBT entry and updates the frontend financial balance.
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Execute DBT Settlement</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
