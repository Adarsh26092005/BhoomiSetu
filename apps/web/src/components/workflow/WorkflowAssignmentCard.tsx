import { UserCheck, Calendar, Clock, ShieldCheck, UserCog } from 'lucide-react'
import type { WorkflowTask } from '@/types'
import { formatDate } from '@/lib/format'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'

interface WorkflowAssignmentCardProps {
    task: WorkflowTask
    onOpenReassign: () => void
}

export function WorkflowAssignmentCard({ task, onOpenReassign }: WorkflowAssignmentCardProps) {
    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Officer Assignment & SLA Control
                    </h3>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenReassign}
                    className="flex items-center gap-1.5 text-xs font-semibold"
                >
                    <UserCog className="h-3.5 w-3.5 text-ink-600" />
                    <span>Reassign Task</span>
                </Button>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Assigned Officer</dt>
                    <dd className="font-bold text-ink-900 text-xs mt-0.5">{task.assignedOfficer}</dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Designation & Role</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5">{task.assignedRole.replace(/_/g, ' ')}</dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Statutory Organization</dt>
                    <dd className="font-medium text-ink-800 mt-0.5">{String(task.assignedOrganization).replace(/_/g, ' ')}</dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Turnaround Deadline</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-ink-500" />
                        <span>{formatDate(task.dueAt)}</span>
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">SLA Duration</dt>
                    <dd className="font-mono text-ink-900 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-ink-500" />
                        <span>{task.slaDays} Calendar Days</span>
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">SLA Compliance Status</dt>
                    <dd className="mt-1">
                        <StatusBadge status={task.slaStatus} type="sla" />
                    </dd>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                    <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-signal-600" />
                        <span>Competent Authority Mandate</span>
                    </span>
                    <span className="font-mono text-ink-700 font-semibold">Active Jurisdiction</span>
                </div>
            </dl>
        </div>
    )
}
