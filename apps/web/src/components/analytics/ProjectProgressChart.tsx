import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import type { ProjectPerformanceMetric } from '@/types/analytics'

interface ProjectProgressChartProps {
    projects: ProjectPerformanceMetric[]
}

export function ProjectProgressChart({ projects }: ProjectProgressChartProps) {
    const data = projects.map((p) => ({
        code: p.code,
        title: p.title,
        Acquisition: p.acquisitionPercentage,
        Compensation: p.compensationPercentage,
        Possession: p.possessionPercentage,
        'R&R Resettlement': p.randrPercentage,
    }))

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="border-b border-ink-100 pb-3 space-y-0.5">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-sm font-bold text-ink-900">
                        Normalized Statutory Delivery Rates Across Schemes (%)
                    </h3>
                </div>
                <p className="text-[11px] text-ink-500">
                    Comparative throughput across acquisition handover, compensation disbursement, possession notices, and R&R packages
                </p>
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="code"
                            tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                            axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            unit="%"
                            domain={[0, 100]}
                        />
                        <Tooltip
                            formatter={(val: any) => [`${val}%`, '']}
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
                        <Bar dataKey="Acquisition" fill="#16a34a" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Compensation" fill="#0284c7" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Possession" fill="#f97316" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="R&R Resettlement" fill="#ec4899" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
