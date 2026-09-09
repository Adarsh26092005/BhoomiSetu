import { useNavigate } from 'react-router-dom'
import {
    Landmark,
    MapPinned,
    Map,
    FileStack,
    GitBranch,
    Wallet,
    Sparkles,
    Zap,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'

import { useAuthStore } from '@/store/auth.store'
import { UserCheck2 } from 'lucide-react'

export function QuickActions() {
    const navigate = useNavigate()
    const userRole = useAuthStore((state) => state.session?.user?.role)
    const isSuperAdmin = userRole === 'SUPER_ADMIN'

    const actions = [
        ...(isSuperAdmin
            ? [{ label: 'Approvals & History', path: ROUTES.piaApprovals, icon: UserCheck2, color: 'text-amber-800 bg-amber-50' }]
            : []),
        { label: 'Browse Projects', path: ROUTES.projects, icon: Landmark, color: 'text-ink-900 bg-ink-100' },
        { label: 'Survey Parcels', path: ROUTES.parcels, icon: MapPinned, color: 'text-terracotta-700 bg-terracotta-50' },
        { label: 'GIS Cadastre', path: ROUTES.gis, icon: Map, color: 'text-terracotta-700 bg-terracotta-50' },
        { label: 'Workflow Approvals', path: ROUTES.workflow, icon: GitBranch, color: 'text-ink-900 bg-ink-100' },
        { label: 'Gazette & DMS', path: ROUTES.documents, icon: FileStack, color: 'text-ink-900 bg-ink-100' },
        { label: 'Compensation DBT', path: ROUTES.compensation, icon: Wallet, color: 'text-signal-700 bg-signal-50' },
        { label: 'AI Risk Engine', path: ROUTES.aiAssistant, icon: Sparkles, color: 'text-terracotta-700 bg-terracotta-50' },
    ]

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-terracotta-50 text-terracotta-700">
                    <Zap className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-600">Officer Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {actions.map((act) => {
                    const Icon = act.icon
                    return (
                        <button
                            key={act.path}
                            type="button"
                            onClick={() => navigate(act.path)}
                            className="group flex flex-col items-center justify-center rounded-lg border border-ink-200 bg-ink-50/40 p-3 text-center transition-all hover:border-terracotta-300 hover:bg-paper hover:shadow-xs cursor-pointer"
                        >
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${act.color} mb-2 transition-transform group-hover:scale-110`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-ink-800 group-hover:text-terracotta-800">
                                {act.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
