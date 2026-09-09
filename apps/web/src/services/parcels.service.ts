import { apiClient } from './api-client'
import type { LandParcel } from '@/types'

function mapBackendToLandParcel(p: any): LandParcel {
    return {
        id: p.id,
        surveyNumber: p.surveyNumber,
        khasraNumber: p.khasraNumber ?? undefined,
        projectId: p.projectId,
        village: p.village,
        tehsil: p.tehsil ?? undefined,
        district: p.district,
        state: p.state,
        landType: p.landType,
        areaHectares: Number(p.areaHectares) || 0,
        status: p.status,
        marketRateInrPerHectare: Number(p.marketRateInrPerHectare) || 0,
        compensationInr: Number(p.compensationInr) || 0,
        centroid: {
            lat: p.centroidLat ?? 0,
            lng: p.centroidLng ?? 0,
        },
        owners: (p.landowners || []).map((o: any) => ({
            id: o.id || o.landownerId,
            fullName: o.fullName,
            fatherOrSpouseName: o.fatherOrSpouseName || '',
            aadhaarLast4: o.aadhaarLast4 || 'XXXX',
            village: o.village || p.village,
            shareInParcelPercent: Number(o.ownershipPercentage) || 100,
            verificationStatus: o.verificationStatus || 'VERIFIED',
        })),
        gisPolygonReference: p.gisPolygonReference ?? undefined,
        lastUpdated: p.updatedAt,
    }
}

export const parcelsService = {
    async list(projectId?: string): Promise<LandParcel[]> {
        try {
            const query = new URLSearchParams()
            if (projectId && projectId !== 'ALL') {
                query.set('projectId', projectId)
            }
            query.set('limit', '100')
            const res = await apiClient.get<any>(`/parcels?${query.toString()}`)
            if (res?.items) {
                return res.items.map(mapBackendToLandParcel)
            }
            if (Array.isArray(res)) {
                return res.map(mapBackendToLandParcel)
            }
        } catch (err) {
            console.error('Failed to list parcels from API:', err)
        }
        return []
    },

    async getById(id: string): Promise<LandParcel | undefined> {
        try {
            const res = await apiClient.get<any>(`/parcels/${id}`)
            if (res) return mapBackendToLandParcel(res)
        } catch (err) {
            console.error(`Failed to get parcel ${id}:`, err)
        }
        return undefined
    },

    async getBySurveyNumber(surveyNumber: string): Promise<LandParcel | undefined> {
        try {
            const res = await apiClient.get<any>(`/parcels?surveyNumber=${encodeURIComponent(surveyNumber)}`)
            if (res?.items && res.items.length > 0) {
                return mapBackendToLandParcel(res.items[0])
            }
        } catch (err) {
            console.error(`Failed to get parcel by survey number ${surveyNumber}:`, err)
        }
        return undefined
    },
}

