import { BarChart3, Printer, FileSpreadsheet, ShieldCheck } from 'lucide-react'
import type { AnalyticsPeriod } from '@/types/analytics'
import { Button } from '@/components/ui/button'

interface AnalyticsHeaderProps {
    period: AnalyticsPeriod
    onPeriodChange: (period: AnalyticsPeriod) => void
    onOpenReportBuilder: () => void
    onPrint: () => void
}

const PERIOD_OPTIONS: Array<{ value: AnalyticsPeriod; label: string }> = [
    { value: '30D', label: '30 Days' },
    { value: '90D', label: '90 Days' },
    { value: '6M', label: '6 Months' },
    { value: '12M', label: '12 Months' },
    { value: 'FY', label: 'FY 2025-26' },
    { value: 'ALL', label: 'All Time' },
]

export function AnalyticsHeader({
    period,
    onPeriodChange,
    onOpenReportBuilder,
    onPrint,
}: AnalyticsHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ink-200 pb-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-signal-100 px-2 py-0.5 text-[10px] font-bold text-signal-800 border border-signal-200 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Executive Decision Support</span>
                    </span>
                    <span className="font-mono text-[10px] text-ink-500">
                        SIH-2026 • Statutory RFCTLARR Monitoring
                    </span>
                </div>
                <h1 className="text-xl font-bold text-ink-950 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-terracotta-600" />
                    <span>National Analytics & Executive Intelligence</span>
                </h1>
                <p className="text-xs text-ink-600 max-w-3xl">
                    Unified multi-sector tracking for land acquisition throughput, compensation disbursement velocity, physical possession handovers, and Second Schedule R&R compliance.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {/* Period Selector Pills */}
                <div className="flex items-center rounded-lg border border-ink-200 bg-ink-50/70 p-1 text-xs">
                    {PERIOD_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onPeriodChange(opt.value)}
                            className={`rounded px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                                period === opt.value
                                    ? 'bg-paper text-ink-900 shadow-xs border border-ink-200'
                                    : 'text-ink-600 hover:text-ink-900'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onPrint}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <Printer className="h-3.5 w-3.5 text-ink-600" />
                    <span>Print / PDF</span>
                </Button>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onOpenReportBuilder}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Generate Dossier</span>
                </Button>
            </div>
        </div>
    )
}
