import * as React from 'react'
import { CheckCircle2, XCircle, PauseCircle, ShieldAlert, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import type { WorkflowTask, ProjectStatus } from '@/types'
import { useApproveWorkflow, useRejectWorkflow, usePutWorkflowOnHold } from '@/hooks/use-workflow'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'

interface WorkflowActionPanelProps {
    task: WorkflowTask
}

export function WorkflowActionPanel({ task }: WorkflowActionPanelProps) {
    const { mutate: approve, isPending: isApproving } = useApproveWorkflow()
    const { mutate: reject, isPending: isRejecting } = useRejectWorkflow()
    const { mutate: putOnHold, isPending: isHolding } = usePutWorkflowOnHold()

    const [remarks, setRemarks] = React.useState('')
    const [actionModal, setActionModal] = React.useState<'NONE' | 'APPROVE' | 'REJECT' | 'HOLD'>('NONE')
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

    const isPending = isApproving || isRejecting || isHolding
    const nextStage: ProjectStatus = task.targetStage || 'COMPLETED'

    const handleConfirmAction = () => {
        if (actionModal === 'APPROVE') {
            approve(
                { id: task.id, remarks: remarks || `Approved transition to ${nextStage}` },
                {
                    onSuccess: () => {
                        setActionModal('NONE')
                        setRemarks('')
                        setSuccessMessage(`Statutory approval accorded. Project transitioned to ${nextStage}.`)
                        setTimeout(() => setSuccessMessage(null), 4000)
                    },
                },
            )
        } else if (actionModal === 'REJECT') {
            if (!remarks.trim()) {
                alert('Please enter statutory rejection / remand grounds before proceeding.')
                return
            }
            reject(
                { id: task.id, remarks },
                {
                    onSuccess: () => {
                        setActionModal('NONE')
                        setRemarks('')
                        setSuccessMessage('Workflow item rejected and remanded to proponent agency.')
                        setTimeout(() => setSuccessMessage(null), 4000)
                    },
                },
            )
        } else if (actionModal === 'HOLD') {
            if (!remarks.trim()) {
                alert('Please state the stay order or statutory reason for placing on hold.')
                return
            }
            putOnHold(
                { id: task.id, remarks },
                {
                    onSuccess: () => {
                        setActionModal('NONE')
                        setRemarks('')
                        setSuccessMessage('Statutory progression paused. Project placed ON HOLD.')
                        setTimeout(() => setSuccessMessage(null), 4000)
                    },
                },
            )
        }
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Competent Authority Decision Workstation</h3>
                        <p className="text-[11px] text-ink-500">Statutory gate review and milestone approval actions</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-500">Current Task:</span>
                    <StatusBadge status={task.status} type="workflow" />
                </div>
            </div>

            {successMessage && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3.5 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Stage Transition Projection Card */}
            <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-4 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-600 block">
                    Proposed Statutory Milestone Transition:
                </span>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="space-y-0.5">
                        <span className="text-[10px] text-ink-400 block">Current Project Stage</span>
                        <StatusBadge status={task.currentStage} type="project" />
                    </div>

                    <ArrowRight className="h-4 w-4 text-ink-400 shrink-0 mt-3" />

                    <div className="space-y-0.5">
                        <span className="text-[10px] text-ink-400 block">Target Gate upon Approval</span>
                        <StatusBadge status={nextStage} type="project" />
                    </div>
                </div>

                <p className="text-xs text-ink-600">
                    <strong>Statutory Mandate:</strong> {task.description}
                </p>
            </div>

            {/* Officer Decision Note Input */}
            <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-ink-800">Officer Scrutiny & Statutory Findings Note</label>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter official endorsement notes, objections summary, or statutory remand directions..."
                    rows={3}
                    className="w-full rounded-md border border-ink-300 bg-paper p-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ink-100">
                <span className="text-[11px] text-ink-400 font-mono">
                    Signed Authority: {task.assignedOfficer}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                    {/* On Hold */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || task.status === 'ON_HOLD' || task.status === 'COMPLETED'}
                        onClick={() => {
                            setActionModal('HOLD')
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 border-amber-300 hover:bg-amber-50 cursor-pointer"
                    >
                        <PauseCircle className="h-3.5 w-3.5" />
                        <span>Place On Hold</span>
                    </Button>

                    {/* Reject */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || task.status === 'REJECTED' || task.status === 'COMPLETED'}
                        onClick={() => {
                            setActionModal('REJECT')
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-rust-700 border-rust-300 hover:bg-rust-50 cursor-pointer"
                    >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject & Remand</span>
                    </Button>

                    {/* Approve */}
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isPending || task.status === 'COMPLETED'}
                        onClick={() => {
                            setActionModal('APPROVE')
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve & Advance Gate</span>
                    </Button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {actionModal !== 'NONE' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-900">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">
                                    {actionModal === 'APPROVE' && 'Confirm Statutory Milestone Approval'}
                                    {actionModal === 'REJECT' && 'Confirm Statutory Rejection & Remand'}
                                    {actionModal === 'HOLD' && 'Confirm Placing Project On Hold'}
                                </h3>
                                <p className="text-[11px] text-ink-500 font-mono">Task ID: {task.id}</p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3 text-xs text-ink-700 space-y-1">
                            {actionModal === 'APPROVE' && (
                                <p>
                                    You are confirming that all statutory requirements under <strong>{task.currentStage}</strong> have been verified and the scheme will advance to <strong>{nextStage}</strong>.
                                </p>
                            )}
                            {actionModal === 'REJECT' && (
                                <p>
                                    The proposal will be marked <strong>REJECTED</strong> and remanded to the implementing agency with your recorded findings.
                                </p>
                            )}
                            {actionModal === 'HOLD' && (
                                <p>
                                    Statutory progression will be set to <strong>ON_HOLD</strong> pending resolution of stay orders or hearing inquiries.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                                onClick={() => setActionModal('NONE')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={isPending}
                                onClick={handleConfirmAction}
                                className="flex items-center gap-1.5"
                            >
                                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                <span>Execute Decision</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
