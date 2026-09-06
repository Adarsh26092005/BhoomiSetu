import { useNavigate } from 'react-router-dom'
import { ExternalLink, Layers, RotateCcw, SearchX, User } from 'lucide-react'
import type { LandParcel } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatINR, formatArea } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ParcelTableProps {
    parcels: LandParcel[]
    onResetFilters?: () => void
    isFiltered?: boolean
}

export function ParcelTable({ parcels, onResetFilters, isFiltered = false }: ParcelTableProps) {
    const navigate = useNavigate()

    if (parcels.length === 0) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
                    <SearchX className="h-7 w-7 text-terracotta-600" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink-900">No Cadastral Parcels Found</h3>
                    <p className="text-xs text-ink-500 max-w-sm mx-auto">
                        No survey plots match your current search query or applied statutory filters. Try modifying your search or resetting all filters.
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
                            <th scope="col" className="py-3.5 px-4">Survey / Khasra No.</th>
                            <th scope="col" className="py-3.5 px-4">Scheme Code</th>
                            <th scope="col" className="py-3.5 px-4">Village & Tehsil</th>
                            <th scope="col" className="py-3.5 px-4">District & State</th>
                            <th scope="col" className="py-3.5 px-4">Land Type</th>
                            <th scope="col" className="py-3.5 px-4 text-right">Area (ha)</th>
                            <th scope="col" className="py-3.5 px-4">Landowner(s)</th>
                            <th scope="col" className="py-3.5 px-4 text-right">Compensation</th>
                            <th scope="col" className="py-3.5 px-4">Status</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {parcels.map((parcel) => {
                            const ownerSummary = parcel.owners
                                .map((o) => `${o.fullName} (${o.shareInParcelPercent}%)`)
                                .join(', ')

                            return (
                                <tr
                                    key={parcel.id}
                                    className="group hover:bg-ink-50/60 transition-colors cursor-pointer"
                                    onClick={() => navigate(ROUTES.parcelDetail(parcel.id))}
                                >
                                    {/* Survey No & ID */}
                                    <td className="py-3.5 px-4">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <Layers className="h-3.5 w-3.5 text-terracotta-600 shrink-0" />
                                                <span className="font-mono font-bold text-xs text-ink-900 group-hover:text-terracotta-700 transition-colors">
                                                    {parcel.surveyNumber}
                                                </span>
                                            </div>
                                            <span className="font-mono text-[10px] text-ink-400 block">
                                                {parcel.id} {parcel.khasraNumber ? `• ${parcel.khasraNumber}` : ''}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Project */}
                                    <td className="py-3.5 px-4 font-mono font-semibold text-xs text-ink-800">
                                        <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] border border-ink-200">
                                            {parcel.projectId}
                                        </span>
                                    </td>

                                    {/* Village & Tehsil */}
                                    <td className="py-3.5 px-4 text-ink-700">
                                        <span className="font-semibold text-ink-900 block text-xs">{parcel.village}</span>
                                        <span className="text-[11px] text-ink-400 block">{parcel.tehsil ?? 'Revenue Circle'}</span>
                                    </td>

                                    {/* District & State */}
                                    <td className="py-3.5 px-4 text-ink-600">
                                        <span className="font-semibold text-ink-900 block text-xs">{parcel.district}</span>
                                        <span className="text-[11px] text-ink-400 block">{parcel.state}</span>
                                    </td>

                                    {/* Land Classification */}
                                    <td className="py-3.5 px-4">
                                        <span className="rounded bg-ink-50 px-2 py-0.5 text-[10px] font-semibold text-ink-800 border border-ink-200 whitespace-nowrap">
                                            {parcel.landType.replace('_', ' ')}
                                        </span>
                                    </td>

                                    {/* Area */}
                                    <td className="py-3.5 px-4 text-right font-mono font-bold text-ink-900 text-xs">
                                        {formatArea(parcel.areaHectares)}
                                    </td>

                                    {/* Landowners */}
                                    <td className="py-3.5 px-4 text-ink-700 max-w-[180px]">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3 text-ink-400 shrink-0" />
                                            <span className="truncate text-xs font-medium" title={ownerSummary}>
                                                {parcel.owners[0]?.fullName ?? 'Unknown'}
                                                {parcel.owners.length > 1 ? ` +${parcel.owners.length - 1} co-owners` : ''}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-ink-400 block pl-4">
                                            {parcel.owners.length} registered {parcel.owners.length === 1 ? 'title' : 'shares'}
                                        </span>
                                    </td>

                                    {/* Compensation */}
                                    <td className="py-3.5 px-4 text-right font-mono font-bold text-ink-900 text-xs">
                                        {formatINR(parcel.compensationInr, { compact: true })}
                                    </td>

                                    {/* Status */}
                                    <td className="py-3.5 px-4">
                                        <StatusBadge status={parcel.status} type="parcel" />
                                    </td>

                                    {/* Action */}
                                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => navigate(ROUTES.parcelDetail(parcel.id))}
                                            className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-ink-800 bg-ink-100 hover:bg-ink-200 transition-colors"
                                            title={`Inspect parcel ${parcel.surveyNumber}`}
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
