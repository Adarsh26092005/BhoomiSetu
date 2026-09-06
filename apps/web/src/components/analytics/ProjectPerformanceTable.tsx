import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    ExternalLink,
    MapPin,
    Building2,
    AlertTriangle,
    ArrowUpDown,
    Map,
} from 'lucide-react'
import type { ProjectPerformanceMetric } from '@/types/analytics'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatArea, formatINR } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ProjectPerformanceTableProps {
    projects: ProjectPerformanceMetric[]
}

export function ProjectPerformanceTable({ projects }: ProjectPerformanceTableProps) {
    const navigate = useNavigate()
    const [search, setSearch] = React.useState('')
    const [statusFilter, setStatusFilter] = React.useState<string>('ALL')
    const [sortField, setSortField] = React.useState<keyof ProjectPerformanceMetric>('totalAreaHectares')
    const [sortAsc, setSortAsc] = React.useState(false)

    const filtered = React.useMemo(() => {
        return projects
            .filter((p) => {
                if (statusFilter !== 'ALL' && p.currentStage !== statusFilter) return false
                if (!search) return true
                const s = search.toLowerCase()
                return (
                    p.code.toLowerCase().includes(s) ||
                    p.title.toLowerCase().includes(s) ||
                    p.implementingAgency.toLowerCase().includes(s) ||
                    p.state.toLowerCase().includes(s) ||
                    p.districts.some((d) => d.toLowerCase().includes(s))
                )
            })
            .sort((a, b) => {
                const valA = a[sortField] ?? 0
                const valB = b[sortField] ?? 0
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortAsc ? valA - valB : valB - valA
                }
                return sortAsc
                    ? String(valA).localeCompare(String(valB))
                    : String(valB).localeCompare(String(valA))
            })
    }, [projects, search, statusFilter, sortField, sortAsc])

    const handleSort = (field: keyof ProjectPerformanceMetric) => {
        if (sortField === field) {
            setSortAsc(!sortAsc)
        } else {
            setSortField(field)
            setSortAsc(false)
        }
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-forest-700" />
                        <span>Scheme Performance & Corridor Delivery Matrix</span>
                    </h3>
                    <p className="text-[11px] text-ink-500">
                        Multi-dimensional progress metrics across land parcel acquisition, compensation awards, and possession
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-56">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter schemes..."
                            className="w-full rounded-md border border-ink-300 bg-paper pl-8 pr-2.5 py-1 text-xs text-ink-900 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-md border border-ink-300 bg-paper px-2.5 py-1 text-xs text-ink-800 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
                    >
                        <option value="ALL">All Stages</option>
                        <option value="UNDER_SCRUTINY">Under Scrutiny</option>
                        <option value="STATE_APPROVAL">State Approval</option>
                        <option value="NOTIFICATION_ISSUED">Notification Issued</option>
                        <option value="AWARD_DECLARED">Award Declared</option>
                        <option value="COMPENSATION_DISBURSED">Compensation Disbursed</option>
                        <option value="POSSESSION_PENDING">Possession Pending</option>
                        <option value="POSSESSION_COMPLETED">Possession Completed</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-ink-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-ink-100 bg-ink-50/70 text-[10px] font-bold text-ink-600 uppercase tracking-wider">
                            <th scope="col" className="py-2.5 px-3">
                                <button
                                    type="button"
                                    onClick={() => handleSort('code')}
                                    className="flex items-center gap-1 cursor-pointer font-bold"
                                >
                                    <span>Scheme / Code</span>
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th scope="col" className="py-2.5 px-3">Jurisdiction</th>
                            <th scope="col" className="py-2.5 px-3">
                                <button
                                    type="button"
                                    onClick={() => handleSort('totalAreaHectares')}
                                    className="flex items-center gap-1 cursor-pointer font-bold"
                                >
                                    <span>Proposed Scope</span>
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th scope="col" className="py-2.5 px-3">
                                <button
                                    type="button"
                                    onClick={() => handleSort('acquisitionPercentage')}
                                    className="flex items-center gap-1 cursor-pointer font-bold"
                                >
                                    <span>Acquired (%)</span>
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th scope="col" className="py-2.5 px-3">Lifecycle Stage</th>
                            <th scope="col" className="py-2.5 px-3">Compensation DBT</th>
                            <th scope="col" className="py-2.5 px-3">Possession</th>
                            <th scope="col" className="py-2.5 px-3">R&R</th>
                            <th scope="col" className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                        {filtered.map((p) => (
                            <tr key={p.projectId} className="hover:bg-ink-50/50 transition-colors">
                                <td className="py-3 px-3 space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-xs font-bold text-ink-900 bg-ink-100 px-1.5 py-0.2 rounded border border-ink-200">
                                            {p.code}
                                        </span>
                                        {p.attentionFlagCount > 0 && (
                                            <span className="flex items-center gap-0.5 text-rust-700 font-bold text-[10px] bg-rust-50 px-1 py-0.2 rounded border border-rust-200">
                                                <AlertTriangle className="h-2.5 w-2.5" />
                                                <span>{p.attentionFlagCount} Issues</span>
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-semibold text-ink-900 block truncate max-w-[200px]">
                                        {p.title}
                                    </span>
                                    <span className="text-[10px] text-ink-500 block">
                                        Agency: {p.implementingAgency}
                                    </span>
                                </td>

                                <td className="py-3 px-3 space-y-0.5">
                                    <span className="font-semibold text-ink-900 block">{p.state}</span>
                                    <span className="text-[10px] text-ink-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-ink-400" />
                                        <span>{p.districts.join(', ')}</span>
                                    </span>
                                </td>

                                <td className="py-3 px-3 font-mono">
                                    <span className="font-bold text-ink-900 block">
                                        {formatArea(p.totalAreaHectares)}
                                    </span>
                                    <span className="text-[10px] text-ink-500">
                                        {p.parcelCount} Cadastral Plots
                                    </span>
                                </td>

                                <td className="py-3 px-3">
                                    <div className="space-y-1 w-28">
                                        <div className="flex items-center justify-between text-[11px] font-mono">
                                            <span className="font-bold text-ink-900">{p.acquisitionPercentage ?? 0}%</span>
                                            <span className="text-ink-500 text-[10px]">
                                                {formatArea(p.acquiredAreaHectares)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-ink-200 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${
                                                    (p.acquisitionPercentage ?? 0) >= 50
                                                        ? 'bg-signal-600'
                                                        : (p.acquisitionPercentage ?? 0) >= 25
                                                        ? 'bg-amber-500'
                                                        : 'bg-rust-600'
                                                }`}
                                                style={{ width: `${p.acquisitionPercentage ?? 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>

                                <td className="py-3 px-3">
                                    <StatusBadge status={p.currentStage} type="project" />
                                </td>

                                <td className="py-3 px-3 font-mono space-y-0.5">
                                    <span className="font-bold text-signal-700 block">
                                        {formatINR(p.ledgerDisbursedInr, { compact: true })} ({p.compensationPercentage ?? 0}%)
                                    </span>
                                    <span className="text-[10px] text-ink-400 block">
                                        Est: {formatINR(p.estimatedCompensationInr, { compact: true })}
                                    </span>
                                </td>

                                <td className="py-3 px-3 font-mono">
                                    <span className="font-bold text-ink-900 block">
                                        {p.possessionPercentage ?? 0}%
                                    </span>
                                    <span className="text-[10px] text-ink-500 block">
                                        {p.possessionTakenCount} Handed Over
                                    </span>
                                </td>

                                <td className="py-3 px-3 font-mono">
                                    <span className="font-bold text-ink-900 block">
                                        {p.randrPercentage ?? 0}%
                                    </span>
                                    <span className="text-[10px] text-ink-500 block">
                                        {p.randrCompletedCount} Resettled
                                    </span>
                                </td>

                                <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`${ROUTES.gis}?projectId=${p.projectId}`)}
                                            className="h-7 px-2 text-[10px] text-terracotta-700 border-terracotta-200 bg-terracotta-50/40 cursor-pointer"
                                            title="View Scheme on GIS"
                                        >
                                            <Map className="h-3 w-3" />
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={() => navigate(ROUTES.projectDetail(p.projectId))}
                                            className="h-7 px-2 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Dossier</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
