import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
    children: React.ReactNode
    redirectTo?: string
}

export function ProtectedRoute({
    children,
    redirectTo = '/login'
}: ProtectedRouteProps) {

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    const location = useLocation()


    if (!isAuthenticated) {
        return (
            <Navigate
                to={redirectTo}
                replace
                state={{ from: location.pathname }}
            />
        )
    }

    return <>{children}</>
}

export function GuestRoute({
    children,
    redirectTo = '/'
}: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />
    }

    return <>{children}</>
}
