import { Layers, CheckSquare, Square } from 'lucide-react'
import type { GisLayer, GisLayerId } from '@/types/gis'

interface GisLayerControlProps {
    layers: GisLayer[]
    onToggleLayer: (layerId: GisLayerId) => void
    onToggleAll: (visible: boolean) => void
}

export function GisLayerControl({ layers, onToggleLayer, onToggleAll }: GisLayerControlProps) {
    const allVisible = layers.every((l) => l.visible)

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-4 shadow-xl space-y-3 w-80 text-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-2.5">
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                        Map Layer Catalog
                    </h3>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                    <button
                        type="button"
                        onClick={() => onToggleAll(!allVisible)}
                        className="text-terracotta-700 hover:text-terracotta-900 font-semibold cursor-pointer"
                    >
                        {allVisible ? 'Hide All' : 'Show All'}
                    </button>
                </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {layers.map((layer) => (
                    <label
                        key={layer.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer select-none ${
                            layer.visible
                                ? 'bg-ink-50/70 border-ink-200 text-ink-900'
                                : 'bg-paper border-ink-100 text-ink-400 opacity-60 hover:opacity-90'
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={layer.visible}
                            onChange={() => onToggleLayer(layer.id)}
                            className="sr-only"
                        />
                        <div className="mt-0.5 shrink-0">
                            {layer.visible ? (
                                <CheckSquare className="h-4 w-4 text-terracotta-600" />
                            ) : (
                                <Square className="h-4 w-4 text-ink-400" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-1.5">
                                <span className="font-bold text-xs truncate flex items-center gap-1.5">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: layer.color }}
                                    />
                                    <span>{layer.label}</span>
                                </span>
                                <span className="font-mono text-[10px] text-ink-500 shrink-0">
                                    {layer.featureCount}
                                </span>
                            </div>
                            <p className="text-[10px] text-ink-500 leading-tight truncate">
                                {layer.description}
                            </p>
                        </div>
                    </label>
                ))}
            </div>

            <div className="pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500 font-mono">
                <span>Active Layers: {layers.filter((l) => l.visible).length} / {layers.length}</span>
                <span className="text-signal-700 font-semibold">PostGIS Vector Ready</span>
            </div>
        </div>
    )
}
