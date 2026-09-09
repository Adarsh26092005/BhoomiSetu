import type {
    GisLayer,
    GeoJsonFeatureCollection,
    GisParcelProperties,
    GisProjectProperties,
    GisAdministrativeProperties,
    GisCorridorProperties,
    GisFilterState,
    GisKpiMetrics,
    SpatialAttentionItem,
    GisDistrictSummary,
} from '@/types/gis'
import {
    MOCK_GIS_LAYERS,
    MOCK_PROJECTS_GEOJSON,
    MOCK_PARCELS_GEOJSON,
    MOCK_ADMINISTRATIVE_GEOJSON,
    MOCK_CORRIDORS_GEOJSON,
} from '@/mock/gis'

import { useAuthStore } from '@/store/auth.store'

class GisService {
    async getLayers(): Promise<GisLayer[]> {
        return Promise.resolve([...MOCK_GIS_LAYERS])
    }

    async getProjectsGeoJson(): Promise<GeoJsonFeatureCollection<GisProjectProperties>> {
        const userScope = useAuthStore.getState().effectiveScope
        if (!userScope || userScope.isCentral) {
            return Promise.resolve(MOCK_PROJECTS_GEOJSON)
        }
        const filtered = MOCK_PROJECTS_GEOJSON.features.filter((f) => {
            const p = f.properties
            if (userScope.state && p.state && p.state.toLowerCase() !== userScope.state.toLowerCase()) {
                return false
            }
            if (userScope.districts && userScope.districts.length > 0 && p.districts && p.districts.length > 0) {
                if (!p.districts.some((d) => userScope.districts.some((ud) => ud.toLowerCase() === d.toLowerCase()))) {
                    return false
                }
            }
            return true
        })
        return Promise.resolve({ ...MOCK_PROJECTS_GEOJSON, features: filtered })
    }

    async getParcelsGeoJson(
        filters?: Partial<GisFilterState>,
    ): Promise<GeoJsonFeatureCollection<GisParcelProperties>> {
        const userScope = useAuthStore.getState().effectiveScope

        const filteredFeatures = MOCK_PARCELS_GEOJSON.features.filter((f) => {
            const p = f.properties

            if (userScope && !userScope.isCentral) {
                if (userScope.state && p.state && p.state.toLowerCase() !== userScope.state.toLowerCase()) {
                    return false
                }
                if (userScope.districts && userScope.districts.length > 0 && p.district) {
                    if (!userScope.districts.some((d) => d.toLowerCase() === p.district.toLowerCase())) {
                        return false
                    }
                }
            }

            if (filters) {
                if (filters.projectId && filters.projectId !== 'ALL' && p.projectId !== filters.projectId) {
                    return false
                }
                if (filters.state && filters.state !== 'ALL' && p.state !== filters.state) {
                    return false
                }
                if (filters.district && filters.district !== 'ALL' && p.district !== filters.district) {
                    return false
                }
                if (filters.village && filters.village !== 'ALL' && p.village !== filters.village) {
                    return false
                }
                if (filters.parcelStatus && filters.parcelStatus !== 'ALL' && p.parcelStatus !== filters.parcelStatus) {
                    return false
                }
                if (filters.landType && filters.landType !== 'ALL' && p.landType !== filters.landType) {
                    return false
                }
                if (filters.possessionStatus && filters.possessionStatus !== 'ALL' && p.possessionStatus !== filters.possessionStatus) {
                    return false
                }
                if (filters.randrStatus && filters.randrStatus !== 'ALL' && p.randrStatus !== filters.randrStatus) {
                    return false
                }
                if (filters.disputedOnly && !p.isDisputed) {
                    return false
                }
                if (filters.search) {
                    const q = filters.search.toLowerCase()
                    const matchId = p.parcelId.toLowerCase().includes(q)
                    const matchSurvey = p.surveyNumber.toLowerCase().includes(q)
                    const matchKhasra = p.khasraNumber?.toLowerCase().includes(q)
                    const matchVillage = p.village.toLowerCase().includes(q)
                    const matchDistrict = p.district.toLowerCase().includes(q)
                    const matchProject = p.projectName.toLowerCase().includes(q) || p.projectCode.toLowerCase().includes(q)

                    if (!matchId && !matchSurvey && !matchKhasra && !matchVillage && !matchDistrict && !matchProject) {
                        return false
                    }
                }
            }
            return true
        })

        return Promise.resolve({
            type: 'FeatureCollection',
            features: filteredFeatures,
        })
    }

