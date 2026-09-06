import { AlertTriangle, X, MapPin, ShieldAlert, ArrowRight } from 'lucide-react'
import type { SpatialAttentionItem } from '@/types/gis'
import { Button } from '@/components/ui/button'

interface SpatialAttentionPanelProps {
    items: SpatialAttentionItem[]
    onLocate: (coordinates?: [number, number], parcelIds?: string[]) => void
    onClose: () => void
}

export function SpatialAttentionPanel({
    items,
    onLocate,
    onClose,
}: SpatialAttentionPanelProps) {
    const getSeverityBadge = (severity: SpatialAttentionItem['severity']) => {
        switch (severity) {
            case 'HIGH':
                return (
                    <span className="rounded bg-rust-100 px-2 py-0.5 text-[10px] font-bold text-rust-800 border border-rust-200 uppercase">
                        High Risk
                    </span>
                )
            case 'MEDIUM':
                return (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 uppercase">
                        Medium Attention
                    </span>
                )
            case 'INFO':
                return (
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200 uppercase">
                        Operational Task
                    </span>
                )
            default:
                return (
                    <span className="rounded bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-700 uppercase">
                        Standard
                    </span>
                )
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs">
            <div className="w-full max-w-2xl max-h-[90vh] bg-paper rounded-2xl border border-ink-200 p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-ink-100 pb-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rust-100 text-rust-800">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-ink-900">Spatial Risk & Attention Engine</h2>
                            <p className="text-xs text-ink-500">Deterministic rule-based operational flagging across cadastral boundaries</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-800 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Items List */}
                <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-xl border border-ink-200 bg-ink-50/40 p-4 space-y-2.5 hover:border-ink-300 transition-colors"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-rust-600 shrink-0" />
                                    <span className="font-bold text-ink-900 text-xs">
                                        {item.title}
                                    </span>
                                </div>
                                {getSeverityBadge(item.severity)}
                            </div>

                            <p className="text-ink-700 leading-relaxed text-xs">
                                {item.explanation}
                            </p>

                            <div className="rounded-lg bg-paper p-2.5 border border-ink-200 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block">
                                    Recommended Administrative Action:
                                </span>
                                <p className="text-ink-800 text-[11px] font-medium">
                                    {item.recommendedAction}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-ink-100 text-[11px]">
                                <span className="text-ink-500 font-mono">
                                    {item.affectedAreaHectares ? `${item.affectedAreaHectares} ha Affected` : 'Location Specific'}
                                </span>

                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                        onLocate(item.centerCoordinates, item.parcelIds)
                                        onClose()
                                    }}
                                    className="h-7 px-2.5 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                    <MapPin className="h-3 w-3" />
                                    <span>Locate on Map</span>
                                    <ArrowRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
