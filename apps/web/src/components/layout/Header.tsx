import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, Search, Shield, User } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { ROUTES } from '@/constants/routes'

export function Header() {
    const navigate = useNavigate()
    const session = useAuthStore((state) => state.session)
    const clearSession = useAuthStore((state) => state.clearSession)
    const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen)

    const handleLogout = () => {
        clearSession()
        navigate(ROUTES.login)
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-ink-200 bg-paper px-4 md:px-6">
            {/* Left: Mobile Trigger & Portal Branding */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setMobileNavOpen(true)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-100 lg:hidden"
                    aria-label="Open mobile navigation"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink-900 text-paper font-semibold text-xs tracking-wider shadow-sm">
                        GOI
                    </div>
                    <div className="hidden sm:block">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold tracking-tight text-ink-900 text-sm">NLAMS</span>
                            <span className="rounded bg-terracotta-50 px-1.5 py-0.5 text-[10px] font-semibold text-terracotta-700 border border-terracotta-200">
                                SIH26016
                            </span>
                        </div>
                        <p className="text-[11px] text-ink-500 font-medium">National Land Acquisition & Management System</p>
                    </div>
                </div>
            </div>

            {/* Center: Search & Jurisdiction Context */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input
                        type="text"
                        placeholder="Search survey no, parcel ID, project code, or gazette..."
                        className="h-9 w-full rounded-md border border-ink-200 bg-ink-50/50 pl-9 pr-4 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:bg-paper focus:outline-none focus:ring-1 focus:ring-terracotta-500 transition-all"
                    />
                </div>
            </div>

            {/* Right: Notifications & User Profile & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={() => navigate(ROUTES.notifications)}
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-600 hover:bg-ink-100 transition-colors"
                    title="Notifications"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rust-500 ring-2 ring-paper" />
                </button>

                <div className="h-6 w-px bg-ink-200 hidden sm:block" />

                {session?.user ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden text-right lg:block">
                            <p className="text-xs font-semibold text-ink-900">{session.user.fullName}</p>
                            <p className="text-[10px] text-ink-500 flex items-center justify-end gap-1 font-medium">
                                <Shield className="h-3 w-3 text-terracotta-600 inline" />
                                {session.user.designation}
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-800 border border-ink-200">
                            <User className="h-4 w-4" />
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-rust-700 hover:bg-rust-50 transition-colors"
                            title="Sign out of NLAMS"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                ) : null}
            </div>
        </header>
    )
}
