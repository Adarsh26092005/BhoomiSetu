export type DocumentCategory =
    | 'GAZETTE_NOTIFICATION'
    | 'SURVEY_RECORD'
    | 'TITLE_DOCUMENT'
    | 'AWARD_DOCUMENT'
    | 'COMPENSATION_DOCUMENT'
    | 'POSSESSION_DOCUMENT'
    | 'OBJECTION_FILING'
    | 'R_AND_R_DOCUMENT'
    | 'COURT_ORDER'
    | 'PROJECT_PROPOSAL'
    | 'OTHER'

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUPERSEDED'

export type DocumentStatus = VerificationStatus

export interface DocumentVersion {
    version: number
    fileName: string
    fileSizeKb: number
    uploadedBy: string
    uploadedAt: string
    verificationStatus: VerificationStatus
    remarks?: string
}

export interface DocumentActivityEvent {
    id: string
    action: string
    actorName: string
    actorRole: string
    timestamp: string
    remarks?: string
}

export interface ProjectDocument {
    id: string
    documentNumber?: string
    title: string
    category: DocumentCategory
    projectId: string
    parcelId?: string
    surveyNumber?: string
    fileName: string
    fileType: 'PDF' | 'GEOJSON' | 'XLSX' | 'DWG' | 'IMAGE' | 'DOCX'
    fileSizeKb: number
    version: number
    uploadedBy: string
    uploadedAt: string
    uploadedOn?: string
    verifiedBy?: string
    verifiedAt?: string
    verificationStatus: VerificationStatus
    status?: VerificationStatus
    remarks?: string
    mimeType?: string
    isConfidential?: boolean
    versions?: DocumentVersion[]
    activities?: DocumentActivityEvent[]
}