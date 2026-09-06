import { useNavigate } from 'react-router-dom'
import { HeartHandshake, ExternalLink, Users, CheckCheck, Truck, Clock } from 'lucide-react'
import { useRAndRByProject } from '@/hooks/use-rehabilitation'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ProjectRAndRCardProps {
    projectId: string
}

export function ProjectRAndRCard({ projectId }: ProjectRAndRCardProps) {
    const navigate = useNavigate()
    const { data: records = [], isLoading } = useRAndRByProject(projectId)

    if (isLoading || records.length === 0) return null

    const totalCount = records.length
    const totalFamilies = records.reduce((acc, r) => acc + r.affectedFamilyCount, 0)
    const eligibilityPending = records.filter(
        (r) => r.eligibilityStatus === 'PENDING' || r.eligibilityStatus === 'UNDER_REVIEW' || r.eligibilityStatus === 'REQUIRES_DOCUMENTATION',
    ).length
    const benefitsActive = records.filter(
        (r) => r.rAndRStatus === 'BENEFIT_IN_PROGRESS' || r.rAndRStatus === 'BENEFIT_APPROVED',
    ).length
    const relocationActive = records.filter(
        (r) => r.relocationStatus === 'IN_PROGRESS' || r.rAndRStatus === 'RELOCATION_IN_PROGRESS',
    ).length
    const completedCount = records.filter((r) => r.rAndRStatus === 'COMPLETED').length
    const percentDone = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Scheme Rehabilitation & Resettlement (R&R) Progress
                    </h3>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {totalCount} {totalCount === 1 ? 'R&R Docket' : 'R&R Dockets'} ({totalFamilies} Families)
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-ink-500 tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3 text-terracotta-600" />
                        <span>Affected Families</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-ink-900 block">{totalFamilies} Households</span>
                </div>

                <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Eligibility Pending</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-900 block">{eligibilityPending} Cases</span>
                </div>

                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-ink-500 tracking-wider flex items-center gap-1">
                        <Truck className="h-3 w-3 text-amber-600" />
                        <span>Relocation & Benefits</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-ink-900 block">{relocationActive + benefitsActive} Active</span>
                </div>

                <div className="rounded-lg bg-signal-50/50 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-signal-700 tracking-wider flex items-center gap-1">
                        <CheckCheck className="h-3 w-3" />
                        <span>R&R Completed ({percentDone}%)</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-signal-900 block">{completedCount} Settled</span>
                </div>

                <div className="flex items-center justify-end">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.rehabilitation}?projectId=${projectId}`)}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold w-full cursor-pointer"
                    >
                        <span>View R&R</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
