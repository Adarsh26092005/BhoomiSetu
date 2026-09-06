import { useNavigate } from 'react-router-dom'
import { Building2, ExternalLink, MapPin, Scale, Layers } from 'lucide-react'
import type { RAndRCase } from '@/types'
import { useProject } from '@/hooks/use-projects'
import { formatINR, formatArea } from '@/lib/format'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface RAndRProjectContextProps {
    record: RAndRCase
}

export function RAndRProjectContext({ record }: RAndRProjectContextProps) {
    const navigate = useNavigate()
    const { data: project } = useProject(record.projectId)

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Acquisition Scheme Context
                    </h3>
                </div>
                {project && <StatusBadge status={project.status} type="project" />}
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div className="sm:col-span-2">
                    <dt className="text-ink-400 font-medium text-[11px]">Scheme Title & Code</dt>
                    <dd className="font-semibold text-ink-900 text-xs mt-0.5">
                        <strong className="font-mono text-terracotta-700">{record.projectCode}</strong> — {record.projectName}
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Implementing Agency</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5">
                        {project?.implementingAgency ?? 'Central / State Authority'}
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">State & Districts</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>{project ? `${project.districts.join(', ')}, ${project.state}` : `${record.district}, ${record.state}`}</span>
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Total Scheme Area</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-ink-500" />
                        <span>{project ? formatArea(project.totalAreaHectares) : 'N/A'}</span>
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Estimated Scheme Budget</dt>
                    <dd className="font-mono font-bold text-signal-700 text-xs mt-0.5 flex items-center gap-1">
                        <Scale className="h-3.5 w-3.5" />
                        <span>{project ? formatINR(project.estimatedCompensationInr, { compact: true }) : 'N/A'}</span>
                    </dd>
                </div>
            </dl>

            <div className="pt-2 border-t border-ink-100">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.projectDetail(record.projectId))}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold w-full cursor-pointer"
                >
                    <span>Open Project Dossier</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}
