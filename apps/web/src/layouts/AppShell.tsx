import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export function AppShell() {
    return (
        <div className="min-h-screen flex flex-col bg-paper text-ink-900">
            {/* Top National Header */}
            <Header />

            {/* Main Application Area with Sidebar + Content */}
            <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
                <Sidebar />
                <main className="flex-1 min-w-0 bg-ink-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