    async getAdministrativeBoundaries(): Promise<GeoJsonFeatureCollection<GisAdministrativeProperties>> {
        const userScope = useAuthStore.getState().effectiveScope
        if (!userScope || userScope.isCentral) {
            return Promise.resolve(MOCK_ADMINISTRATIVE_GEOJSON)
        }
        const filtered = MOCK_ADMINISTRATIVE_GEOJSON.features.filter((f) => {
            const p = f.properties
            if (userScope.state && p.state && p.state.toLowerCase() !== userScope.state.toLowerCase()) {
                return false
            }
            if (userScope.districts && userScope.districts.length > 0 && p.district) {
                if (!userScope.districts.some((d) => d.toLowerCase() === p.district!.toLowerCase())) {
                    return false
                }
            }
            return true
        })
        return Promise.resolve({ ...MOCK_ADMINISTRATIVE_GEOJSON, features: filtered })
    }

    async getCorridors(): Promise<GeoJsonFeatureCollection<GisCorridorProperties>> {
        const userScope = useAuthStore.getState().effectiveScope
        if (!userScope || userScope.isCentral) {
            return Promise.resolve(MOCK_CORRIDORS_GEOJSON)
        }
        const projectsCollection = await this.getProjectsGeoJson()
        const projectIds = new Set(projectsCollection.features.map((f) => f.properties.projectId))
        const filtered = MOCK_CORRIDORS_GEOJSON.features.filter((f) => projectIds.has(f.properties.projectId))
        return Promise.resolve({ ...MOCK_CORRIDORS_GEOJSON, features: filtered })
    }

    async getSpatialSummary(filters?: Partial<GisFilterState>): Promise<GisKpiMetrics> {
        const parcelsCollection = await this.getParcelsGeoJson(filters)
        const parcels = parcelsCollection.features.map((f) => f.properties)
        const projectsCollection = await this.getProjectsGeoJson()
        const projects = projectsCollection.features.map((f) => f.properties)

        const filteredProjects = filters?.projectId && filters.projectId !== 'ALL'
            ? projects.filter((p) => p.projectId === filters.projectId)
            : projects

        const totalProposed = parcels.reduce((acc, p) => acc + p.areaHectares, 0)
        const totalAcquired = parcels
            .filter((p) => p.parcelStatus === 'POSSESSION_TAKEN' || p.parcelStatus === 'COMPENSATION_PAID')
            .reduce((acc, p) => acc + p.areaHectares, 0)
        const progressPct = totalProposed > 0 ? Math.round((totalAcquired / totalProposed) * 100) : 0

        const compensationPending = parcels.filter(
            (p) => p.parcelStatus === 'AWARD_DECLARED' || p.parcelStatus === 'COMPENSATION_PENDING',
        ).length

        const possessionPending = parcels.filter(
            (p) => p.parcelStatus === 'COMPENSATION_PAID' || p.parcelStatus === 'POSSESSION_PENDING',
        ).length

        const disputedCount = parcels.filter((p) => p.isDisputed).length

        const randrActive = parcels.filter(
            (p) => p.randrStatus === 'IN_PROGRESS' || p.randrStatus === 'DISPUTED',
        ).length

        return {
            projectsInView: filteredProjects.length,
            parcelsInView: parcels.length,
            totalProposedAreaHectares: Number(totalProposed.toFixed(2)),
            totalAcquiredAreaHectares: Number(totalAcquired.toFixed(2)),
            acquisitionProgressPercentage: progressPct,
            compensationPendingCount: compensationPending,
            possessionPendingCount: possessionPending,
            disputedParcelsCount: disputedCount,
            randrCasesActiveCount: randrActive,
        }
    }

