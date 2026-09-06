import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, GitBranch, Loader2 } from 'lucide-react'
import { useWorkflowTask } from '@/hooks/use-workflow'
import { WorkflowDetailHeader } from '@/components/workflow/WorkflowDetailHeader'
import { WorkflowProjectContext } from '@/components/workflow/WorkflowProjectContext'
import { WorkflowAssignmentCard } from '@/components/workflow/WorkflowAssignmentCard'
import { WorkflowActionPanel } from '@/components/workflow/WorkflowActionPanel'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { WorkflowComments } from '@/components/workflow/WorkflowComments'
import { WorkflowRelatedDocuments } from '@/components/workflow/WorkflowRelatedDocuments'
import { ReassignWorkflowModal } from '@/components/workflow/ReassignWorkflowModal'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

export function WorkflowDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: task, isLoading } = useWorkflowTask(id)
    const [isReassignModalOpen, setIsReassignModalOpen] = React.useState(false)

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Statutory Workflow Dossier...</p>
            </div>
        )
    }

    if (!task) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rust-50 text-rust-600 border border-rust-200">
                    <GitBranch className="h-7 w-7 text-rust-600" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-ink-900">Workflow Action Item Not Found</h2>
                    <p className="text-xs text-ink-500">
                        No statutory workflow task was found matching identifier <strong className="font-mono text-ink-800">{id}</strong>.
                    </p>
                </div>
                <div className="pt-2">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(ROUTES.workflow)}
                        className="inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to Workflow Queues</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Header & Navigation */}
            <WorkflowDetailHeader task={task} />

            {/* 2. Primary 12-Column Responsive Workspace */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left 8 Cols: Action Panel, Timeline, Comments */}
                <div className="space-y-6 lg:col-span-8">
                    <WorkflowActionPanel task={task} />
                    <WorkflowTimeline history={task.history} />
                    <WorkflowComments workflowTaskId={task.id} comments={task.comments} />
                </div>

                {/* Right 4 Cols: Assignment Card, Scheme Context, Documents */}
                <div className="space-y-6 lg:col-span-4">
                    <WorkflowAssignmentCard
                        task={task}
                        onOpenReassign={() => setIsReassignModalOpen(true)}
                    />
                    <WorkflowProjectContext task={task} />
                    <WorkflowRelatedDocuments projectId={task.projectId} />
                </div>
            </div>

            {/* 3. Reassignment Modal */}
            <ReassignWorkflowModal
                isOpen={isReassignModalOpen}
                onClose={() => setIsReassignModalOpen(false)}
                task={task}
            />
        </div>
    )
}
