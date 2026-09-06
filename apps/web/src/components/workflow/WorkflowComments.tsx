import * as React from 'react'
import { MessageSquare, Send, User } from 'lucide-react'
import type { WorkflowComment } from '@/types'
import { useAddWorkflowComment } from '@/hooks/use-workflow'
import { formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface WorkflowCommentsProps {
    workflowTaskId: string
    comments: WorkflowComment[]
}

export function WorkflowComments({ workflowTaskId, comments }: WorkflowCommentsProps) {
    const { mutate: addComment, isPending } = useAddWorkflowComment()
    const [commentText, setCommentText] = React.useState('')

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim()) return

        addComment(
            { id: workflowTaskId, comment: commentText },
            {
                onSuccess: () => {
                    setCommentText('')
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
                        <h3 className="text-sm font-bold text-ink-900">Officer Discussion & Statutory Notes</h3>
                        <p className="text-[11px] text-ink-500">Internal inter-departmental scrutiny observations</p>
                    </div>
                </div>

                <span className="font-mono text-xs text-ink-500">
                    {comments.length} Comments
                </span>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3">
                {comments.length === 0 ? (
                    <p className="text-xs text-ink-400 italic py-3 text-center">
                        No internal scrutiny notes posted yet. Use the form below to record an observation.
                    </p>
                ) : (
                    comments.map((c) => (
                        <div
                            key={c.id}
                            className="rounded-lg border border-ink-100 bg-ink-50/40 p-3.5 space-y-1.5 text-xs"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-ink-500" />
                                    <strong className="text-ink-900">{c.author}</strong>
                                    <span className="text-ink-400 text-[10px]">
                                        ({String(c.authorRole).replace(/_/g, ' ')})
                                    </span>
                                </div>
                                <span className="font-mono text-[10px] text-ink-400">
                                    {formatDateTime(c.createdAt)}
                                </span>
                            </div>

                            <p className="text-ink-800 text-xs pl-5">
                                {c.comment}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Post Comment Form */}
            <form onSubmit={handlePost} className="pt-2 border-t border-ink-100 space-y-2">
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type an internal statutory note, hearing observation, or inter-agency inquiry..."
                    rows={2}
                    className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isPending || !commentText.trim()}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                        <Send className="h-3.5 w-3.5" />
                        <span>Post Statutory Note</span>
                    </Button>
                </div>
            </form>
        </div>
    )
}
