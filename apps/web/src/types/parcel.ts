export type ParcelStatus =
    | 'IDENTIFIED'
    | 'VERIFICATION_PENDING'
    | 'VERIFIED'
    | 'DISPUTED'
    | 'UNDER_ACQUISITION'
    | 'AWARD_DECLARED'
    | 'COMPENSATION_PENDING'
    | 'COMPENSATION_PAID'
    | 'POSSESSION_PENDING'
    | 'POSSESSION_TAKEN'

export type LandType = 'AGRICULTURAL' | 'HOMESTEAD' | 'FOREST' | 'COMMERCIAL' | 'GOVERNMENT_WASTE'

export interface GeoPoint {
    lat: number
    lng: number
}

export interface Landowner {
    id: string
    fullName: string
    fatherOrSpouseName: string
    aadhaarLast4: string
    village: string
    contactPhone?: string
    shareInParcelPercent: number
    compensationAmountInr?: number
    verificationStatus?: 'VERIFIED' | 'PENDING' | 'DISPUTED'
    bankAccountLinked?: boolean
}

export interface LandParcel {
    id: string
    surveyNumber: string
    khasraNumber?: string
    projectId: string
    village: string
    tehsil?: string
    district: string
    state: string
    landType: LandType
    areaHectares: number
    status: ParcelStatus
    marketRateInrPerHectare: number
    compensationInr: number
    centroid: GeoPoint
    owners: Landowner[]
    gisPolygonReference?: string
    lastUpdated?: string
}

export const PARCEL_STATUS_SEQUENCE: ParcelStatus[] = [
    'IDENTIFIED',
    'VERIFICATION_PENDING',
    'VERIFIED',
    'UNDER_ACQUISITION',
    'AWARD_DECLARED',
    'COMPENSATION_PENDING',
    'COMPENSATION_PAID',
    'POSSESSION_PENDING',
    'POSSESSION_TAKEN',
]