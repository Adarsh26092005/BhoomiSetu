import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import type { LoginPayload } from '@/types'

export function useLogin() {
    const setSession = useAuthStore((state) => state.setSession)

    return useMutation({
        mutationFn: (payload: LoginPayload) => authService.login(payload),
        onSuccess: (session) => setSession(session),
    })
}

export function useLogout() {
    const clearSession = useAuthStore((state) => state.clearSession)

    return useMutation({
        mutationFn: authService.logout,
        onSuccess: () => clearSession(),
    })
}