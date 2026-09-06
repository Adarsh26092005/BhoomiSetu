import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Landmark, Layers, FileStack, Map, Calendar, Scale, IndianRupee } from 'lucide-react'
import type { CompensationRecord } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate, formatINR } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface CompensationDetailHeaderProps {
    record: CompensationRecord
}

export function CompensationDetailHeader({ record }: CompensationDetailHeaderProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-3">
                <button
                    type="button"
                    onClick={() => navigate(ROUTES.compensation)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Compensation Register</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-ink-500 font-mono">
                    <span>Dossier Ref: <strong className="text-ink-900">{record.id}</strong></span>
                </div>
            </div>

            {/* Main Title & Scope Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-ink-900 bg-ink-100 px-2.5 py-0.5 rounded border border-ink-200">
                            {record.id}
                        </span>
                        <StatusBadge status={record.assessmentStatus} type="compensation-assessment" />
                        <StatusBadge status={record.paymentStatus} type="compensation-payment" />
                        <span className="rounded bg-ink-100 px-2 py-0.5 text-[11px] font-mono font-bold text-ink-800 border border-ink-200">
                            {record.surveyNumber}
                        </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                        Compensation & Award Entitlement Dossier
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-ink-600">
                        <span className="flex items-center gap-1 font-mono text-ink-900 font-semibold">
                            <Landmark className="h-3.5 w-3.5 text-terracotta-600" />
                            <span>{record.projectCode} — {record.projectName}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Scale className="h-3.5 w-3.5 text-ink-500" />
                            <span>Assessment Ref: {record.assessmentId}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-ink-500 font-mono">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Assessed: {formatDate(record.assessmentDate)}</span>
                        </span>
                    </div>
                </div>

                {/* Module Action Shortcuts */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.projectDetail(record.projectId))}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <Landmark className="h-3.5 w-3.5 text-ink-600" />
                        <span>Scheme Dossier</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.parcelDetail(record.parcelId))}
                        className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/50"
                    >
                        <Layers className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>Plot: {record.parcelId}</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.documents}?projectId=${record.projectId}&parcelId=${record.parcelId}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <FileStack className="h-3.5 w-3.5 text-ink-600" />
                        <span>Vault Documents</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.gis}?parcelId=${record.parcelId}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/50"
                    >
                        <Map className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>View on GIS</span>
                    </Button>
                </div>
            </div>

            {/* Financial Quick Totals Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-ink-100 text-xs">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] text-ink-500 block font-medium">Net Statutory Payable</span>
                        <span className="font-mono font-black text-sm text-ink-900 block">
                            {formatINR(record.totalPayableAmountInr)}
                        </span>
                    </div>
                    <IndianRupee className="h-5 w-5 text-ink-400" />
                </div>

                <div className="rounded-lg bg-signal-50/60 p-3 border border-signal-200 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] text-signal-700 block font-medium">DBT Disbursed Amount</span>
                        <span className="font-mono font-black text-sm text-signal-900 block">
                            {formatINR(record.amountDisbursedInr)}
                        </span>
                    </div>
                    <IndianRupee className="h-5 w-5 text-signal-600" />
                </div>

                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] text-amber-700 block font-medium">Balance Pending Disbursement</span>
                        <span className="font-mono font-black text-sm text-amber-900 block">
                            {formatINR(record.amountPendingInr)}
                        </span>
                    </div>
                    <IndianRupee className="h-5 w-5 text-amber-600" />
                </div>
            </div>
        </div>
    )
}
