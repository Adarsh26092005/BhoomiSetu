import { BarChart3, X, PieChart as PieIcon, Layers, MapPin } from 'lucide-react'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import type { GisParcelProperties, GisDistrictSummary } from '@/types/gis'
import { formatArea, formatINR } from '@/lib/format'

interface SpatialAnalyticsPanelProps {
    parcels: GisParcelProperties[]
    districts: GisDistrictSummary[]
    onClose: () => void
}

const COLORS = ['#16a34a', '#0284c7', '#eab308', '#dc2626', '#6366f1', '#ec4899']

export function SpatialAnalyticsPanel({
    parcels,
    districts,
    onClose,
}: SpatialAnalyticsPanelProps) {
    // 1. Parcel Status Distribution
    const statusCounts: Record<string, number> = {}
    parcels.forEach((p) => {
        const label = p.parcelStatus.replace(/_/g, ' ')
        statusCounts[label] = (statusCounts[label] || 0) + 1
    })
    const statusData = Object.entries(statusCounts).map(([name, count]) => ({
        name,
        count,
    }))

    // 2. Land Classification Breakdown
    const landTypeCounts: Record<string, number> = {}
    parcels.forEach((p) => {
        const label = p.landType.replace(/_/g, ' ')
        landTypeCounts[label] = (landTypeCounts[label] || 0) + p.areaHectares
    })
    const landTypeData = Object.entries(landTypeCounts).map(([name, area]) => ({
        name,
        area: Number(area.toFixed(2)),
    }))

    // 3. Compensation & Possession Ratios
    const totalParcels = parcels.length
    const paidCount = parcels.filter((p) => p.compensationStatus === 'PAID').length
    const possessedCount = parcels.filter((p) => p.possessionStatus === 'POSSESSION_TAKEN').length

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs">
            <div className="w-full max-w-4xl max-h-[90vh] bg-paper rounded-2xl border border-ink-200 p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-ink-100 pb-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-100 text-signal-800">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-ink-900">Spatial Land Acquisition Analytics</h2>
                            <p className="text-xs text-ink-500">Cadastral parcel distribution, land classification, and jurisdiction breakdown</p>
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

                {/* Body Content */}
                <div className="overflow-y-auto space-y-6 pr-1 text-xs">
                    {/* Top Row: 2 Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Bar Chart */}
                        <div className="rounded-xl border border-ink-200 bg-ink-50/40 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-ink-800 flex items-center gap-1.5">
                                    <Layers className="h-4 w-4 text-terracotta-600" />
                                    <span>Parcel Status Distribution</span>
                                </span>
                                <span className="font-mono text-[11px] text-ink-500">{totalParcels} Plots</span>
                            </div>

                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statusData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#334155' }} />
                                        <Tooltip
                                            formatter={(value: any) => [`${value} Plots`, 'Count']}
                                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                                        />
                                        <Bar dataKey="count" fill="#b91c1c" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Land Type Area Pie Chart */}
                        <div className="rounded-xl border border-ink-200 bg-ink-50/40 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-ink-800 flex items-center gap-1.5">
                                    <PieIcon className="h-4 w-4 text-signal-700" />
                                    <span>Land Classification by Area (Hectares)</span>
                                </span>
                            </div>

                            <div className="h-56 w-full flex items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={landTypeData}
                                            dataKey="area"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={75}
                                            innerRadius={35}
                                            paddingAngle={3}
                                        >
                                            {landTypeData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => [`${value} ha`, 'Area']}
                                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-1 text-[10px] pr-2 shrink-0">
                                    {landTypeData.map((item, idx) => (
                                        <div key={item.name} className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                            <span className="text-ink-700 truncate max-w-[100px]">{item.name}</span>
                                            <span className="font-mono text-ink-500 font-bold">({item.area} ha)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Ratios */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-signal-50/60 p-3.5 border border-signal-200 space-y-1">
                            <span className="text-signal-800 font-bold block text-xs">Compensation DBT Disbursement Ratio</span>
                            <div className="flex items-center justify-between text-xs font-mono font-bold text-signal-950">
                                <span>{paidCount} / {totalParcels} Plots Disbursed</span>
                                <span>{totalParcels > 0 ? Math.round((paidCount / totalParcels) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-signal-200 overflow-hidden">
                                <div
                                    className="h-full bg-signal-600 rounded-full"
                                    style={{ width: `${totalParcels > 0 ? (paidCount / totalParcels) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl bg-ink-50 p-3.5 border border-ink-200 space-y-1">
                            <span className="text-ink-800 font-bold block text-xs">Physical Land Possession Handover Ratio</span>
                            <div className="flex items-center justify-between text-xs font-mono font-bold text-ink-900">
                                <span>{possessedCount} / {totalParcels} Plots Handed Over</span>
                                <span>{totalParcels > 0 ? Math.round((possessedCount / totalParcels) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-ink-200 overflow-hidden">
                                <div
                                    className="h-full bg-terracotta-700 rounded-full"
                                    style={{ width: `${totalParcels > 0 ? (possessedCount / totalParcels) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* District Jurisdiction Summary Table */}
                    <div className="rounded-xl border border-ink-200 bg-paper overflow-hidden space-y-2">
                        <div className="p-3 bg-ink-50/60 border-b border-ink-100 flex items-center justify-between">
                            <span className="font-bold text-ink-900 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-terracotta-600" />
                                <span>District Revenue Jurisdiction Progress</span>
                            </span>
                            <span className="font-mono text-[11px] text-ink-500">{districts.length} Districts</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-ink-100 bg-ink-50/40 text-[10px] font-bold text-ink-600 uppercase tracking-wider">
                                        <th scope="col" className="py-2.5 px-3">District & State</th>
                                        <th scope="col" className="py-2.5 px-3">Schemes</th>
                                        <th scope="col" className="py-2.5 px-3">Total Plots</th>
                                        <th scope="col" className="py-2.5 px-3">Acquired Area</th>
                                        <th scope="col" className="py-2.5 px-3">Compensation Paid</th>
                                        <th scope="col" className="py-2.5 px-3">Disputed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink-100">
                                    {districts.map((d) => (
                                        <tr key={d.district} className="hover:bg-ink-50/50">
                                            <td className="py-2.5 px-3 font-semibold text-ink-900">
                                                {d.district}, {d.state}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono">{d.projectsCount}</td>
                                            <td className="py-2.5 px-3 font-mono">{d.parcelsCount}</td>
                                            <td className="py-2.5 px-3 font-mono text-signal-700 font-bold">
                                                {formatArea(d.acquiredAreaHectares)} / {formatArea(d.proposedAreaHectares)}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono">
                                                {formatINR(d.compensationPaidInr, { compact: true })}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono">
                                                {d.disputedCount > 0 ? (
                                                    <span className="text-rust-700 font-bold">{d.disputedCount}</span>
                                                ) : (
                                                    <span className="text-ink-400">0</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
