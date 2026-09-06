import { useNavigate } from 'react-router-dom'
import { Flag, ExternalLink, CheckCircle2, Calendar, Award } from 'lucide-react'
import { usePossessionByProject } from '@/hooks/use-possession'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ProjectPossessionCardProps {
    projectId: string
}

export function ProjectPossessionCard({ projectId }: ProjectPossessionCardProps) {
    const navigate = useNavigate()
    const { data: records = [], isLoading } = usePossessionByProject(projectId)

    if (isLoading || records.length === 0) return null

    const totalCount = records.length
    const takenCount = records.filter(
        (r) => r.possessionStatus === 'POSSESSION_TAKEN' || r.possessionStatus === 'CERTIFICATE_PENDING' || r.possessionStatus === 'CERTIFICATE_ISSUED',
    ).length
    const scheduledCount = records.filter((r) => r.possessionStatus === 'SCHEDULED').length
    const certsCount = records.filter((r) => r.possessionStatus === 'CERTIFICATE_ISSUED').length
    const percentTaken = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Scheme Land Possession & Handover Status
                    </h3>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {totalCount} {totalCount === 1 ? 'Cadastral Docket' : 'Cadastral Dockets'}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-lg bg-signal-50/50 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-signal-700 tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Possession Secured ({percentTaken}%)</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-signal-900 block">{takenCount} of {totalCount} Plots</span>
                </div>

                <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Scheduled Drives</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-900 block">{scheduledCount} Plots</span>
                </div>

                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-ink-500 tracking-wider flex items-center gap-1">
                        <Award className="h-3 w-3 text-terracotta-600" />
                        <span>Form 22 Certificates</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-ink-900 block">{certsCount} Handed Over</span>
                </div>

                <div className="flex items-center justify-end">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.possession}?projectId=${projectId}`)}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold w-full cursor-pointer"
                    >
                        <span>View Possession</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