    async getSpatialAttention(): Promise<SpatialAttentionItem[]> {
        const userScope = useAuthStore.getState().effectiveScope
        const projectsCollection = await this.getProjectsGeoJson()
        const allowedProjectIds = new Set(projectsCollection.features.map((f) => f.properties.projectId))

        const items: SpatialAttentionItem[] = [
            {
                id: 'att-1',
                title: 'Dispute Cluster in Medaram Lift Irrigation',
                ruleCategory: 'DISPUTE_CLUSTER',
                severity: 'HIGH',
                count: 1,
                affectedAreaHectares: 2.4,
                explanation: 'Sy. No. 301/B flagged with title discrepancy and overlapping tribal forest boundary rights.',
                recommendedAction: 'Order joint revenue inspection and schedule Lok Adalat dispute settlement hearing.',
                projectId: 'prj-003',
                parcelIds: ['pcl-104a'],
                centerCoordinates: [79.916, 18.2375],
            },
            {
                id: 'att-2',
                title: 'High-Value Commercial Plot In Litigation (Kundli RRTS)',
                ruleCategory: 'DISPUTE_CLUSTER',
                severity: 'HIGH',
                count: 1,
                affectedAreaHectares: 0.62,
                explanation: 'Khasra 114/12 subject to stay petition in High Court regarding commercial enhancement rate.',
                recommendedAction: 'Consult Government Pleader for vacation of stay under RFCTLARR Section 64 reference.',
                projectId: 'prj-002',
                parcelIds: ['pcl-103'],
                centerCoordinates: [77.0162, 28.9918],
            },
            {
                id: 'att-3',
                title: 'Compensation Disbursement Pending Post-Award (DMIC Bharuch)',
                ruleCategory: 'COMPENSATION_LAG',
                severity: 'MEDIUM',
                count: 2,
                affectedAreaHectares: 10.2,
                explanation: 'Awards declared for Block 512/P and 513/P; DBT electronic payments pending treasury release.',
                recommendedAction: 'Expedite PFMS batch generation and approve bill clearance in Treasury module.',
                projectId: 'prj-004',
                parcelIds: ['pcl-105', 'pcl-105a'],
                centerCoordinates: [73.0152, 21.7038],
            },
            {
                id: 'att-4',
                title: 'Possession Handover Delayed Post-Compensation (Nandi Cross)',
                ruleCategory: 'POSSESSION_BLOCKED',
                severity: 'MEDIUM',
                count: 1,
                affectedAreaHectares: 0.85,
                explanation: 'Compensation disbursed to single owner on Sy. No. 88/2A; Form 22 notice pending execution.',
                recommendedAction: 'Instruct Revenue Inspector to issue 48-hour physical possession notice under Section 38.',
                projectId: 'prj-001',
                parcelIds: ['pcl-102'],
                centerCoordinates: [77.726, 13.4312],
            },
            {
                id: 'att-5',
                title: 'R&R Resettlement Verification Pending (Minjur CPRR)',
                ruleCategory: 'R_AND_R_PENDING',
                severity: 'INFO',
                count: 1,
                affectedAreaHectares: 0.42,
                explanation: 'SF No. 204/4 household shifting completed; spot inspection report required for completion certificate.',
                recommendedAction: 'Schedule joint field inspection with R&R Administrator.',
                projectId: 'prj-005',
                parcelIds: ['pcl-106a'],
                centerCoordinates: [79.9065, 13.1428],
            },
        ]
        if (!userScope || userScope.isCentral) {
            return Promise.resolve(items)
        }
        return Promise.resolve(items.filter((item) => item.projectId ? allowedProjectIds.has(item.projectId) : false))
    }

    async getDistrictSummaries(): Promise<GisDistrictSummary[]> {
        const userScope = useAuthStore.getState().effectiveScope
        const summaries: GisDistrictSummary[] = [
            {
                district: 'Kolar',
                state: 'Karnataka',
                projectsCount: 1,
                parcelsCount: 1284,
                proposedAreaHectares: 412.6,
                acquiredAreaHectares: 380.2,
                disputedCount: 0,
                compensationPaidInr: 1217000000,
                compensationPendingInr: 647000000,
            },
            {
                district: 'Chikkaballapur',
                state: 'Karnataka',
                projectsCount: 1,
                parcelsCount: 340,
                proposedAreaHectares: 120.5,
                acquiredAreaHectares: 95.0,
                disputedCount: 1,
                compensationPaidInr: 4250000,
                compensationPendingInr: 4750000,
            },
            {
                district: 'Sonipat',
                state: 'Haryana',
                projectsCount: 1,
                parcelsCount: 742,
                proposedAreaHectares: 268.1,
                acquiredAreaHectares: 45.0,
                disputedCount: 1,
                compensationPaidInr: 0,
                compensationPendingInr: 2148000000,
            },
            {
                district: 'Mulugu',
                state: 'Telangana',
                projectsCount: 1,
                parcelsCount: 2310,
                proposedAreaHectares: 897.4,
                acquiredAreaHectares: 120.5,
                disputedCount: 1,
                compensationPaidInr: 580000000,
                compensationPendingInr: 2840000000,
            },
            {
                district: 'Bharuch',
                state: 'Gujarat',
                projectsCount: 1,
                parcelsCount: 986,
                proposedAreaHectares: 1204.9,
                acquiredAreaHectares: 650.0,
                disputedCount: 0,
                compensationPaidInr: 0,
                compensationPendingInr: 4985000000,
            },
            {
                district: 'Tiruvallur',
                state: 'Tamil Nadu',
                projectsCount: 1,
                parcelsCount: 1890,
                proposedAreaHectares: 331.2,
                acquiredAreaHectares: 310.4,
                disputedCount: 0,
                compensationPaidInr: 2490000000,
                compensationPendingInr: 272000000,
            },
            {
                district: 'Barmer',
                state: 'Rajasthan',
                projectsCount: 1,
                parcelsCount: 503,
                proposedAreaHectares: 156.8,
                acquiredAreaHectares: 156.8,
                disputedCount: 0,
                compensationPaidInr: 641000000,
                compensationPendingInr: 0,
            },
        ]
        if (!userScope || userScope.isCentral) {
            return Promise.resolve(summaries)
        }
        return Promise.resolve(
            summaries.filter((s) => {
                if (userScope.state && s.state.toLowerCase() !== userScope.state.toLowerCase()) {
                    return false
                }
                if (userScope.districts && userScope.districts.length > 0) {
                    return userScope.districts.some((d) => d.toLowerCase() === s.district.toLowerCase())
                }
                return true
            }),
        )
    }

