import { useNavigate } from 'react-router-dom'
import { Layers, ExternalLink } from 'lucide-react'
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from 'recharts'
import { formatArea } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

const COLORS = ['#16a34a', '#0284c7', '#eab308', '#dc2626', '#6366f1']

export function ParcelAnalyticsPanel() {
    const navigate = useNavigate()

    const landTypeData = [
        { name: 'Agricultural (Dry & Irrigated)', area: 2450.0 },
        { name: 'Homestead / Residential', area: 580.5 },
        { name: 'Commercial / Industrial', area: 320.0 },
        { name: 'Forest / Tribal Land', area: 290.0 },
        { name: 'Government / Poramboke', area: 199.5 },
    ]

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-terracotta-600" />
                        <span>Cadastral Parcel Classification & Land Use Matrix</span>
                    </h3>
                    <p className="text-[11px] text-ink-500">
                        Zoning breakdown across agricultural, residential, commercial, and forest revenue land
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.parcels)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
                >
                    <span>View Cadastral Parcels</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={landTypeData}
                                dataKey="area"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={40}
                                paddingAngle={3}
                            >
                                {landTypeData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(val: any) => [`${formatArea(Number(val))}`, 'Proposed Area']}
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '11px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                    <span className="font-bold text-ink-800 block text-xs">
                        Land Classification Breakdown:
                    </span>
                    <div className="space-y-1.5">
                        {landTypeData.map((item, idx) => (
                            <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-ink-50/60 border border-ink-100">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-ink-800 font-semibold">{item.name}</span>
                                </div>
                                <span className="font-mono font-bold text-ink-900">
                                    {formatArea(item.area)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
