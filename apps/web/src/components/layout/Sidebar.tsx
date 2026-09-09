import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, MapPin } from 'lucide-react'
import { PRIMARY_NAV, SECONDARY_NAV, ADMIN_NAV, PIA_PRIMARY_NAV, PIA_SECONDARY_NAV } from '@/constants/navigation'
import { useUiStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { approvalService } from '@/services/approval.service'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

export function Sidebar() {
    const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed)
    const toggleSidebar = useUiStore((state) => state.toggleSidebar)
    const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen)
    const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen)
    const userRole = useAuthStore((state) => state.session?.user?.role)
    const effectiveScope = useAuthStore((state) => state.effectiveScope)
    const [pendingCount, setPendingCount] = React.useState<number | null>(null)

    const isSuperAdmin = userRole === 'SUPER_ADMIN'
    const isPia = userRole === 'PROJECT_IMPLEMENTING_AGENCY'

    React.useEffect(() => {
        if (isSuperAdmin) {
            approvalService
                .listApprovalRequests({ status: 'PENDING', limit: 1 })
                .then((res) => {
                    setPendingCount(res.total ?? 0)
                })
                .catch(() => {})
        }
    }, [isSuperAdmin])

    // Filter Admin Nav based on roles
    const visibleAdminNav = ADMIN_NAV.filter(
        (item) => !item.roles || (userRole && item.roles.includes(userRole))
    )

    const primaryItems = isPia ? PIA_PRIMARY_NAV : PRIMARY_NAV
    const secondaryItems = isPia ? PIA_SECONDARY_NAV : SECONDARY_NAV

    const areaCode = effectiveScope?.administrativeAreaCode || effectiveScope?.areaCode
    const areaName = effectiveScope?.administrativeAreaName || effectiveScope?.areaName || effectiveScope?.state

    const navContent = (
        <div className="flex h-full flex-col justify-between overflow-y-auto px-3 py-4">
            <div className="space-y-6">
                {/* Administration Group - Only for Super Admin & Authorized Officers */}
                {visibleAdminNav.length > 0 && !isPia && (
                    <div>
                        {!isSidebarCollapsed && (
                            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                                {isSuperAdmin ? 'Jurisdiction Administration' : 'Administrative Directory'}
                            </p>
                        )}
                        <nav className="space-y-1">
                            {visibleAdminNav.map((item) => {
                                const Icon = item.icon
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/dashboard/organizations'}
                                        onClick={() => setMobileNavOpen(false)}
                                        className={({ isActive }) =>
                                            cn(
                                                'group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                                                isActive
                                                    ? 'bg-ink-900 text-paper shadow-sm'
                                                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                                                isSidebarCollapsed && 'justify-center px-2',
                                            )
                                        }
                                        title={isSidebarCollapsed ? item.label : undefined}
                                    >
                                        <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-105 text-terracotta-600')} />
                                        {!isSidebarCollapsed && (
                                            <span className="flex-1 truncate font-semibold">{item.label}</span>
                                        )}
                                        {!isSidebarCollapsed && (
                                            item.path === ROUTES.piaApprovals && pendingCount !== null ? (
                                                pendingCount > 0 ? (
                                                    <span className="ml-auto rounded-full bg-amber-500 text-paper px-2 py-0.5 text-[10px] font-bold">
                                                        {pendingCount}
                                                    </span>
                                                ) : null
                                            ) : item.badge ? (
                                                <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-700">
                                                    {item.badge}
                                                </span>
                                            ) : null
                                        )}
                                    </NavLink>
                                )
                            })}
                        </nav>
                    </div>
                )}

                {/* Primary Navigation Group */}
                <div>
                    {!isSidebarCollapsed && (
                        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                            {isPia ? 'My Land Acquisitions' : isSuperAdmin ? 'Land Acquisition Oversight' : 'Acquisition Operations'}
                        </p>
                    )}
                    <nav className="space-y-1">
                        {primaryItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    onClick={() => setMobileNavOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            'group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                                            isActive
                                                ? 'bg-ink-900 text-paper shadow-sm'
                                                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                                            isSidebarCollapsed && 'justify-center px-2',
                                        )
                                    }
                                    title={isSidebarCollapsed ? item.label : undefined}
                                >
                                    <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-105')} />
                                    {!isSidebarCollapsed && (
                                        <span className="flex-1 truncate">{item.label}</span>
                                    )}
                                    {!isSidebarCollapsed && item.badge && (
                                        <span className="ml-auto rounded bg-terracotta-100 px-1.5 py-0.2 text-[9px] font-bold text-terracotta-700">
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            )
                        })}
                    </nav>
                </div>

                {/* Secondary Navigation Group */}
                <div>
                    {!isSidebarCollapsed && (
                        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                            {isPia ? 'Account & Alerts' : 'System & Compliance'}
                        </p>
                    )}
                    <nav className="space-y-1">
                        {secondaryItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileNavOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            'group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                                            isActive
                                                ? 'bg-ink-900 text-paper shadow-sm'
                                                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                                            isSidebarCollapsed && 'justify-center px-2',
                                        )
                                    }
                                    title={isSidebarCollapsed ? item.label : undefined}
                                >
                                    <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                                    {!isSidebarCollapsed && (
                                        <span className="flex-1 truncate">{item.label}</span>
                                    )}
                                    {!isSidebarCollapsed && item.badge && (
                                        <span className="ml-auto rounded-full bg-rust-100 px-1.5 py-0.2 text-[9px] font-bold text-rust-700">
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Jurisdiction Badge at bottom of sidebar */}
            {effectiveScope && !isSidebarCollapsed && (
                <div className="pt-3 pb-1 border-t border-ink-100">
                    <div className="rounded-md bg-paper-subtle p-2 text-[10px] border border-ink-200">
                        <div className="flex items-center gap-1 font-bold text-ink-800 uppercase tracking-wider">
                            <MapPin className="h-3 w-3 text-terracotta-600" />
                            <span>Jurisdiction Scope</span>
                        </div>
                        <p className="font-semibold text-terracotta-700 truncate mt-0.5">
                            {effectiveScope.isCentral || effectiveScope.isNational
                                ? 'National (Republic of India)'
                                : `${areaName || 'State'} [${areaCode || 'STATE'}]`}
                        </p>
                    </div>
                </div>
            )}

            {/* Desktop Collapse Toggle */}
            <div className="pt-3 border-t border-ink-100 hidden lg:block">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors',
                        isSidebarCollapsed && 'justify-center px-2',
                    )}
                >
                    {isSidebarCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4" />
                            <span>Collapse Menu</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Fixed Sidebar */}
            <aside
                className={cn(
                    'hidden lg:flex flex-col border-r border-ink-200 bg-paper transition-all duration-200 shrink-0 sticky top-16 h-[calc(100vh-4rem)]',
                    isSidebarCollapsed ? 'w-16' : 'w-64',
                )}
            >
                {navContent}
            </aside>

            {/* Mobile Sidebar Overlay Modal */}
            {isMobileNavOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-ink-950/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileNavOpen(false)}
                    />
                    <div className="relative flex w-72 flex-col bg-paper border-r border-ink-200 shadow-xl z-10">
                        <div className="flex h-16 items-center justify-between px-4 border-b border-ink-200">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper font-bold text-xs">
                                    GOI
                                </div>
                                <span className="font-bold text-xs text-ink-900">NLAMS Navigation</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(false)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {navContent}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
