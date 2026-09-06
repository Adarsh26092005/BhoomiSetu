import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'

export function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const session = useAuthStore((state) => state.session)
    const location = useLocation()

    if (!isAuthenticated || !session) {
        return <Navigate to={ROUTES.login} state={{ from: location }} replace />
    }

    return <Outlet />
}
