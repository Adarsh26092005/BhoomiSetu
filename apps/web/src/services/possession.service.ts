import { MOCK_POSSESSION_RECORDS } from '@/mock/possession'
import type {
    PossessionRecord,
    PossessionStatus,
    SiteVerificationResult,
} from '@/types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

function delay<T>(value: T, ms = 300): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let possessionState: PossessionRecord[] = [...MOCK_POSSESSION_RECORDS]

export const possessionService = {
    async list(projectId?: string, parcelId?: string): Promise<PossessionRecord[]> {
        if (USE_MOCKS) {
            let filtered = [...possessionState]
            if (projectId) {
                filtered = filtered.filter((p) => p.projectId === projectId)
            }
            if (parcelId) {
                filtered = filtered.filter((p) => p.parcelId === parcelId)
            }
            return delay(filtered)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getById(id: string): Promise<PossessionRecord | undefined> {
        if (USE_MOCKS) {
            return delay(possessionState.find((p) => p.id === id))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getByProjectId(projectId: string): Promise<PossessionRecord[]> {
        if (USE_MOCKS) {
            return delay(possessionState.filter((p) => p.projectId === projectId))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getByParcelId(parcelId: string): Promise<PossessionRecord | undefined> {
        if (USE_MOCKS) {
            return delay(possessionState.find((p) => p.parcelId === parcelId))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async prepareNotice(
        id: string,
        data: { noticeReference: string; remarks?: string },
    ): Promise<PossessionRecord> {
        if (USE_MOCKS) {
            const record = possessionState.find((p) => p.id === id)
            if (!record) throw new Error(`Possession record ${id} not found`)

            const updated: PossessionRecord = {
                ...record,
                possessionStatus: 'NOTICE_PREPARED',
                noticeReference: data.noticeReference,
                noticeDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...record.timeline,
                    {
                        id: `pt-${Date.now()}`,
                        possessionId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'Anand Kumar',
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'NOTICE_PREPARED',
                        remarks: data.remarks || `Form 21 possession notice prepared: ${data.noticeReference}`,
                    },
                ],
            }
            possessionState = possessionState.map((p) => (p.id === id ? updated : p))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async issueNotice(
        id: string,
        data?: { remarks?: string },
    ): Promise<PossessionRecord> {
        if (USE_MOCKS) {
            const record = possessionState.find((p) => p.id === id)
            if (!record) throw new Error(`Possession record ${id} not found`)

            const updated: PossessionRecord = {
                ...record,
                possessionStatus: 'NOTICE_ISSUED',
                noticeDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...record.timeline,
                    {
                        id: `pt-${Date.now()}`,
                        possessionId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'District Magistrate',
                        role: 'DISTRICT_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'NOTICE_ISSUED',
                        remarks: data?.remarks || 'Form 21 Statutory Possession Notice served to landowners',
                    },
                ],
            }
            possessionState = possessionState.map((p) => (p.id === id ? updated : p))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async schedulePossession(
        id: string,
        data: { scheduledDate: string; officer: string; remarks?: string },
    ): Promise<PossessionRecord> {
        if (USE_MOCKS) {
            const record = possessionState.find((p) => p.id === id)
            if (!record) throw new Error(`Possession record ${id} not found`)

            const updated: PossessionRecord = {
                ...record,
                possessionStatus: 'SCHEDULED',
                scheduledDate: data.scheduledDate,
                assignedOfficer: data.officer,
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...record.timeline,
                    {
                        id: `pt-${Date.now()}`,
                        possessionId: id,
                        timestamp: new Date().toISOString(),
                        actor: data.officer,
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'POSSESSION_SCHEDULED',
                        remarks: data.remarks || `Physical possession drive scheduled for ${data.scheduledDate}`,
                    },
                ],
            }
            possessionState = possessionState.map((p) => (p.id === id ? updated : p))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async recordSiteVerification(
        id: string,
        data: {
            visitDate: string;
            officer: string;
            result: SiteVerificationResult;
            observations: string;
            remarks?: string;
        },
    ): Promise<PossessionRecord> {
        if (USE_MOCKS) {
            const record = possessionState.find((p) => p.id === id)
            if (!record) throw new Error(`Possession record ${id} not found`)

            const nextStatus: PossessionStatus =
                data.result === 'BLOCKED' ? 'ON_HOLD' : 'POSSESSION_PENDING'

            const updated: PossessionRecord = {
                ...record,
                possessionStatus: nextStatus,
                siteVerificationDate: data.visitDate,
                siteVerificationOfficer: data.officer,
                siteVerificationResult: data.result,
                siteObservations: data.observations,
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...record.timeline,
                    {
                        id: `pt-${Date.now()}`,
                        possessionId: id,
                        timestamp: new Date().toISOString(),
                        actor: data.officer,
                        role: 'SURVEY_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'SITE_VERIFICATION_RECORDED',
                        remarks: data.remarks || `Result: ${data.result}. Observations: ${data.observations}`,
                    },
                ],
            }
            possessionState = possessionState.map((p) => (p.id === id ? updated : p))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async recordPossession(
        id: string,
        data: {
            possessionDate: string;
            officer: string;
            remarks?: string;
        },
    ): Promise<PossessionRecord> {
        if (USE_MOCKS) {
            const record = possessionState.find((p) => p.id === id)
            if (!record) throw new Error(`Possession record ${id} not found`)

            const updated: PossessionRecord = {
                ...record,
                possessionStatus: 'POSSESSION_TAKEN',
                possessionDate: data.possessionDate,
                assignedOfficer: data.officer,
                slaStatus: 'COMPLETED',
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...record.timeline,
                    {
                        id: `pt-${Date.now()}`,
                        possessionId: id,
                        timestamp: new Date().toISOString(),
                        actor: data.officer,
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'POSSESSION_TAKEN',
                        remarks: data.remarks || `Physical possession taken under Section 38 RFCTLARR Act 2013`,
                    },
                ],
            }
            possessionState = possessionState.map((p) => (p.id === id ? updated : p))
            return delay(updated, 500)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async generateMockCertificate(
        id: string,
        data: { certificateRef: string; remarks?: string },
    ): Promise<PossessionRecord> {
        if (USE_MOCKS) {
            const record = possessionState.find((p) => p.id === id)
            if (!record) throw new Error(`Possession record ${id} not found`)

            const updated: PossessionRecord = {
                ...record,
                possessionStatus: 'CERTIFICATE_ISSUED',
                certificateId: data.certificateRef,
                certificateDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...record.timeline,
                    {
                        id: `pt-${Date.now()}`,
                        possessionId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'District Magistrate',
                        role: 'DISTRICT_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'CERTIFICATE_ISSUED',
                        remarks: data.remarks || `Form 22 Possession Certificate signed: ${data.certificateRef}`,
                    },
                ],
            }
            possessionState = possessionState.map((p) => (p.id === id ? updated : p))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async addRemark(
        id: string,
        remarkText: string,
    ): Promise<PossessionRecord> {
        if (USE_MOCKS) {
            const record = possessionState.find((p) => p.id === id)
            if (!record) throw new Error(`Possession record ${id} not found`)

            const newRemark = {
                id: `rmk-${Date.now()}`,
                possessionId: id,
                author: 'Anand Kumar',
                role: 'LAND_ACQUISITION_OFFICER',
                organization: 'DISTRICT_AUTHORITY',
                timestamp: new Date().toISOString(),
                remark: remarkText,
            }

            const updated: PossessionRecord = {
                ...record,
                remarksList: [newRemark, ...record.remarksList],
                updatedAt: new Date().toISOString(),
            }
            possessionState = possessionState.map((p) => (p.id === id ? updated : p))
            return delay(updated, 300)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async placeOnHold(id: string, reason: string): Promise<PossessionRecord> {
        if (USE_MOCKS) {
            const record = possessionState.find((p) => p.id === id)
            if (!record) throw new Error(`Possession record ${id} not found`)

            const updated: PossessionRecord = {
                ...record,
                possessionStatus: 'ON_HOLD',
                holdReason: reason,
                readinessStatus: 'BLOCKED',
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...record.timeline,
                    {
                        id: `pt-${Date.now()}`,
                        possessionId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'Anand Kumar',
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'POSSESSION_PLACED_ON_HOLD',
                        remarks: reason,
                    },
                ],
            }
            possessionState = possessionState.map((p) => (p.id === id ? updated : p))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async resumeReview(id: string, remarks?: string): Promise<PossessionRecord> {
        if (USE_MOCKS) {
            const record = possessionState.find((p) => p.id === id)
            if (!record) throw new Error(`Possession record ${id} not found`)

            const updated: PossessionRecord = {
                ...record,
                possessionStatus: 'READY_FOR_POSSESSION',
                holdReason: undefined,
                readinessStatus: 'READY',
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...record.timeline,
                    {
                        id: `pt-${Date.now()}`,
                        possessionId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'Anand Kumar',
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'POSSESSION_REVIEW_RESUMED',
                        remarks: remarks || 'Stay resolved; possession preparation resumed',
                    },
                ],
            }
            possessionState = possessionState.map((p) => (p.id === id ? updated : p))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },
}
