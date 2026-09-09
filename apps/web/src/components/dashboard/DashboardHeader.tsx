import * as React from 'react'
import { Building, Calendar, CheckCircle, RefreshCw, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
    onRefresh?: () => void
    isRefreshing?: boolean
}

export function DashboardHeader({ onRefresh, isRefreshing = false }: DashboardHeaderProps) {
    const session = useAuthStore((state) => state.session)
    const effectiveScope = useAuthStore((state) => state.effectiveScope)
    const [currentTime, setCurrentTime] = React.useState<string>('')

    const userRole = session?.user?.role
    const isPia = userRole === 'PROJECT_IMPLEMENTING_AGENCY'

    React.useEffect(() => {
        const update = () => {
            const now = new Date()
            setCurrentTime(
                now.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                }),
            )
        }
        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [])

    const getScopeBadge = () => {
        if (effectiveScope?.isCentral || effectiveScope?.isNational) {
            return {
                portal: 'NATIONAL SOVEREIGN PORTAL',
                scope: 'REPUBLIC OF INDIA • NATIONAL SCOPE',
                title: 'NLAMS Central Sovereign Command Center',
                subtitle: 'All-India statutory monitoring of land acquisition projects, compensation disbursements, and inter-state gazette notifications.',
            }
        }
        const areaCode = effectiveScope?.administrativeAreaCode || effectiveScope?.areaCode
        const areaName = effectiveScope?.administrativeAreaName || effectiveScope?.areaName || effectiveScope?.state
        if (areaCode && areaName) {
            const stateStr = effectiveScope?.state || 'REGIONAL'
            return {
                portal: `${stateStr.toUpperCase()} JURISDICTION`,
                scope: `${areaName.toUpperCase()} [${areaCode}]`,
                title: `${areaName} Land Acquisition Oversight Center`,
                subtitle: `Jurisdiction-scoped tracking of land parcels, approvals, and solatium assessment across ${effectiveScope?.districts?.join(', ') || 'assigned districts'}.`,
            }
        }
        if (isPia) {
            return {
                portal: 'IMPLEMENTING AGENCY PORTAL',
                scope: 'PROJECT CONCESSIONAIRE & EPC WORKSPACE',
                title: `${session?.user?.organization?.name || 'Implementing Agency'} Acquisition Dashboard`,
                subtitle: 'Track your organization acquisition projects, survey milestones, statutory approvals, and compensation schedules.',
            }
        }
        return {
            portal: 'GOVERNMENT OF INDIA',
            scope: 'LARR ACT 2013 STATUTORY MONITOR',
            title: 'NLAMS Executive Command Center',
            subtitle: 'Comprehensive real-time tracking of land parcels, statutory gazette milestones, solatium assessment, and direct compensation disbursement.',
        }
    }

    const scopeInfo = getScopeBadge()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left Title & System Scope */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded bg-ink-900 px-2 py-0.5 text-[10px] font-bold text-paper uppercase tracking-wider">
                            {scopeInfo.portal}
                        </span>
                        <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-200">
                            {scopeInfo.scope}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                        {scopeInfo.title}
                    </h1>
                    <p className="text-xs text-ink-500 max-w-2xl">
                        {scopeInfo.subtitle}
                    </p>
                </div>

                {/* Right Officer Context & Live Refresh Trigger */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                    <div className="rounded-lg border border-ink-200 bg-ink-50/70 px-3 py-1.5 text-xs text-ink-700 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-900">
                            <Shield className="h-3.5 w-3.5 text-terracotta-600" />
                            <span>{session?.user.fullName ?? 'Authorized Officer'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-ink-500">
                            <Building className="h-3 w-3" />
                            <span>{session?.user.organization.name ?? 'District Revenue Office'}</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-1.5 text-xs font-medium"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 text-ink-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Sync Data'}</span>
                    </Button>
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-ink-100 text-[11px] text-ink-500">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-signal-700 font-medium">
                        <CheckCircle className="h-3.5 w-3.5 text-signal-600" />
                        <span>Statutory Services Active</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-ink-600">
                        <Calendar className="h-3.5 w-3.5 text-ink-400" />
                        <span>Live Indian Standard Time: {currentTime || 'Syncing...'}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-ink-400">
                    <span>DBT Escrow Gateway: CONNECTED</span>
                    <span>•</span>
                    <span>NIC GIS: SYNCHRONIZED</span>
                </div>
            </div>
        </div>
    )
}
