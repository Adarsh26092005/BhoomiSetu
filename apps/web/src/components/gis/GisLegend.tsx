import { Info } from 'lucide-react'
import type { GisLayer } from '@/types/gis'

interface GisLegendProps {
    layers: GisLayer[]
}

export function GisLegend({ layers }: GisLegendProps) {
    const isParcelsVisible = layers.find((l) => l.id === 'cadastral-parcels')?.visible
    const isCorridorsVisible = layers.find((l) => l.id === 'project-corridors')?.visible
    const isProjectsVisible = layers.find((l) => l.id === 'project-locations')?.visible
    const isDisputesVisible = layers.find((l) => l.id === 'disputed-parcels')?.visible

    return (
        <div className="rounded-xl border border-ink-200 bg-paper/95 backdrop-blur-xs p-3.5 shadow-xl space-y-3 w-64 text-xs">
            <div className="flex items-center gap-1.5 border-b border-ink-100 pb-2 text-ink-800 font-bold uppercase tracking-wider text-[11px]">
                <Info className="h-3.5 w-3.5 text-terracotta-600" />
                <span>Map Symbology Legend</span>
            </div>

            {/* Parcel Status Symbology */}
            {isParcelsVisible && (
                <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block">
                        Cadastral Parcel Status
                    </span>
                    <div className="grid grid-cols-1 gap-1 text-[11px] text-ink-700">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-xs bg-[#16a34a] border border-[#15803d]" />
                            <span>Possession Taken / Paid</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-xs bg-[#0284c7] border border-[#0369a1]" />
                            <span>Award Declared</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-xs bg-[#eab308] border border-[#ca8a04]" />
                            <span>Under Acquisition / Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-xs bg-[#dc2626] border border-[#b91c1c]" />
                            <span>Disputed / Litigation</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Project Nodes */}
            {isProjectsVisible && (
                <div className="space-y-1.5 pt-1 border-t border-ink-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block">
                        Project Headquarters & Alignments
                    </span>
                    <div className="space-y-1 text-[11px] text-ink-700">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-[#b91c1c] ring-2 ring-terracotta-300" />
                            <span>Scheme Centroid Node</span>
                        </div>
                        {isCorridorsVisible && (
                            <div className="flex items-center gap-2">
                                <span className="h-0.5 w-4 bg-[#f97316]" />
                                <span>Right of Way (RoW) Alignment</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-3 border border-dashed border-slate-500 bg-slate-100/60" />
                            <span>District Administrative Bounds</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispute Warning */}
            {isDisputesVisible && (
                <div className="rounded-md bg-rust-50 p-2 border border-rust-200 text-[10px] text-rust-800 space-y-0.5">
                    <span className="font-bold block">Red Hash / Boundary</span>
                    <span>Indicates active stay order or title conflict.</span>
                </div>
            )}
        </div>
    )
}
