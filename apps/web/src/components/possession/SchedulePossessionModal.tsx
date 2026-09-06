import * as React from 'react'
import { Calendar, User, Loader2 } from 'lucide-react'
import type { PossessionRecord } from '@/types'
import { useSchedulePossession } from '@/hooks/use-possession'
import { Button } from '@/components/ui/button'

interface SchedulePossessionModalProps {
    record: PossessionRecord
    isOpen: boolean
    onClose: () => void
}

export function SchedulePossessionModal({ record, isOpen, onClose }: SchedulePossessionModalProps) {
    const { mutate: schedulePossession, isPending } = useSchedulePossession()

    const [scheduledDate, setScheduledDate] = React.useState(
        record.scheduledDate ?? '2026-09-15',
    )
    const [officer, setOfficer] = React.useState(record.assignedOfficer ?? 'Anand Kumar')
    const [remarks, setRemarks] = React.useState('')

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        schedulePossession(
            { id: record.id, scheduledDate, officer, remarks },
            {
                onSuccess: () => {
                    onClose()
                },
            },
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-900">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Schedule Physical Possession Drive</h3>
                        <p className="text-[11px] text-ink-500 font-mono">Case ID: {record.id} • Plot: {record.surveyNumber}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                        <label className="font-semibold text-ink-800 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-ink-500" />
                            <span>Designated Possession Date</span>
                        </label>
                        <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            required
                            className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="font-semibold text-ink-800 flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-ink-500" />
                            <span>Designated Possession Officer</span>
                        </label>
                        <input
                            type="text"
                            value={officer}
                            onChange={(e) => setOfficer(e.target.value)}
                            required
                            className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="font-semibold text-ink-800">Operational Logistical Notes / Police Bandobast</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter revenue inspector coordination, survey pillar markers, or boundary clearance details..."
                            rows={3}
                            className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>Schedule Possession</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
