import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, EffectiveJurisdictionScope } from '@/types'

interface AuthState {
    session: AuthSession | null
    effectiveScope: EffectiveJurisdictionScope | null
    isAuthenticated: boolean
    setSession: (session: AuthSession, scope?: EffectiveJurisdictionScope | null) => void
    setEffectiveScope: (scope: EffectiveJurisdictionScope | null) => void
    clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            session: null,
            effectiveScope: null,
            isAuthenticated: false,
            setSession: (session, scope = null) =>
                set({
                    session: {
                        ...session,
                        user: {
                            ...session.user,
                            effectiveScope: scope || session.user?.effectiveScope || null,
                        },
                    },
                    effectiveScope: scope || session.user?.effectiveScope || null,
                    isAuthenticated: true,
                }),
            setEffectiveScope: (effectiveScope) =>
                set((state) => ({
                    effectiveScope,
                    session: state.session
                        ? {
                              ...state.session,
                              user: {
                                  ...state.session.user,
                                  effectiveScope,
                              },
                          }
                        : null,
                })),
            clearSession: () => set({ session: null, effectiveScope: null, isAuthenticated: false }),
        }),
        { name: 'nlams-auth' },
    ),
)