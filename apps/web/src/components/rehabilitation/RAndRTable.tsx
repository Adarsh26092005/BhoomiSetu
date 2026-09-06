import { useNavigate } from 'react-router-dom'
import { ExternalLink, RotateCcw, SearchX, Users, User, HeartHandshake } from 'lucide-react'
import type { RAndRCase } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface RAndRTableProps {
    records: RAndRCase[]
    onResetFilters?: () => void
    isFiltered?: boolean
}

export function RAndRTable({ records, onResetFilters, isFiltered = false }: RAndRTableProps) {
    const navigate = useNavigate()

    if (records.length === 0) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
                    <SearchX className="h-7 w-7 text-terracotta-600" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink-900">No R&R Cases Found</h3>
                    <p className="text-xs text-ink-500 max-w-sm mx-auto">
                        No rehabilitation & resettlement cases match your applied search query or status filter.
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
                            <th scope="col" className="py-3.5 px-4">Case ID & Household</th>
                            <th scope="col" className="py-3.5 px-4">Scheme Code</th>
                            <th scope="col" className="py-3.5 px-4">Plot & Village</th>
                            <th scope="col" className="py-3.5 px-4">Family Size</th>
                            <th scope="col" className="py-3.5 px-4">Eligibility</th>
                            <th scope="col" className="py-3.5 px-4">R&R Stage</th>
                            <th scope="col" className="py-3.5 px-4">Benefit Status</th>
                            <th scope="col" className="py-3.5 px-4">Relocation</th>
                            <th scope="col" className="py-3.5 px-4">Assigned Officer</th>
                            <th scope="col" className="py-3.5 px-4">Last Updated</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {records.map((rec) => {
                            const totalApproved = rec.benefits.reduce((acc, b) => acc + b.approvedValue, 0)
                            const totalDelivered = rec.benefits.reduce((acc, b) => acc + b.deliveredValue, 0)
                            const percentDelivered = totalApproved > 0 ? Math.round((totalDelivered / totalApproved) * 100) : 0

                            return (
                                <tr
                                    key={rec.id}
                                    className="group hover:bg-ink-50/60 transition-colors cursor-pointer"
                                    onClick={() => navigate(ROUTES.rehabilitationDetail(rec.id))}
                                >
                                    {/* Case ID & Household */}
                                    <td className="py-3.5 px-4">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <HeartHandshake className="h-3.5 w-3.5 text-terracotta-600 shrink-0" />
                                                <span className="font-mono font-bold text-xs text-ink-900 group-hover:text-terracotta-700 transition-colors">
                                                    {rec.id}
                                                </span>
                                            </div>
                                            <span className="font-mono text-[10px] text-ink-500 block pl-5">
                                                Ref: {rec.household.householdReference}
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

                                    {/* Plot & Village */}
                                    <td className="py-3.5 px-4">
                                        <span className="font-mono font-bold text-ink-900 block text-xs">
                                            {rec.surveyNumber}
                                        </span>
                                        <span className="text-[10px] text-ink-500 block truncate max-w-[120px]" title={`${rec.village}, ${rec.district}`}>
                                            {rec.village}, {rec.district}
                                        </span>
                                    </td>

                                    {/* Family Size */}
                                    <td className="py-3.5 px-4 font-mono">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5 text-ink-400" />
                                            <span className="font-bold text-ink-900">{rec.household.familySize} Members</span>
                                        </div>
                                        <span className="text-[10px] text-ink-500 block">
                                            {rec.household.vulnerableMemberCount > 0 ? `${rec.household.vulnerableMemberCount} Vulnerable` : 'General'}
                                        </span>
                                    </td>

                                    {/* Eligibility */}
                                    <td className="py-3.5 px-4">
                                        <StatusBadge status={rec.eligibilityStatus} type="randr-eligibility" />
                                    </td>

                                    {/* R&R Stage */}
                                    <td className="py-3.5 px-4">
                                        <StatusBadge status={rec.rAndRStatus} type="randr" />
                                    </td>

                                    {/* Benefit Progress */}
                                    <td className="py-3.5 px-4 font-mono text-xs">
                                        {totalApproved > 0 ? (
                                            <div>
                                                <span className="font-bold text-ink-900 block">
                                                    ₹{(totalDelivered / 100000).toFixed(1)}L / ₹{(totalApproved / 100000).toFixed(1)}L
                                                </span>
                                                <span className="text-[10px] text-signal-700 block font-semibold">
                                                    {percentDelivered}% Delivered
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-ink-400 text-[10px]">Non-Monetary</span>
                                        )}
                                    </td>

                                    {/* Relocation */}
                                    <td className="py-3.5 px-4">
                                        <StatusBadge status={rec.relocationStatus} type="randr-relocation" />
                                    </td>

                                    {/* Assigned Officer */}
                                    <td className="py-3.5 px-4 text-ink-700">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                                            <span className="truncate max-w-[110px]" title={rec.assignedOfficer}>
                                                {rec.assignedOfficer}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Last Updated */}
                                    <td className="py-3.5 px-4 font-mono text-ink-500 text-[11px]">
                                        {formatDate(rec.updatedAt)}
                                    </td>

                                    {/* Action */}
                                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => navigate(ROUTES.rehabilitationDetail(rec.id))}
                                            className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-ink-800 bg-ink-100 hover:bg-ink-200 transition-colors cursor-pointer"
                                            title={`Inspect R&R case ${rec.id}`}
                                        >
                                            <span>Dossier</span>
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
