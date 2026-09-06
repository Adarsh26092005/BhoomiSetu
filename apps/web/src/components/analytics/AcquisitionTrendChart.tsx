import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from 'recharts'
import { TrendingUp, Info } from 'lucide-react'
import type { AcquisitionTrendPoint } from '@/types/analytics'
import { formatArea } from '@/lib/format'

interface AcquisitionTrendChartProps {
    data: AcquisitionTrendPoint[]
}

export function AcquisitionTrendChart({ data }: AcquisitionTrendChartProps) {
    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-terracotta-600" />
                        <h3 className="text-sm font-bold text-ink-900">
                            National Land Acquisition & Handover Velocity
                        </h3>
                    </div>
                    <p className="text-[11px] text-ink-500">
                        Monthly progression of statutory proposed vs physically acquired land area (Hectares)
                    </p>
                </div>

                <div className="flex items-center gap-1.5 rounded-md bg-ink-50 px-2.5 py-1 text-[10px] text-ink-600 border border-ink-200 font-mono">
                    <Info className="h-3.5 w-3.5 text-ink-400" />
                    <span>Deterministic Reporting Timeline</span>
                </div>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorProposed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorAcquired" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="periodLabel"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            unit=" ha"
                        />
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                if (name === 'Proposed Scope') return [`${formatArea(Number(value))}`, 'Proposed Scope']
                                if (name === 'Acquired Land') return [`${formatArea(Number(value))}`, 'Acquired Land']
                                return [value, name]
                            }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '11px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                            iconType="circle"
                        />
                        <Area
                            type="monotone"
                            dataKey="proposedAreaHectares"
                            name="Proposed Scope"
                            stroke="#64748b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorProposed)"
                        />
                        <Area
                            type="monotone"
                            dataKey="acquiredAreaHectares"
                            name="Acquired Land"
                            stroke="#16a34a"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorAcquired)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
