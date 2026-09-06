import type { ProjectStatus, ParcelStatus, LandType } from '@/types'

// GeoJSON Specification Types
export type GeoJsonGeometryType =
    | 'Point'
    | 'MultiPoint'
    | 'LineString'
    | 'MultiLineString'
    | 'Polygon'
    | 'MultiPolygon'
    | 'GeometryCollection'

export interface GeoJsonGeometry {
    type: GeoJsonGeometryType
    coordinates: any // standard GeoJSON coordinate arrays
}

export interface GeoJsonFeature<P = Record<string, any>> {
    type: 'Feature'
    id?: string | number
    geometry: GeoJsonGeometry
    properties: P
}

export interface GeoJsonFeatureCollection<P = Record<string, any>> {
    type: 'FeatureCollection'
    features: GeoJsonFeature<P>[]
}

// Layer Identifiers
export type GisLayerId =
    | 'project-locations'
    | 'cadastral-parcels'
    | 'proposed-acquisition'
    | 'acquired-land'
    | 'compensation-status'
    | 'possession-status'
    | 'randr-status'
    | 'disputed-parcels'
    | 'administrative-boundaries'
    | 'project-corridors'

export interface GisLayer {
    id: GisLayerId
    label: string
    description: string
    visible: boolean
    featureCount: number
    color: string
    category: 'cadastral' | 'projects' | 'status' | 'administrative'
}

// Spatial Feature Properties
export interface GisParcelProperties {
    parcelId: string
    surveyNumber: string
    khasraNumber?: string
    projectId: string
    projectCode: string
    projectName: string
    village: string
    tehsil?: string
    district: string
    state: string
    landType: LandType
    areaHectares: number
    parcelStatus: ParcelStatus
    compensationInr: number
    marketRateInrPerHectare: number
    compensationStatus?: string
    possessionStatus?: string
    randrStatus?: string
    isDisputed: boolean
    landownerCount: number
    lastUpdated?: string
}

export interface GisProjectProperties {
    projectId: string
    code: string
    title: string
    category: string
    projectStatus: ProjectStatus
    implementingAgency: string
    state: string
    districts: string[]
    totalAreaHectares: number
    parcelCount: number
    affectedLandowners: number
    estimatedCompensationInr: number
    disbursedCompensationInr: number
    notifiedOn?: string
    targetCompletionOn?: string
}

export interface GisAdministrativeProperties {
    id: string
    name: string
    level: 'STATE' | 'DISTRICT' | 'TEHSIL' | 'VILLAGE'
    state: string
    district?: string
    totalProjectsCount: number
    totalParcelsCount: number
    totalAreaHectares: number
    acquiredAreaHectares: number
    disputedParcelsCount: number
}

export interface GisCorridorProperties {
    id: string
    projectId: string
    projectCode: string
    projectName: string
    corridorName: string
    lengthKm?: number
    bufferWidthMeters?: number
    category: string
}

// Viewport and Selections
export interface GisMapViewport {
    lat: number
    lng: number
    zoom: number
    pitch?: number
    bearing?: number
}

export type GisMapBaseStyle = 'light' | 'dark' | 'satellite' | 'terrain'

export type MapSelectionType = 'parcel' | 'project' | 'administrative' | 'district' | 'corridor' | null

export interface MapSelection {
    type: MapSelectionType
    id: string
    properties?: any
    coordinates?: [number, number]
}

// Spatial Filters
export interface GisFilterState {
    search: string
    projectId: string
    state: string
    district: string
    village: string
    parcelStatus: ParcelStatus | 'ALL'
    projectStatus: ProjectStatus | 'ALL'
    landType: LandType | 'ALL'
    compensationStatus: 'ALL' | 'PAID' | 'PENDING' | 'UNDER_ASSESSMENT'
    possessionStatus: 'ALL' | 'POSSESSION_TAKEN' | 'POSSESSION_PENDING'
    randrStatus: 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'DISPUTED'
    disputedOnly: boolean
}

// Spatial KPIs & Attention Engine
export interface GisKpiMetrics {
    projectsInView: number
    parcelsInView: number
    totalProposedAreaHectares: number
    totalAcquiredAreaHectares: number
    acquisitionProgressPercentage: number
    compensationPendingCount: number
    possessionPendingCount: number
    disputedParcelsCount: number
    randrCasesActiveCount: number
}

export type SpatialRiskSeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export interface SpatialAttentionItem {
    id: string
    title: string
    ruleCategory: 'DISPUTE_CLUSTER' | 'COMPENSATION_LAG' | 'POSSESSION_BLOCKED' | 'R_AND_R_PENDING' | 'ACQUISITION_DELAY'
    severity: SpatialRiskSeverity
    count: number
    affectedAreaHectares?: number
    explanation: string
    recommendedAction: string
    projectId?: string
    parcelIds?: string[]
    centerCoordinates?: [number, number]
}

export interface GisDistrictSummary {
    district: string
    state: string
    projectsCount: number
    parcelsCount: number
    proposedAreaHectares: number
    acquiredAreaHectares: number
    disputedCount: number
    compensationPaidInr: number
    compensationPendingInr: number
}
