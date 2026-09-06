import { useNavigate } from 'react-router-dom'
import { MapPin, Map, ExternalLink } from 'lucide-react'
import type { StateDistrictAnalytics } from '@/types/analytics'
import { formatArea, formatINR } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface GeographicAnalyticsPanelProps {
    districts: StateDistrictAnalytics[]
}

export function GeographicAnalyticsPanel({ districts }: GeographicAnalyticsPanelProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper overflow-hidden shadow-xs space-y-3 text-xs">
            <div className="p-4 border-b border-ink-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-ink-50/40">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-terracotta-600" />
                        <span>State & District Revenue Jurisdiction Performance Matrix</span>
                    </h3>
                    <p className="text-[11px] text-ink-500">
                        Comparative acquisition velocity, compensation DBT release, and dispute concentrations across districts
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.gis)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/50 cursor-pointer"
                >
                    <Map className="h-3.5 w-3.5 text-terracotta-600" />
                    <span>Open National GIS Map</span>
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-ink-100 bg-ink-50/70 text-[10px] font-bold text-ink-600 uppercase tracking-wider">
                            <th scope="col" className="py-2.5 px-3">District & State</th>
                            <th scope="col" className="py-2.5 px-3">Schemes</th>
                            <th scope="col" className="py-2.5 px-3">Plots</th>
                            <th scope="col" className="py-2.5 px-3">Proposed Scope</th>
                            <th scope="col" className="py-2.5 px-3">Acquired Land (%)</th>
                            <th scope="col" className="py-2.5 px-3">Disbursed DBT</th>
                            <th scope="col" className="py-2.5 px-3">Disputes</th>
                            <th scope="col" className="py-2.5 px-3 text-right">GIS Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                        {districts.map((d) => (
                            <tr key={d.district} className="hover:bg-ink-50/50 transition-colors">
                                <td className="py-2.5 px-3 font-semibold text-ink-900">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-terracotta-600 shrink-0" />
                                        <span>{d.district}, {d.state}</span>
                                    </div>
                                </td>
                                <td className="py-2.5 px-3 font-mono">{d.projectsCount}</td>
                                <td className="py-2.5 px-3 font-mono">{d.parcelsCount}</td>
                                <td className="py-2.5 px-3 font-mono">{formatArea(d.proposedAreaHectares)}</td>
                                <td className="py-2.5 px-3 font-mono">
                                    <span className="font-bold text-signal-700 block">
                                        {formatArea(d.acquiredAreaHectares)} ({d.acquisitionPercentage}%)
                                    </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono font-semibold text-ink-900">
                                    {formatINR(d.compensationDisbursedInr, { compact: true })}
                                </td>
                                <td className="py-2.5 px-3 font-mono">
                                    {d.disputedCount > 0 ? (
                                        <span className="text-rust-700 font-bold bg-rust-50 px-1.5 py-0.2 rounded border border-rust-200">
                                            {d.disputedCount} Disputed
                                        </span>
                                    ) : (
                                        <span className="text-ink-400">0</span>
                                    )}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`${ROUTES.gis}?district=${d.district}`)}
                                        className="h-7 px-2 text-[11px] font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/40 flex items-center gap-1 ml-auto cursor-pointer"
                                    >
                                        <span>Open in GIS</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
