import * as React from 'react'
import { X, UserCog, CheckCircle2 } from 'lucide-react'
import type { WorkflowTask } from '@/types'
import { MOCK_OFFICER_DIRECTORY } from '@/mock/workflow'
import { useReassignWorkflow } from '@/hooks/use-workflow'
import { Button } from '@/components/ui/button'

interface ReassignWorkflowModalProps {
    isOpen: boolean
    onClose: () => void
    task: WorkflowTask
}

export function ReassignWorkflowModal({ isOpen, onClose, task }: ReassignWorkflowModalProps) {
    const { mutate: reassign, isPending } = useReassignWorkflow()
    const [selectedOfficerIdx, setSelectedOfficerIdx] = React.useState(0)
    const [remarks, setRemarks] = React.useState('')
    const [submitted, setSubmitted] = React.useState(false)

    if (!isOpen) return null

    const handleReassign = (e: React.FormEvent) => {
        e.preventDefault()
        const targetOfficer = MOCK_OFFICER_DIRECTORY[selectedOfficerIdx]
        if (!targetOfficer) return

        reassign(
            {
                id: task.id,
                newOfficer: `${targetOfficer.name} (${targetOfficer.district})`,
                newRole: targetOfficer.role,
                newOrg: targetOfficer.organization,
                remarks: remarks || `Reassigned from ${task.assignedOfficer} to ${targetOfficer.name}`,
            },
            {
                onSuccess: () => {
                    setSubmitted(true)
                    setTimeout(() => {
                        setSubmitted(false)
                        onClose()
                    }, 1200)
                },
            },
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
            <div className="relative w-full max-w-lg bg-paper rounded-xl border border-ink-200 shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 bg-ink-50/70">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-paper">
                            <UserCog className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-ink-900">Reassign Workflow Custody</h2>
                            <p className="text-[11px] text-ink-500">Transfer statutory decision responsibility to designated officer</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        aria-label="Close dialog"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {submitted ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-signal-50 text-signal-700">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-ink-900">Workflow Custody Reassigned</h3>
                        <p className="text-xs text-ink-500 max-w-sm mx-auto">
                            The task and statutory SLA responsibility have been successfully reassigned.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleReassign} className="p-6 space-y-4 text-xs">
                        <div className="rounded-lg border border-ink-200 bg-ink-50 p-3 space-y-1">
                            <span className="font-semibold text-ink-900 block">Current Task Assignment:</span>
                            <p className="text-ink-600">
                                <strong>{task.title}</strong> currently assigned to <strong className="text-terracotta-700">{task.assignedOfficer}</strong> ({task.assignedRole.replace(/_/g, ' ')}).
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-ink-800">Select Target Officer / Authority</label>
                            <select
                                value={selectedOfficerIdx}
                                onChange={(e) => setSelectedOfficerIdx(Number(e.target.value))}
                                className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                            >
                                {MOCK_OFFICER_DIRECTORY.map((off, idx) => (
                                    <option key={off.name} value={idx}>
                                        {off.name} — {off.role.replace(/_/g, ' ')} ({off.district})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-ink-800">Reassignment Order / Transfer Reason</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter administrative transfer memo number or reason for custody transfer..."
                                rows={2}
                                className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                            />
                        </div>

                        <div className="pt-3 border-t border-ink-200 flex items-center justify-end gap-2.5">
                            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                <UserCog className="h-4 w-4" />
                                <span>Confirm Reassignment</span>
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
