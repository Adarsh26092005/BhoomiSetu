import { useNavigate } from 'react-router-dom'
import { ExternalLink, RotateCcw, SearchX, Users, Scale } from 'lucide-react'
import type { CompensationRecord } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatINR, formatArea } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface CompensationTableProps {
    records: CompensationRecord[]
    onResetFilters?: () => void
    isFiltered?: boolean
}

export function CompensationTable({ records, onResetFilters, isFiltered = false }: CompensationTableProps) {
    const navigate = useNavigate()

    if (records.length === 0) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
                    <SearchX className="h-7 w-7 text-terracotta-600" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink-900">No Compensation Cases Found</h3>
                    <p className="text-xs text-ink-500 max-w-sm mx-auto">
                        No entitlement records or disbursement cases match your applied search query or status filter.
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
                            <th scope="col" className="py-3.5 px-4">Compensation ID & Plot</th>
                            <th scope="col" className="py-3.5 px-4">Scheme Code</th>
                            <th scope="col" className="py-3.5 px-4">Cadastral Area</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Owners</th>
                            <th scope="col" className="py-3.5 px-4 text-right">Gross Assessed</th>
                            <th scope="col" className="py-3.5 px-4 text-right">Net Payable</th>
                            <th scope="col" className="py-3.5 px-4 text-right">DBT Disbursed</th>
                            <th scope="col" className="py-3.5 px-4 text-right">Balance Pending</th>
                            <th scope="col" className="py-3.5 px-4">Assessment Stage</th>
                            <th scope="col" className="py-3.5 px-4">Payment Status</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {records.map((rec) => (
                            <tr
                                key={rec.id}
                                className="group hover:bg-ink-50/60 transition-colors cursor-pointer"
                                onClick={() => navigate(ROUTES.compensationDetail(rec.id))}
                            >
                                {/* ID & Plot */}
                                <td className="py-3.5 px-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <Scale className="h-3.5 w-3.5 text-terracotta-600 shrink-0" />
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

                                {/* Cadastral Area & Classification */}
                                <td className="py-3.5 px-4">
                                    <span className="font-mono font-bold text-ink-900 block text-xs">
                                        {formatArea(rec.landAreaHectares)}
                                    </span>
                                    <span className="text-[10px] text-ink-500 block truncate max-w-[120px]" title={rec.landClassification}>
                                        {rec.landClassification}
                                    </span>
                                </td>

                                {/* Landowners */}
                                <td className="py-3.5 px-4 text-center">
                                    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-ink-800 bg-ink-100 px-2 py-0.5 rounded border border-ink-200">
                                        <Users className="h-3 w-3 text-ink-500" />
                                        <span>{rec.landownerCount}</span>
                                    </span>
                                </td>

                                {/* Gross Assessed */}
                                <td className="py-3.5 px-4 text-right font-mono font-bold text-ink-900">
                                    {formatINR(rec.totalAssessedAmountInr)}
                                </td>

                                {/* Net Payable */}
                                <td className="py-3.5 px-4 text-right font-mono font-black text-ink-900">
                                    {formatINR(rec.totalPayableAmountInr)}
                                </td>

                                {/* DBT Disbursed */}
                                <td className="py-3.5 px-4 text-right font-mono font-bold text-signal-700">
                                    {formatINR(rec.amountDisbursedInr)}
                                </td>

                                {/* Balance Pending */}
                                <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                                    {formatINR(rec.amountPendingInr)}
                                </td>

                                {/* Assessment Stage */}
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={rec.assessmentStatus} type="compensation-assessment" />
                                </td>

                                {/* Payment Status */}
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={rec.paymentStatus} type="compensation-payment" />
                                </td>

                                {/* Action */}
                                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(ROUTES.compensationDetail(rec.id))}
                                        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-ink-800 bg-ink-100 hover:bg-ink-200 transition-colors cursor-pointer"
                                        title={`Inspect compensation case ${rec.id}`}
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
