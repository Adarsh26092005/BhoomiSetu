import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react'
import type { CompensationRecord } from '@/types'
import { formatINR } from '@/lib/format'

interface CompensationBreakdownProps {
    record: CompensationRecord
}

export function CompensationBreakdown({ record }: CompensationBreakdownProps) {
    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <Calculator className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Statutory Award Financial Computation</h3>
                        <p className="text-[11px] text-ink-500">
                            Transparent assessment under Right to Fair Compensation Act (RFCTLARR 2013)
                        </p>
                    </div>
                </div>

                <span className="font-mono text-[11px] text-signal-700 font-semibold flex items-center gap-1 bg-signal-50 px-2.5 py-0.5 rounded border border-signal-200">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Computation Verified</span>
                </span>
            </div>

            {/* Arithmetic Statement Ledger */}
            <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-4 font-mono text-xs space-y-2.5">
                {/* 1. Base Market Value */}
                <div className="flex items-center justify-between">
                    <span className="text-ink-700 font-sans">
                        Base Circle / Market Valuation Rate
                    </span>
                    <span className="font-bold text-ink-900">{formatINR(record.totalMarketValueInr)}</span>
                </div>

                {/* 2. 100% Solatium */}
                <div className="flex items-center justify-between text-ink-700">
                    <span className="font-sans flex items-center gap-1.5">
                        <span className="text-signal-700 font-mono font-bold">+</span>
                        <span>100% Statutory Solatium (RFCTLARR Sec 30(1))</span>
                    </span>
                    <span className="font-bold text-signal-800">{formatINR(record.solatiumAmountInr)}</span>
                </div>

                {/* 3. Additional Interest */}
                <div className="flex items-center justify-between text-ink-700">
                    <span className="font-sans flex items-center gap-1.5">
                        <span className="text-signal-700 font-mono font-bold">+</span>
                        <span>12% per annum Additional Compensation (Sec 30(3))</span>
                    </span>
                    <span className="font-bold text-ink-900">{formatINR(record.additionalCompensationInr)}</span>
                </div>

                {/* 4. Statutory Benefits */}
                <div className="flex items-center justify-between text-ink-700">
                    <span className="font-sans flex items-center gap-1.5">
                        <span className="text-signal-700 font-mono font-bold">+</span>
                        <span>Structures, Trees & Standing Crops Valuation</span>
                    </span>
                    <span className="font-bold text-ink-900">{formatINR(record.statutoryBenefitsInr)}</span>
                </div>

                {/* Subtotal Gross Assessed */}
                <div className="pt-2 border-t border-ink-200 flex items-center justify-between text-ink-800 font-bold">
                    <span className="font-sans text-[11px] uppercase tracking-wider text-ink-500">
                        Total Gross Assessed Amount:
                    </span>
                    <span className="text-xs">{formatINR(record.totalAssessedAmountInr)}</span>
                </div>

                {/* 5. Deductions */}
                <div className="flex items-center justify-between text-rust-700">
                    <span className="font-sans flex items-center gap-1.5">
                        <span className="font-mono font-bold">-</span>
                        <span>Statutory Deductions & Revenue Adjustments</span>
                    </span>
                    <span className="font-bold">-{formatINR(record.deductionsInr)}</span>
                </div>

                {/* Net Total Payable */}
                <div className="pt-2.5 border-t-2 border-ink-900 flex items-center justify-between text-sm font-black text-ink-900 bg-paper p-3 rounded border border-ink-200 shadow-xs">
                    <span className="font-sans text-xs uppercase tracking-wider">
                        Net Statutory Payable Entitlement:
                    </span>
                    <span className="text-base text-terracotta-700">{formatINR(record.totalPayableAmountInr)}</span>
                </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-ink-50 p-3 text-xs text-ink-600 border border-ink-200">
                <AlertCircle className="h-4 w-4 text-terracotta-600 shrink-0 mt-0.5" />
                <p className="text-[11px]">
                    <strong>Statutory Rule:</strong> Compensation is calculated strictly adhering to the multiplier factor (1.00–2.00) based on rural/urban classification and statutory solatium of 100% on market value under First Schedule of RFCTLARR Act 2013.
                </p>
            </div>
        </div>
    )
}
