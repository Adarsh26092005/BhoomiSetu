import * as React from 'react'
import { FileText, Send, CheckCircle2, Calendar, Loader2 } from 'lucide-react'
import type { PossessionRecord } from '@/types'
import { usePreparePossessionNotice, useIssuePossessionNotice } from '@/hooks/use-possession'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface PossessionNoticeCardProps {
    record: PossessionRecord
}

export function PossessionNoticeCard({ record }: PossessionNoticeCardProps) {
    const { mutate: prepareNotice, isPending: isPreparing } = usePreparePossessionNotice()
    const { mutate: issueNotice, isPending: isIssuing } = useIssuePossessionNotice()

    const [isPrepareModalOpen, setIsPrepareModalOpen] = React.useState(false)
    const [noticeRef, setNoticeRef] = React.useState('')
    const [remarks, setRemarks] = React.useState('')
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const handleOpenPrepareModal = () => {
        setNoticeRef(`POS-NOT-2026-${record.district.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`)
        setRemarks('')
        setIsPrepareModalOpen(true)
    }

    const handlePrepare = (e: React.FormEvent) => {
        e.preventDefault()
        prepareNotice(
            { id: record.id, noticeReference: noticeRef, remarks },
            {
                onSuccess: () => {
                    setIsPrepareModalOpen(false)
                    setSuccessMsg('Form 21 Possession Notice drafted and registered.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const handleIssue = () => {
        if (!confirm(`Are you sure you want to mark Form 21 Notice ${record.noticeReference || ''} as officially served to landowners?`)) {
            return
        }
        issueNotice(
            { id: record.id, remarks: 'Statutory 15-day possession notice officially served to all entitled landowners.' },
            {
                onSuccess: () => {
                    setSuccessMsg('Statutory Notice marked officially issued and served.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const hasNotice = Boolean(record.noticeDate || record.noticeReference)
    const isReady = record.possessionStatus === 'READY_FOR_POSSESSION'
    const isPrepared = record.possessionStatus === 'NOTICE_PREPARED'

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Form 21 Statutory Possession Notice
                    </h3>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {record.noticeReference ?? (isReady ? 'Ready for Draft' : 'Notice Pending')}
                </span>
            </div>

            {successMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Notice Reference Number</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                        {record.noticeReference ?? 'Not Yet Prepared'}
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Notice Service Date</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-ink-500" />
                        <span>{record.noticeDate ? formatDate(record.noticeDate) : 'Pending Publication'}</span>
                    </dd>
                </div>

                <div className="sm:col-span-2">
                    <dt className="text-ink-400 font-medium text-[11px]">Issuing Competent Officer</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5">
                        {record.assignedOfficer} ({record.assignedRole.replace(/_/g, ' ')})
                    </dd>
                </div>
            </dl>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
                {isReady && (
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isPreparing}
                        onClick={handleOpenPrepareModal}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Prepare Form 21 Notice</span>
                    </Button>
                )}

                {isPrepared && (
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isIssuing}
                        onClick={handleIssue}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                        {isIssuing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        <span>Mark Notice Issued</span>
                    </Button>
                )}

                {hasNotice && !isReady && !isPrepared && (
                    <span className="text-signal-700 font-semibold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Form 21 Notice Served & Registered</span>
                    </span>
                )}
            </div>

            {/* Prepare Modal */}
            {isPrepareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-900">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Prepare Form 21 Statutory Notice</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Plot: {record.surveyNumber}</p>
                            </div>
                        </div>

                        <form onSubmit={handlePrepare} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Notice Docket Reference Number</label>
                                <input
                                    type="text"
                                    value={noticeRef}
                                    onChange={(e) => setNoticeRef(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Notice Scope & Officer Instructions</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter details of 15-day eviction timeline and handover terms..."
                                    rows={3}
                                    className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsPrepareModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPreparing} className="flex items-center gap-1.5">
                                    {isPreparing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Register Draft Notice</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
