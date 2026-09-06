import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Clock, ShieldAlert } from 'lucide-react'
import type { AcquisitionProject } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ROUTES } from '@/constants/routes'

interface AttentionRequiredProps {
    projects: AcquisitionProject[]
}

export function AttentionRequired({ projects }: AttentionRequiredProps) {
    const navigate = useNavigate()

    // Filter projects that need administrative attention or intervention
    const attentionProjects = projects.filter((p) =>
        ['ON_HOLD', 'REJECTED', 'UNDER_SCRUTINY', 'DOCUMENT_VERIFICATION', 'POSSESSION_PENDING', 'R_AND_R_IN_PROGRESS'].includes(
            p.status,
        ),
    )

    const getAttentionReason = (project: AcquisitionProject): { text: string; severity: 'high' | 'medium' | 'info' } => {
        if (project.status === 'ON_HOLD') {
            return { text: 'Court stay order pending High Court hearing / Litigation review', severity: 'high' }
        }
        if (project.status === 'UNDER_SCRUTINY') {
            return { text: 'Section 15 objection period ending in 4 days across 3 villages', severity: 'medium' }
        }
        if (project.status === 'POSSESSION_PENDING') {
            return { text: 'Compensation 90% disbursed; ready for physical possession schedule', severity: 'info' }
        }
        if (project.status === 'DOCUMENT_VERIFICATION') {
            return { text: 'Drone survey & revenue map verification awaiting LAO sign-off', severity: 'medium' }
        }
        return { text: 'Statutory milestone pending officer review', severity: 'medium' }
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-rust-50 text-rust-600 border border-rust-200">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Priority Attention Required</h3>
                        <p className="text-[11px] text-ink-500">
                            {attentionProjects.length} projects requiring statutory intervention, hearing review, or sign-off
                        </p>
                    </div>
                </div>

                <span className="rounded-full bg-rust-100 px-2 py-0.5 text-[10px] font-bold text-rust-800">
                    {attentionProjects.length} Action Items
                </span>
            </div>

            <div className="space-y-3">
                {attentionProjects.map((project) => {
                    const reason = getAttentionReason(project)
                    return (
                        <div
                            key={project.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-ink-200 bg-ink-50/40 p-3.5 transition-all hover:border-ink-300 hover:bg-paper hover:shadow-xs"
                        >
                            <div className="space-y-1 max-w-xl">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-ink-900">{project.code}</span>
                                    <StatusBadge status={project.status} />
                                    <span className="text-[10px] text-ink-400 font-medium">
                                        • {project.districts.join(', ')} ({project.state})
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-ink-800">{project.title}</p>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    {reason.severity === 'high' ? (
                                        <ShieldAlert className="h-3.5 w-3.5 text-rust-600 shrink-0" />
                                    ) : (
                                        <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                    )}
                                    <span
                                        className={
                                            reason.severity === 'high'
                                                ? 'text-rust-700 font-medium'
                                                : 'text-amber-800 font-medium'
                                        }
                                    >
                                        {reason.text}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.projectDetail(project.id))}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-700 hover:text-terracotta-900 group-hover:underline self-end sm:self-center shrink-0 cursor-pointer"
                            >
                                <span>Review Case</span>
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
