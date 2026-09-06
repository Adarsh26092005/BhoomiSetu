import { useNavigate } from 'react-router-dom'
import { Map, ExternalLink, ShieldCheck, MapPin } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

export function AnalyticsMapPreview() {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <Map className="h-4 w-4 text-terracotta-600" />
                        <span>Spatial Cadastral Intelligence & PostGIS Vector Preview</span>
                    </h3>
                    <p className="text-[11px] text-ink-500">
                        Interactive GIS polygon boundaries, right-of-way alignments, and dispute heatmaps
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.gis)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
                >
                    <span>Open Full Spatial Intelligence</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Spatial Context Card */}
            <div className="relative rounded-xl overflow-hidden border border-ink-200 bg-[#0f172a] p-6 text-paper flex flex-col justify-between min-h-[160px]">
                <div className="space-y-1.5 z-10">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-signal-400 animate-ping" />
                        <span className="font-mono text-xs font-bold text-signal-300 uppercase tracking-wider">
                            PostGIS Vector Engine Active
                        </span>
                    </div>
                    <h4 className="text-base font-bold text-paper">
                        6 Strategic Corridors • 16 Cadastral Boundaries • 6 District Jurisdictions
                    </h4>
                    <p className="text-xs text-slate-300 max-w-xl">
                        View exact cadastral survey numbers, award payment layers, Section 38 possession handovers, and active litigation stay orders directly mapped to satellite imagery.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700/80 z-10 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-terracotta-400" />
                        <span>Karnataka, Haryana, Telangana, Gujarat, TN, Rajasthan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-signal-400" />
                        <span>100% Survey Geometry Integrity</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
