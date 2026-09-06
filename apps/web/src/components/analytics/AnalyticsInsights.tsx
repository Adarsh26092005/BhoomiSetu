import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ShieldAlert, ArrowRight, Info } from 'lucide-react'
import type { AnalyticsInsight } from '@/types/analytics'
import { Button } from '@/components/ui/button'

interface AnalyticsInsightsProps {
    insights: AnalyticsInsight[]
}

export function AnalyticsInsights({ insights }: AnalyticsInsightsProps) {
    const navigate = useNavigate()

    const getSeverityBadge = (sev: AnalyticsInsight['severity']) => {
        switch (sev) {
            case 'CRITICAL':
                return (
                    <span className="rounded bg-rust-100 px-2 py-0.5 text-[10px] font-bold text-rust-800 border border-rust-200 uppercase tracking-wider flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        <span>Critical Bottleneck</span>
                    </span>
                )
            case 'WARNING':
                return (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Attention Required</span>
                    </span>
                )
            case 'INFO':
            default:
                return (
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200 uppercase tracking-wider flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Operational Advisory</span>
                    </span>
                )
        }
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-rust-600" />
                        <h3 className="text-sm font-bold text-ink-900">
                            Deterministic Executive Attention & Exception Engine
                        </h3>
                    </div>
                    <p className="text-[11px] text-ink-500">
                        Rule-based statutory exception detection flagging compensation delays, SLA breaches, and possession barriers
                    </p>
                </div>

                <span className="font-mono text-[11px] text-ink-500 bg-ink-50 px-2.5 py-1 rounded-md border border-ink-200">
                    {insights.length} Exceptions Active
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {insights.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-xl border border-ink-200 bg-ink-50/40 p-4 space-y-3 flex flex-col justify-between hover:border-ink-300 transition-colors"
                    >
                        <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-ink-900 text-xs leading-snug">
                                    {item.title}
                                </h4>
                                {getSeverityBadge(item.severity)}
                            </div>

                            <p className="text-ink-700 text-[11px] leading-relaxed">
                                {item.explanation}
                            </p>

                            <div className="rounded-lg bg-paper p-2.5 border border-ink-200 space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-ink-500 font-bold uppercase tracking-wider">
                                    <span>Recommended Statutory Action</span>
                                    {item.metricValue && (
                                        <span className="text-rust-700 font-mono">{item.metricValue}</span>
                                    )}
                                </div>
                                <p className="text-ink-800 text-[11px] font-medium leading-normal">
                                    {item.recommendedAction}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-ink-100 text-[11px]">
                            <span className="text-ink-500 font-mono truncate max-w-[200px]">
                                {item.affectedEntity}
                            </span>

                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(item.targetRoute)}
                                className="h-7 px-2.5 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                                <span>{item.actionLabel}</span>
                                <ArrowRight className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