    async searchFeatures(query: string) {
        if (!query || query.trim().length === 0) return []

        const q = query.toLowerCase().trim()
        const results: Array<{
            id: string
            title: string
            subtitle: string
            type: 'parcel' | 'project' | 'district'
            coordinates: [number, number]
            properties: any
        }> = []

        // Search Projects
        MOCK_PROJECTS_GEOJSON.features.forEach((f) => {
            const p = f.properties
            if (
                p.code.toLowerCase().includes(q) ||
                p.title.toLowerCase().includes(q) ||
                p.projectId.toLowerCase().includes(q) ||
                p.state.toLowerCase().includes(q)
            ) {
                results.push({
                    id: p.projectId,
                    title: `${p.code} - ${p.title}`,
                    subtitle: `Project Node • ${p.state} (${p.districts.join(', ')})`,
                    type: 'project',
                    coordinates: f.geometry.coordinates as [number, number],
                    properties: p,
                })
            }
        })

        // Search Parcels
        MOCK_PARCELS_GEOJSON.features.forEach((f) => {
            const p = f.properties
            if (
                p.parcelId.toLowerCase().includes(q) ||
                p.surveyNumber.toLowerCase().includes(q) ||
                p.khasraNumber?.toLowerCase().includes(q) ||
                p.village.toLowerCase().includes(q) ||
                p.district.toLowerCase().includes(q)
            ) {
                // Centroid calculation from polygon coordinates
                const coords = f.geometry.coordinates[0]
                const lng = (coords[0][0] + coords[2][0]) / 2
                const lat = (coords[0][1] + coords[2][1]) / 2

                results.push({
                    id: p.parcelId,
                    title: `${p.surveyNumber} (${p.parcelId})`,
                    subtitle: `Cadastral Plot • ${p.village}, ${p.district} • ${p.projectName}`,
                    type: 'parcel',
                    coordinates: [lng, lat],
                    properties: p,
                })
            }
        })

        // Search Districts
        MOCK_ADMINISTRATIVE_GEOJSON.features.forEach((f) => {
            const p = f.properties
            if (p.name.toLowerCase().includes(q) || p.state.toLowerCase().includes(q)) {
                const coords = f.geometry.coordinates[0]
                const lng = (coords[0][0] + coords[2][0]) / 2
                const lat = (coords[0][1] + coords[2][1]) / 2

                results.push({
                    id: p.id,
                    title: `${p.name}, ${p.state}`,
                    subtitle: `Administrative Jurisdiction • ${p.totalParcelsCount} Plots`,
                    type: 'district',
                    coordinates: [lng, lat],
                    properties: p,
                })
            }
        })

        return results.slice(0, 8)
    }

    async getParcelById(id: string): Promise<GisParcelProperties | null> {
        const feature = MOCK_PARCELS_GEOJSON.features.find((f) => f.properties.parcelId === id)
        return feature ? feature.properties : null
    }

    async getProjectById(id: string): Promise<GisProjectProperties | null> {
        const feature = MOCK_PROJECTS_GEOJSON.features.find((f) => f.properties.projectId === id)
        return feature ? feature.properties : null
    }
}

export const gisService = new GisService()
