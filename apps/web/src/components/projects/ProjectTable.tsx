import { useNavigate } from 'react-router-dom'
import { ExternalLink, Landmark, RotateCcw, SearchX } from 'lucide-react'
import type { AcquisitionProject } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatINR, formatArea } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ProjectTableProps {
    projects: AcquisitionProject[]
    onResetFilters?: () => void
    isFiltered?: boolean
}

export function ProjectTable({ projects, onResetFilters, isFiltered = false }: ProjectTableProps) {
    const navigate = useNavigate()

    if (projects.length === 0) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
                    <SearchX className="h-7 w-7 text-terracotta-600" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink-900">No Projects Match Your Criteria</h3>
                    <p className="text-xs text-ink-500 max-w-sm mx-auto">
                        No land acquisition schemes match the applied search query or statutory filters. Try modifying your search or clearing all filters.
                    </p>
                </div>
                {isFiltered && onResetFilters && (
                    <div className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onResetFilters}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset All Filters</span>
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-ink-200 bg-ink-50/70 text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                            <th scope="col" className="py-3.5 px-4">Code & Project Title</th>
                            <th scope="col" className="py-3.5 px-4">Category</th>
                            <th scope="col" className="py-3.5 px-4">Implementing Agency</th>
                            <th scope="col" className="py-3.5 px-4">State & Districts</th>
                            <th scope="col" className="py-3.5 px-4 text-right">Proposed Land</th>
                            <th scope="col" className="py-3.5 px-4 text-right">Compensation (DBT)</th>
                            <th scope="col" className="py-3.5 px-4">Statutory Stage</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {projects.map((project) => {
                            const compPercent = project.estimatedCompensationInr > 0
                                ? Math.round((project.disbursedCompensationInr / project.estimatedCompensationInr) * 100)
                                : 0

                            return (
                                <tr
                                    key={project.id}
                                    className="group hover:bg-ink-50/60 transition-colors cursor-pointer"
                                    onClick={() => navigate(ROUTES.projectDetail(project.id))}
                                >
                                    {/* Code & Title */}
                                    <td className="py-3.5 px-4">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <Landmark className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                                                <span className="font-mono font-bold text-xs text-ink-900 group-hover:text-terracotta-700 transition-colors">
                                                    {project.code}
                                                </span>
                                            </div>
                                            <span className="text-xs text-ink-700 font-medium block max-w-sm truncate" title={project.title}>
                                                {project.title}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="py-3.5 px-4">
                                        <span className="rounded bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-800 border border-ink-200 whitespace-nowrap">
                                            {project.category.replace('_', ' ')}
                                        </span>
                                    </td>

                                    {/* Implementing Agency */}
                                    <td className="py-3.5 px-4 text-ink-700">
                                        <span
                                            className="max-w-[180px] truncate block text-xs"
                                            title={typeof project.implementingAgency === 'object' ? (project.implementingAgency as any)?.name : project.implementingAgency}
                                        >
                                            {typeof project.implementingAgency === 'object' ? (project.implementingAgency as any)?.name : project.implementingAgency}
                                        </span>
                                    </td>

                                    {/* State & Districts */}
                                    <td className="py-3.5 px-4 text-ink-600 text-xs">
                                        <span className="font-semibold text-ink-900">{project.state}</span>
                                        <span className="text-ink-400 block text-[11px] truncate max-w-[150px]" title={project.districts.join(', ')}>
                                            {project.districts.join(', ')}
                                        </span>
                                    </td>

                                    {/* Proposed Land */}
                                    <td className="py-3.5 px-4 text-right font-mono text-xs">
                                        <span className="font-bold text-ink-900 block">
                                            {formatArea(project.totalAreaHectares)}
                                        </span>
                                        <span className="text-[10px] text-ink-400 block">
                                            {project.parcelCount} parcels
                                        </span>
                                    </td>

                                    {/* Compensation (DBT) */}
                                    <td className="py-3.5 px-4 text-right font-mono text-xs">
                                        <span className="font-bold text-ink-900 block">
                                            {formatINR(project.disbursedCompensationInr, { compact: true })}
                                        </span>
                                        <span className="text-[10px] text-ink-400 block">
                                            {compPercent}% of {formatINR(project.estimatedCompensationInr, { compact: true })}
                                        </span>
                                    </td>

                                    {/* Statutory Stage */}
                                    <td className="py-3.5 px-4">
                                        <StatusBadge status={project.status} />
                                    </td>

                                    {/* Action */}
                                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => navigate(ROUTES.projectDetail(project.id))}
                                            className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-ink-800 bg-ink-100 hover:bg-ink-200 transition-colors"
                                            title={`View details for ${project.code}`}
                                        >
                                            <span>Inspect</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
