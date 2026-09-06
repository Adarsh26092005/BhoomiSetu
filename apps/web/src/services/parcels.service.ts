import { MOCK_PARCELS } from '@/mock/parcels'
import type { LandParcel } from '@/types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

function delay<T>(value: T, ms = 300): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const parcelsService = {
    async list(projectId?: string): Promise<LandParcel[]> {
        if (USE_MOCKS) {
            if (projectId) {
                return delay(MOCK_PARCELS.filter((p) => p.projectId === projectId))
            }
            return delay(MOCK_PARCELS)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getById(id: string): Promise<LandParcel | undefined> {
        if (USE_MOCKS) {
            return delay(MOCK_PARCELS.find((p) => p.id === id))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getBySurveyNumber(surveyNumber: string): Promise<LandParcel | undefined> {
        if (USE_MOCKS) {
            return delay(MOCK_PARCELS.find((p) => p.surveyNumber.toLowerCase() === surveyNumber.toLowerCase()))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },
}
