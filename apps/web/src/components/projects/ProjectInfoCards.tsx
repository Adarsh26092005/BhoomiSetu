import { Building, Calendar, DollarSign, Globe, Layers, Scale, ShieldCheck } from 'lucide-react'
import type { AcquisitionProject } from '@/types'
import { formatINR, formatArea, formatDate } from '@/lib/format'
import { StatusBadge } from '@/components/common/StatusBadge'

interface ProjectInfoCardsProps {
    project: AcquisitionProject
}

export function ProjectInfoCards({ project }: ProjectInfoCardsProps) {
    const compPercent = project.estimatedCompensationInr > 0
        ? Math.round((project.disbursedCompensationInr / project.estimatedCompensationInr) * 100)
        : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. General & Agency Overview */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Building className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Proponent & Administrative Scope
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Gazette Project Code</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">{project.code}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Scheme Category</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{project.category.replace('_', ' ')}</dd>
                    </div>

                    <div className="sm:col-span-2">
                        <dt className="text-ink-400 font-medium text-[11px]">Implementing Agency</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{project.implementingAgency}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Statutory Act</dt>
                        <dd className="font-medium text-ink-800 mt-0.5">LARR Act 2013 / Central Gazette</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Current Status</dt>
                        <dd className="mt-1">
                            <StatusBadge status={project.status} />
                        </dd>
                    </div>
                </dl>
            </div>

            {/* 2. Spatial & Geographic Scope */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Globe className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Geospatial & Cadastral Coverage
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">State Authority</dt>
                        <dd className="font-bold text-ink-900 mt-0.5">{project.state}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Covered Districts</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{project.districts.join(', ')}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Total Alignment Area</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {formatArea(project.totalAreaHectares)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Digitized Survey Parcels</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {new Intl.NumberFormat('en-IN').format(project.parcelCount)} Units
                        </dd>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                        <span className="flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5 text-terracotta-600" />
                            <span>Spatial Cadastral Overlay: Active</span>
                        </span>
                        <span className="font-mono text-signal-700 font-semibold">100% Vectorized</span>
                    </div>
                </dl>
            </div>

            {/* 3. Financial & Compensation Overview */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <DollarSign className="h-4 w-4 text-signal-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Compensation & Financial Ledger
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Total Assessed Award</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {formatINR(project.estimatedCompensationInr)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Total Disbursed (DBT)</dt>
                        <dd className="font-mono font-bold text-signal-700 text-xs mt-0.5">
                            {formatINR(project.disbursedCompensationInr)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Disbursement Clearance</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{compPercent}% Completed</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Affected Landowners</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">
                            {new Intl.NumberFormat('en-IN').format(project.affectedLandowners)} Families
                        </dd>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-signal-600" />
                            <span>Escrow Reconciliation: Verified</span>
                        </span>
                        <span className="font-mono text-ink-600">PFMS / Aadhaar DBT</span>
                    </div>
                </dl>
            </div>

            {/* 4. Statutory Dates & Milestones */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Calendar className="h-4 w-4 text-ink-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Statutory Dates & Projections
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Sec. 11 Gazette Notification</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {formatDate(project.notifiedOn)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Target Handover / Completion</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {formatDate(project.targetCompletionOn)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Recorded Milestones</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">
                            {project.timeline.length} Statutory Events
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Statutory Compliance</dt>
                        <dd className="font-semibold text-signal-700 mt-0.5">In Order</dd>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                        <span className="flex items-center gap-1">
                            <Scale className="h-3.5 w-3.5 text-terracotta-600" />
                            <span>Statutory Timeline Adherence</span>
                        </span>
                        <span className="font-mono text-ink-700 font-semibold">On Schedule</span>
                    </div>
                </dl>
            </div>
        </div>
    )
}
