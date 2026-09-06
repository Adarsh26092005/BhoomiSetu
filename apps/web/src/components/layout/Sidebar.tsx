import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { PRIMARY_NAV, SECONDARY_NAV, ADMIN_NAV } from '@/constants/navigation'
import { useUiStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

export function Sidebar() {
    const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed)
    const toggleSidebar = useUiStore((state) => state.toggleSidebar)
    const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen)
    const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen)
    const userRole = useAuthStore((state) => state.session?.user?.role)

    // Administration is visible to Super Admins, Central/State/District Officers, and PIA managers
    const canViewAdmin = !userRole || [
        'SUPER_ADMIN',
        'CENTRAL_OFFICER',
        'STATE_OFFICER',
        'DISTRICT_OFFICER',
        'PROJECT_IMPLEMENTING_AGENCY',
    ].includes(userRole)

    const navContent = (
        <div className="flex h-full flex-col justify-between overflow-y-auto px-3 py-4">
            <div className="space-y-6">
                {/* Administration Group */}
                {canViewAdmin && (
                    <div>
                        {!isSidebarCollapsed && (
                            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                                Administration & Onboarding
                            </p>
                        )}
                        <nav className="space-y-1">
                            {ADMIN_NAV.map((item) => {
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
                                        {!isSidebarCollapsed && item.badge && (
                                            <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-700">
                                                {item.badge}
                                            </span>
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
                            Land Acquisition Lifecycle
                        </p>
                    )}
                    <nav className="space-y-1">
                        {PRIMARY_NAV.map((item) => {
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
                            System & Compliance
                        </p>
                    )}
                    <nav className="space-y-1">
                        {SECONDARY_NAV.map((item) => {
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

            {/* Desktop Collapse Toggle */}
            <div className="pt-4 border-t border-ink-100 hidden lg:block">
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
