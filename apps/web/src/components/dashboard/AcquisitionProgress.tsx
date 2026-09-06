import type { AcquisitionProject } from '@/types'
import { formatINR, formatArea } from '@/lib/format'
import { MapPin, Banknote, ShieldCheck } from 'lucide-react'

interface AcquisitionProgressProps {
    projects: AcquisitionProject[]
}

export function AcquisitionProgress({ projects }: AcquisitionProgressProps) {
    const totalLandProposedHa = projects.reduce((acc, p) => acc + p.totalAreaHectares, 0)
    const totalLandAcquiredHa = projects.reduce((acc, p) => {
        if (p.status === 'COMPLETED' || p.status === 'POSSESSION_COMPLETED') {
            return acc + p.totalAreaHectares
        }
        if (p.status === 'POSSESSION_PENDING' && p.estimatedCompensationInr > 0) {
            const ratio = Math.min(1, p.disbursedCompensationInr / p.estimatedCompensationInr)
            return acc + p.totalAreaHectares * ratio
        }
        return acc
    }, 0)

    const totalCompensationAssessed = projects.reduce((acc, p) => acc + p.estimatedCompensationInr, 0)
    const totalCompensationDisbursed = projects.reduce((acc, p) => acc + p.disbursedCompensationInr, 0)

    const landProgressPercent = totalLandProposedHa > 0
        ? Math.round((totalLandAcquiredHa / totalLandProposedHa) * 100)
        : 0

    const compProgressPercent = totalCompensationAssessed > 0
        ? Math.round((totalCompensationDisbursed / totalCompensationAssessed) * 100)
        : 0

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-5">
            <div className="border-b border-ink-100 pb-3">
                <h3 className="text-sm font-bold text-ink-900">National Acquisition & Financial Progress</h3>
                <p className="text-xs text-ink-500">
                    Physical land possession handover vs. Direct Benefit Transfer disbursement ratio
                </p>
            </div>

            {/* Main Progress Bars */}
            <div className="space-y-4">
                {/* 1. Land Area Progress */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-semibold text-ink-900">
                            <MapPin className="h-4 w-4 text-terracotta-600" />
                            <span>Physical Land Possession Taken</span>
                        </span>
                        <div className="font-mono text-xs font-bold text-ink-900">
                            <span>{formatArea(totalLandAcquiredHa)}</span>
                            <span className="text-ink-400 font-normal"> / {formatArea(totalLandProposedHa)}</span>
                            <span className="ml-2 rounded bg-terracotta-50 px-1.5 py-0.5 text-terracotta-700 font-sans text-[10px]">
                                {landProgressPercent}%
                            </span>
                        </div>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                        <div
                            className="h-full rounded-full bg-terracotta-600 transition-all duration-500"
                            style={{ width: `${Math.max(4, Math.min(100, landProgressPercent))}%` }}
                        />
                    </div>
                </div>

                {/* 2. Compensation Disbursement Progress */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-semibold text-ink-900">
                            <Banknote className="h-4 w-4 text-signal-600" />
                            <span>Compensation Disbursed (Direct DBT)</span>
                        </span>
                        <div className="font-mono text-xs font-bold text-ink-900">
                            <span>{formatINR(totalCompensationDisbursed, { compact: true })}</span>
                            <span className="text-ink-400 font-normal"> / {formatINR(totalCompensationAssessed, { compact: true })}</span>
                            <span className="ml-2 rounded bg-signal-50 px-1.5 py-0.5 text-signal-700 font-sans text-[10px]">
                                {compProgressPercent}%
                            </span>
                        </div>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                        <div
                            className="h-full rounded-full bg-signal-600 transition-all duration-500"
                            style={{ width: `${Math.max(4, Math.min(100, compProgressPercent))}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Key Efficiency Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-ink-100 text-xs">
                <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3 flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-signal-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="font-semibold text-ink-900">Escrow Account Reconciliation</p>
                        <p className="text-[11px] text-ink-500">100% of released compensation matches verified land title deed ratios.</p>
                    </div>
                </div>

                <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3 flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-terracotta-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="font-semibold text-ink-900">Cadastral Boundary Mapping</p>
                        <p className="text-[11px] text-ink-500">7,715 survey plots linked to state revenue spatial vector layers.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
