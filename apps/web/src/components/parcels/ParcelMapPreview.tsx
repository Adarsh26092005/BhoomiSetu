import { useNavigate } from 'react-router-dom'
import { Map, MapPin, Maximize2, Layers } from 'lucide-react'
import type { LandParcel } from '@/types'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ParcelMapPreviewProps {
    parcel: LandParcel
}

export function ParcelMapPreview({ parcel }: ParcelMapPreviewProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-terracotta-50 text-terracotta-700">
                        <Map className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Geospatial Cadastral Preview</h3>
                        <p className="text-[11px] text-ink-500">PostGIS spatial vector boundary & centroid coordinates</p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.gis)}
                    className="flex items-center gap-1.5 text-xs font-semibold"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Open GIS Cadastre</span>
                </Button>
            </div>

            {/* Spatial Visual Grid Canvas */}
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-ink-200 bg-ink-950 flex flex-col items-center justify-center text-paper">
                {/* SVG Vector Cadastral Grid representation */}
                <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="cadastre-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#cadastre-grid)" />
                    </svg>
                </div>

                {/* Simulated Cadastral Polygon Polygon Outline */}
                <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-600/80 text-paper ring-8 ring-terracotta-500/20 shadow-lg animate-pulse">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-paper block">
                            {parcel.centroid.lat.toFixed(5)}° N, {parcel.centroid.lng.toFixed(5)}° E
                        </span>
                        <span className="font-mono text-[10px] text-ink-400 block">
                            Survey Plot {parcel.surveyNumber} • {parcel.gisPolygonReference ?? 'POLY-PENDING'}
                        </span>
                    </div>
                </div>

                {/* Bottom Overlay Status Pill */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-ink-400">
                    <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-terracotta-400" />
                        <span>CRS: EPSG:4326 (WGS84)</span>
                    </span>
                    <span className="rounded bg-ink-800/80 px-2 py-0.5 text-signal-400">
                        PostGIS Geometry: Ready
                    </span>
                </div>
            </div>

            {/* Quick Coordinate Summary */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="rounded border border-ink-200 bg-ink-50/50 p-2.5">
                    <span className="text-ink-400 block text-[10px] uppercase">Centroid Coordinate</span>
                    <strong className="text-ink-900">{parcel.centroid.lat.toFixed(5)} N, {parcel.centroid.lng.toFixed(5)} E</strong>
                </div>
                <div className="rounded border border-ink-200 bg-ink-50/50 p-2.5">
                    <span className="text-ink-400 block text-[10px] uppercase">Survey Area</span>
                    <strong className="text-ink-900">{parcel.areaHectares} Hectares ({parcel.landType})</strong>
                </div>
            </div>
        </div>
    )
}
