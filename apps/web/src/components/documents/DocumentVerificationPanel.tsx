import * as React from 'react'
import { ShieldCheck, Clock, XCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import type { ProjectDocument, VerificationStatus } from '@/types'
import { useVerifyDocument } from '@/hooks/use-documents'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'

interface DocumentVerificationPanelProps {
    document: ProjectDocument
}

export function DocumentVerificationPanel({ document }: DocumentVerificationPanelProps) {
    const { mutate: verifyDoc, isPending } = useVerifyDocument()
    const [remarks, setRemarks] = React.useState(document.remarks || '')
    const [actionSuccessMsg, setActionSuccessMsg] = React.useState<string | null>(null)

    const handleAction = (status: VerificationStatus) => {
        verifyDoc(
            {
                id: document.id,
                newStatus: status,
                remarks: remarks || `Statutory status updated to ${status}`,
            },
            {
                onSuccess: () => {
                    setActionSuccessMsg(`Document successfully transitioned to "${status}"`)
                    setTimeout(() => setActionSuccessMsg(null), 3000)
                },
            },
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Officer Verification & Scrutiny Panel</h3>
                        <p className="text-[11px] text-ink-500">Statutory review, validity sign-off, and defect logging</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-500">Current Status:</span>
                    <StatusBadge status={document.verificationStatus} type="document" />
                </div>
            </div>

            {actionSuccessMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3 text-xs text-signal-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{actionSuccessMsg}</span>
                </div>
            )}

            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                    <strong>Statutory Authority Note:</strong> Actions below simulate Competent Authority verification (LAO / Revenue Officer sign-off).
                </span>
            </div>

            {/* Officer Remarks Field */}
            <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-ink-800">Officer Scrutiny Findings & Remarks</label>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter statutory scrutiny notes, defect points, or gazette verification remarks..."
                    rows={3}
                    className="w-full rounded-md border border-ink-300 bg-paper p-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ink-100">
                <span className="text-[11px] text-ink-400 font-mono">
                    Reviewer: Anand Kumar (LAO Officer)
                </span>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Mark Under Review */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || document.verificationStatus === 'UNDER_REVIEW'}
                        onClick={() => handleAction('UNDER_REVIEW')}
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 border-amber-300 hover:bg-amber-50"
                    >
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                        <span>Mark Under Review</span>
                    </Button>

                    {/* Reject */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || document.verificationStatus === 'REJECTED'}
                        onClick={() => handleAction('REJECTED')}
                        className="flex items-center gap-1.5 text-xs font-semibold text-rust-700 border-rust-300 hover:bg-rust-50"
                    >
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                        <span>Reject / Defective</span>
                    </Button>

                    {/* Verify */}
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isPending || document.verificationStatus === 'VERIFIED'}
                        onClick={() => handleAction('VERIFIED')}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        <span>Statutory Verify & Seal</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
