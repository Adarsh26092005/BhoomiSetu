import * as React from 'react'
import { MessageSquare, Send, User, Loader2 } from 'lucide-react'
import type { PossessionRemark } from '@/types'
import { useAddPossessionRemark } from '@/hooks/use-possession'
import { formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface PossessionRemarksProps {
    possessionId: string
    remarks: PossessionRemark[]
}

export function PossessionRemarks({ possessionId, remarks }: PossessionRemarksProps) {
    const { mutate: addRemark, isPending } = useAddPossessionRemark()
    const [remarkText, setRemarkText] = React.useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!remarkText.trim()) return

        addRemark(
            { id: possessionId, remark: remarkText },
            {
                onSuccess: () => {
                    setRemarkText('')
                },
            },
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Field Handover Notes & Remarks</h3>
                        <p className="text-[11px] text-ink-500">Internal coordination notes between surveyor, LAO and police officers</p>
                    </div>
                </div>

                <span className="font-mono text-xs text-ink-500">
                    {remarks.length} Entries
                </span>
            </div>

            {/* Add Remark Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
                <textarea
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="Add an operational handover observation or field update..."
                    rows={2}
                    className="w-full rounded-md border border-ink-300 bg-paper p-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isPending || !remarkText.trim()}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        <span>Post Observation</span>
                    </Button>
                </div>
            </form>

            {/* Remarks List */}
            <div className="space-y-3 pt-2 border-t border-ink-100">
                {remarks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-ink-400">
                        No field notes recorded yet.
                    </div>
                ) : (
                    remarks.map((r) => (
                        <div key={r.id} className="rounded-lg bg-ink-50 p-3 text-xs space-y-1 border border-ink-100">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-ink-800 font-semibold">
                                    <User className="h-3.5 w-3.5 text-ink-500" />
                                    <span>{r.author}</span>
                                    <span className="text-[10px] text-ink-500 font-normal">({r.role.replace(/_/g, ' ')})</span>
                                </div>
                                <span className="font-mono text-[10px] text-ink-400">
                                    {formatDateTime(r.timestamp)}
                                </span>
                            </div>
                            <p className="text-ink-700 text-[11px] leading-relaxed">{r.remark}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
