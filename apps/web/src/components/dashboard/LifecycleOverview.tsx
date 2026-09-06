import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import type { AcquisitionProject } from '@/types'
import { PROJECT_STATUS_META } from '@/constants/status'

interface LifecycleOverviewProps {
    projects: AcquisitionProject[]
}

export function LifecycleOverview({ projects }: LifecycleOverviewProps) {
    // Count projects in each status
    const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
    }, {})

    // High level statutory stages for visual clarity and bottleneck identification
    const stageGroups = [
        { key: 'PROPOSAL_SCRUTINY', label: 'Proposal & Scrutiny', statuses: ['DRAFT', 'SUBMITTED', 'UNDER_SCRUTINY', 'DOCUMENT_VERIFICATION'] },
        { key: 'STATUTORY_APPROVALS', label: 'Tier Approvals (Dist/State/Ctrl)', statuses: ['DISTRICT_APPROVAL', 'STATE_APPROVAL', 'CENTRAL_APPROVAL'] },
        { key: 'GAZETTE_NOTIFICATIONS', label: 'Gazette Sec. 11 Notifications', statuses: ['NOTIFICATION_ISSUED'] },
        { key: 'AWARD_DECLARATIONS', label: 'Sec. 19 Awards Declared', statuses: ['AWARD_DECLARED', 'COMPENSATION_ASSESSED'] },
        { key: 'DISBURSEMENT_DBT', label: 'Compensation Disbursement', statuses: ['COMPENSATION_DISBURSED'] },
        { key: 'POSSESSION_TAKEOVER', label: 'Possession Handover', statuses: ['POSSESSION_PENDING', 'POSSESSION_COMPLETED'] },
        { key: 'R_AND_R_REHAB', label: 'R&R / Resettlement', statuses: ['R_AND_R_IN_PROGRESS'] },
        { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
        { key: 'ON_HOLD_REJECTED', label: 'Stalled / On Hold', statuses: ['ON_HOLD', 'REJECTED'] },
    ]

    const chartData = stageGroups.map((group) => {
        const count = group.statuses.reduce((sum, st) => sum + (statusCounts[st] || 0), 0)
        return {
            name: group.label,
            count,
            key: group.key,
        }
    })

    const getBarColor = (key: string) => {
        if (key === 'ON_HOLD_REJECTED') return '#dc2626' // rust
        if (key === 'COMPLETED') return '#16a34a'        // signal
        if (key === 'DISBURSEMENT_DBT' || key === 'POSSESSION_TAKEOVER') return '#bf4220' // terracotta
        if (key === 'AWARD_DECLARATIONS') return '#0f172a' // ink
        return '#475569' // slate
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-ink-900">Statutory Lifecycle Stage Distribution</h3>
                    <p className="text-xs text-ink-500">
                        Active projects across 17-stage LARR 2013 regulatory workflow
                    </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-ink-700">
                        <span className="h-2.5 w-2.5 rounded-sm bg-ink-900" />
                        <span>Active Pipeline</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-signal-700">
                        <span className="h-2.5 w-2.5 rounded-sm bg-signal-600" />
                        <span>Completed</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-rust-700">
                        <span className="h-2.5 w-2.5 rounded-sm bg-rust-600" />
                        <span>On Hold</span>
                    </span>
                </div>
            </div>

            {/* Recharts Horizontal Bar Chart */}
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                        <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={130}
                            tick={{ fontSize: 11, fill: '#1e293b' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '12px',
                            }}
                            itemStyle={{ color: '#ffffff' }}
                            formatter={(value: unknown) => [`${value} Projects`, 'Count']}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry) => (
                                <Cell key={entry.key} fill={getBarColor(entry.key)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Status Tags Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-ink-100 text-xs">
                {projects.map((p) => {
                    const meta = PROJECT_STATUS_META[p.status]
                    return (
                        <div key={p.id} className="rounded border border-ink-200 bg-ink-50/50 p-2 text-[11px] space-y-0.5">
                            <p className="font-semibold text-ink-900 truncate" title={p.title}>{p.code}</p>
                            <p className="text-[10px] text-ink-500">{meta?.label ?? p.status}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
