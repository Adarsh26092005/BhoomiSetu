import { MOCK_DOCUMENTS } from '@/mock/documents'
import type { ProjectDocument, VerificationStatus } from '@/types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

function delay<T>(value: T, ms = 300): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// In-memory array for interactive demo verification mutations
let documentsState: ProjectDocument[] = [...MOCK_DOCUMENTS]

export const documentsService = {
    async list(projectId?: string, parcelId?: string): Promise<ProjectDocument[]> {
        if (USE_MOCKS) {
            let filtered = [...documentsState]
            if (projectId) {
                filtered = filtered.filter((d) => d.projectId === projectId)
            }
            if (parcelId) {
                filtered = filtered.filter((d) => d.parcelId === parcelId)
            }
            return delay(filtered)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getById(id: string): Promise<ProjectDocument | undefined> {
        if (USE_MOCKS) {
            return delay(documentsState.find((d) => d.id === id))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async verify(id: string, newStatus: VerificationStatus, remarks?: string): Promise<ProjectDocument> {
        if (USE_MOCKS) {
            const doc = documentsState.find((d) => d.id === id)
            if (!doc) throw new Error(`Document with ID ${id} not found`)

            const updated: ProjectDocument = {
                ...doc,
                verificationStatus: newStatus,
                status: newStatus,
                verifiedBy: 'Anand Kumar (LAO Officer)',
                verifiedAt: new Date().toISOString().split('T')[0],
                remarks: remarks || doc.remarks,
                activities: [
                    ...(doc.activities || []),
                    {
                        id: `act-${Date.now()}`,
                        action: `STATUS_CHANGED_TO_${newStatus}`,
                        actorName: 'Anand Kumar',
                        actorRole: 'LAND_ACQUISITION_OFFICER',
                        timestamp: new Date().toISOString(),
                        remarks: remarks || `Verification status updated to ${newStatus}`,
                    },
                ],
            }

            documentsState = documentsState.map((d) => (d.id === id ? updated : d))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async createMock(data: Partial<ProjectDocument>): Promise<ProjectDocument> {
        if (USE_MOCKS) {
            const newDoc: ProjectDocument = {
                id: `doc-${Date.now()}`,
                documentNumber: `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                title: data.title || 'Untitled Statutory Document',
                category: data.category || 'OTHER',
                projectId: data.projectId || 'prj-001',
                parcelId: data.parcelId,
                fileName: data.fileName || 'uploaded_document.pdf',
                fileType: (data.fileType as any) || 'PDF',
                fileSizeKb: data.fileSizeKb || 1500,
                version: 1,
                uploadedBy: 'Anand Kumar (LAO Officer)',
                uploadedAt: new Date().toISOString().split('T')[0],
                verificationStatus: 'PENDING',
                remarks: data.remarks || 'Uploaded via statutory portal',
                versions: [
                    {
                        version: 1,
                        fileName: data.fileName || 'uploaded_document.pdf',
                        fileSizeKb: data.fileSizeKb || 1500,
                        uploadedBy: 'Anand Kumar (LAO Officer)',
                        uploadedAt: new Date().toISOString().split('T')[0],
                        verificationStatus: 'PENDING',
                        remarks: 'Initial statutory upload',
                    },
                ],
                activities: [
                    {
                        id: `act-${Date.now()}`,
                        action: 'UPLOADED_DOCUMENT',
                        actorName: 'Anand Kumar',
                        actorRole: 'LAND_ACQUISITION_OFFICER',
                        timestamp: new Date().toISOString(),
                        remarks: 'Initial document draft uploaded to vault',
                    },
                ],
            }
            documentsState = [newDoc, ...documentsState]
            return delay(newDoc, 500)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },
}
