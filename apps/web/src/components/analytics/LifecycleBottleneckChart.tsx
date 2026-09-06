import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
} from 'recharts'
import { GitFork, AlertCircle } from 'lucide-react'
import type { LifecycleStageMetric } from '@/types/analytics'

interface LifecycleBottleneckChartProps {
    stages: LifecycleStageMetric[]
}

export function LifecycleBottleneckChart({ stages }: LifecycleBottleneckChartProps) {
    const data = stages.map((s) => ({
        name: s.stageLabel,
        projects: s.projectCount,
        avgDays: s.averageDaysInStage,
        hasBottleneck: s.hasBottleneck,
    }))

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <GitFork className="h-4 w-4 text-terracotta-600" />
                        <h3 className="text-sm font-bold text-ink-900">
                            Statutory Lifecycle Stage Pipeline & Bottleneck Analysis
                        </h3>
                    </div>
                    <p className="text-[11px] text-ink-500">
                        Scheme distribution across the 17 RFCTLARR statutory milestones (Section 11 to Completion)
                    </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-ink-600 font-mono">
                    <span className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-rust-600" />
                        <span>High Latency Stage</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                        <span>Nominal Flow</span>
                    </span>
                </div>
            </div>

            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            unit=" Schemes"
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={160}
                            tick={{ fontSize: 10, fill: '#334155', fontWeight: 500 }}
                        />
                        <Tooltip
                            formatter={(value: any, _name: any, item: any) => {
                                return [
                                    `${value} Schemes (Avg. ${item.payload.avgDays} Days Latency)`,
                                    'Active Queue',
                                ]
                            }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '11px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Bar dataKey="projects" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.hasBottleneck && entry.projects > 0 ? '#b91c1c' : '#475569'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="rounded-lg bg-rust-50/70 p-3 border border-rust-200 text-rust-900 flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 text-rust-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                    <span className="font-bold block">Critical Bottleneck Flag:</span>
                    <p className="text-[11px] text-rust-800 leading-relaxed">
                        <strong>Document Verification</strong> and <strong>State Level Inter-Ministerial Approval</strong> desks exhibit the highest latency (avg. 28-34 days turnaround) due to cross-departmental revenue title clearances.
                    </p>
                </div>
            </div>
        </div>
    )
}
