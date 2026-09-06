import { useNavigate } from 'react-router-dom'
import { ArrowRight, ExternalLink, Landmark } from 'lucide-react'
import type { AcquisitionProject } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatINR, formatArea } from '@/lib/format'
import { ROUTES } from '@/constants/routes'

interface ProjectRegisterTableProps {
    projects: AcquisitionProject[]
}

export function ProjectRegisterTable({ projects }: ProjectRegisterTableProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper shadow-xs overflow-hidden">
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-ink-200">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper">
                        <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">National Land Acquisition Register</h3>
                        <p className="text-[11px] text-ink-500">Live statutory projects enrolled across all state revenue authorities</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(ROUTES.projects)}
                    className="text-xs font-semibold text-terracotta-700 hover:text-terracotta-900 inline-flex items-center gap-1 self-start sm:self-center"
                >
                    <span>View All {projects.length} Projects</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-ink-200 bg-ink-50/70 text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                            <th scope="col" className="py-3 px-4">Code / Project</th>
                            <th scope="col" className="py-3 px-4">Implementing Agency</th>
                            <th scope="col" className="py-3 px-4">State & Districts</th>
                            <th scope="col" className="py-3 px-4 text-right">Land Area</th>
                            <th scope="col" className="py-3 px-4 text-right">Disbursement (DBT)</th>
                            <th scope="col" className="py-3 px-4">Statutory Stage</th>
                            <th scope="col" className="py-3 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {projects.map((project) => (
                            <tr
                                key={project.id}
                                className="group hover:bg-ink-50/50 transition-colors"
                            >
                                <td className="py-3.5 px-4 font-medium text-ink-900">
                                    <div className="space-y-0.5">
                                        <span className="font-mono font-bold text-xs text-ink-900 block">
                                            {project.code}
                                        </span>
                                        <span className="text-xs text-ink-600 font-normal block max-w-xs truncate" title={project.title}>
                                            {project.title}
                                        </span>
                                    </div>
                                </td>

                                <td className="py-3.5 px-4 text-ink-700">
                                    <span className="max-w-[180px] truncate block text-xs" title={project.implementingAgency}>
                                        {project.implementingAgency}
                                    </span>
                                </td>

                                <td className="py-3.5 px-4 text-ink-600 text-xs">
                                    <span className="font-semibold text-ink-900">{project.state}</span>
                                    <span className="text-ink-400 block text-[11px]">
                                        {project.districts.join(', ')}
                                    </span>
                                </td>

                                <td className="py-3.5 px-4 text-right font-mono font-semibold text-ink-900 text-xs">
                                    {formatArea(project.totalAreaHectares)}
                                </td>

                                <td className="py-3.5 px-4 text-right font-mono text-xs">
                                    <span className="font-semibold text-ink-900 block">
                                        {formatINR(project.disbursedCompensationInr, { compact: true })}
                                    </span>
                                    <span className="text-[10px] text-ink-400 block">
                                        of {formatINR(project.estimatedCompensationInr, { compact: true })}
                                    </span>
                                </td>

                                <td className="py-3.5 px-4">
                                    <StatusBadge status={project.status} />
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate(ROUTES.projectDetail(project.id))}
                                        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-ink-800 bg-ink-100 hover:bg-ink-200 transition-colors"
                                        title={`View details for ${project.code}`}
                                    >
                                        <span>Details</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
