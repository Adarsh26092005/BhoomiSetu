import { useNavigate } from 'react-router-dom'
import { ExternalLink, RotateCcw, SearchX, Flag, Calendar, User, ShieldAlert, CheckCircle2 } from 'lucide-react'
import type { PossessionRecord } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate, formatArea } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface PossessionTableProps {
    records: PossessionRecord[]
    onResetFilters?: () => void
    isFiltered?: boolean
}

export function PossessionTable({ records, onResetFilters, isFiltered = false }: PossessionTableProps) {
    const navigate = useNavigate()

    if (records.length === 0) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
                    <SearchX className="h-7 w-7 text-terracotta-600" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink-900">No Possession Dockets Found</h3>
                    <p className="text-xs text-ink-500 max-w-sm mx-auto">
                        No physical possession cases match your applied search query or status filter.
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
                            <th scope="col" className="py-3.5 px-4">Possession ID & Plot</th>
                            <th scope="col" className="py-3.5 px-4">Scheme Code</th>
                            <th scope="col" className="py-3.5 px-4">Cadastral Area</th>
                            <th scope="col" className="py-3.5 px-4">Village / Tehsil</th>
                            <th scope="col" className="py-3.5 px-4">Handover Type</th>
                            <th scope="col" className="py-3.5 px-4">Possession Stage</th>
                            <th scope="col" className="py-3.5 px-4">Handover Date</th>
                            <th scope="col" className="py-3.5 px-4">Assigned Officer</th>
                            <th scope="col" className="py-3.5 px-4">Readiness</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {records.map((rec) => (
                            <tr
                                key={rec.id}
                                className="group hover:bg-ink-50/60 transition-colors cursor-pointer"
                                onClick={() => navigate(ROUTES.possessionDetail(rec.id))}
                            >
                                {/* ID & Plot */}
                                <td className="py-3.5 px-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <Flag className="h-3.5 w-3.5 text-terracotta-600 shrink-0" />
                                            <span className="font-mono font-bold text-xs text-ink-900 group-hover:text-terracotta-700 transition-colors">
                                                {rec.id}
                                            </span>
                                        </div>
                                        <span className="font-mono text-[10px] text-ink-500 block pl-5">
                                            {rec.surveyNumber} • {rec.parcelId}
                                        </span>
                                    </div>
                                </td>

                                {/* Scheme Code */}
                                <td className="py-3.5 px-4 font-mono text-xs">
                                    <span className="font-bold text-ink-900 block">{rec.projectCode}</span>
                                    <span className="text-[10px] text-ink-500 block truncate max-w-[130px]" title={rec.projectName}>
                                        {rec.projectName}
                                    </span>
                                </td>

                                {/* Cadastral Area */}
                                <td className="py-3.5 px-4">
                                    <span className="font-mono font-bold text-ink-900 block text-xs">
                                        {formatArea(rec.landAreaHectares)}
                                    </span>
                                    <span className="text-[10px] text-ink-500 block truncate max-w-[120px]" title={rec.landClassification}>
                                        {rec.landClassification}
                                    </span>
                                </td>

                                {/* Village / District */}
                                <td className="py-3.5 px-4">
                                    <strong className="text-ink-900 block">{rec.village}</strong>
                                    <span className="text-[10px] text-ink-500 block">
                                        {rec.tehsil}, {rec.district}
                                    </span>
                                </td>

                                {/* Type */}
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={rec.possessionType} type="possession-type" />
                                </td>

                                {/* Possession Stage */}
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={rec.possessionStatus} type="possession" />
                                </td>

                                {/* Handover Date */}
                                <td className="py-3.5 px-4 font-mono text-ink-800">
                                    {rec.possessionDate ? (
                                        <span className="text-signal-800 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-signal-600" />
                                            <span>{formatDate(rec.possessionDate)}</span>
                                        </span>
                                    ) : rec.scheduledDate ? (
                                        <span className="text-amber-800 flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-amber-600" />
                                            <span>{formatDate(rec.scheduledDate)}</span>
                                        </span>
                                    ) : (
                                        <span className="text-ink-400 text-[10px]">Unscheduled</span>
                                    )}
                                </td>

                                {/* Assigned Officer */}
                                <td className="py-3.5 px-4 text-ink-700">
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3 text-ink-400 shrink-0" />
                                        <span className="truncate max-w-[110px]" title={rec.assignedOfficer}>
                                            {rec.assignedOfficer}
                                        </span>
                                    </div>
                                </td>

                                {/* Readiness */}
                                <td className="py-3.5 px-4">
                                    {rec.readinessStatus === 'READY' ? (
                                        <span className="inline-flex items-center gap-1 rounded bg-signal-50 px-2 py-0.5 text-[11px] font-bold text-signal-800 border border-signal-200">
                                            <CheckCircle2 className="h-3 w-3 text-signal-600" />
                                            <span>Ready</span>
                                        </span>
                                    ) : rec.readinessStatus === 'BLOCKED' ? (
                                        <span className="inline-flex items-center gap-1 rounded bg-rust-50 px-2 py-0.5 text-[11px] font-bold text-rust-800 border border-rust-200">
                                            <ShieldAlert className="h-3 w-3 text-rust-600" />
                                            <span>Blocked</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                                            <span>Conditional</span>
                                        </span>
                                    )}
                                </td>

                                {/* Action */}
                                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(ROUTES.possessionDetail(rec.id))}
                                        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-ink-800 bg-ink-100 hover:bg-ink-200 transition-colors cursor-pointer"
                                        title={`Inspect possession docket ${rec.id}`}
                                    >
                                        <span>Dossier</span>
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
