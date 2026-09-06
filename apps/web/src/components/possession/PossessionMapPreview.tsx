import { useNavigate } from 'react-router-dom'
import { Map, MapPin, Maximize2, Layers } from 'lucide-react'
import type { PossessionRecord } from '@/types'
import { useParcel } from '@/hooks/use-parcels'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface PossessionMapPreviewProps {
    record: PossessionRecord
}

export function PossessionMapPreview({ record }: PossessionMapPreviewProps) {
    const navigate = useNavigate()
    const { data: parcel } = useParcel(record.parcelId)

    const lat = parcel?.centroid?.lat ?? 13.0827
    const lng = parcel?.centroid?.lng ?? 80.2707

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-terracotta-50 text-terracotta-700">
                        <Map className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Geospatial Cadastral Demarcation</h3>
                        <p className="text-[11px] text-ink-500">PostGIS boundary polygon & centroid GPS coordinates</p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.gis)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Open GIS Cadastre</span>
                </Button>
            </div>

            {/* Spatial Vector Grid Canvas */}
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-ink-200 bg-ink-950 flex flex-col items-center justify-center text-paper">
                <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="pos-cadastre-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#pos-cadastre-grid)" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-600/80 text-paper ring-8 ring-terracotta-500/20 shadow-lg">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-paper block">
                            {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
                        </span>
                        <span className="text-[10px] text-ink-300 block font-sans">
                            {record.surveyNumber} • {record.village}, {record.district}
                        </span>
                    </div>
                </div>

                <div className="absolute bottom-2 left-2 rounded bg-ink-900/80 px-2 py-0.5 text-[9px] font-mono text-ink-300 backdrop-blur-xs">
                    EPSG:4326 (WGS84)
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-ink-600 pt-1 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-ink-400" />
                    <span>Area: {record.landAreaHectares} Hectares</span>
                </span>
                <span className="text-terracotta-700 font-semibold">
                    PostGIS Synced
                </span>
            </div>
        </div>
    )
}
