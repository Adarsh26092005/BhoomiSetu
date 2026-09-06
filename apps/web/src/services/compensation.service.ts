import { MOCK_COMPENSATION_RECORDS } from '@/mock/compensation'
import type { CompensationRecord, CompensationPaymentStatus } from '@/types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

function delay<T>(value: T, ms = 300): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let compensationState: CompensationRecord[] = [...MOCK_COMPENSATION_RECORDS]

export const compensationService = {
    async list(projectId?: string, parcelId?: string): Promise<CompensationRecord[]> {
        if (USE_MOCKS) {
            let filtered = [...compensationState]
            if (projectId) {
                filtered = filtered.filter((c) => c.projectId === projectId)
            }
            if (parcelId) {
                filtered = filtered.filter((c) => c.parcelId === parcelId)
            }
            return delay(filtered)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getById(id: string): Promise<CompensationRecord | undefined> {
        if (USE_MOCKS) {
            return delay(compensationState.find((c) => c.id === id))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getByProjectId(projectId: string): Promise<CompensationRecord[]> {
        if (USE_MOCKS) {
            return delay(compensationState.filter((c) => c.projectId === projectId))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async getByParcelId(parcelId: string): Promise<CompensationRecord | undefined> {
        if (USE_MOCKS) {
            return delay(compensationState.find((c) => c.parcelId === parcelId))
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async approveAssessment(id: string, remarks?: string): Promise<CompensationRecord> {
        if (USE_MOCKS) {
            const record = compensationState.find((c) => c.id === id)
            if (!record) throw new Error(`Compensation record ${id} not found`)

            const updated: CompensationRecord = {
                ...record,
                assessmentStatus: 'PAYMENT_APPROVED',
                paymentStatus: 'APPROVED',
                approvedDate: new Date().toISOString().split('T')[0],
                lastUpdatedAt: new Date().toISOString().split('T')[0],
                remarks: remarks || record.remarks,
                timeline: [
                    ...record.timeline,
                    {
                        id: `t-${Date.now()}`,
                        compensationId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'Anand Kumar (LAO Officer)',
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'ASSESSMENT_APPROVED',
                        remarks: remarks || 'Compensation assessment approved and cleared for payment disbursement',
                    },
                ],
            }
            compensationState = compensationState.map((c) => (c.id === id ? updated : c))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async returnAssessment(id: string, remarks: string): Promise<CompensationRecord> {
        if (USE_MOCKS) {
            const record = compensationState.find((c) => c.id === id)
            if (!record) throw new Error(`Compensation record ${id} not found`)

            const updated: CompensationRecord = {
                ...record,
                assessmentStatus: 'UNDER_ASSESSMENT',
                lastUpdatedAt: new Date().toISOString().split('T')[0],
                remarks,
                timeline: [
                    ...record.timeline,
                    {
                        id: `t-${Date.now()}`,
                        compensationId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'Anand Kumar (LAO Officer)',
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'ASSESSMENT_RETURNED_FOR_REVIEW',
                        remarks,
                    },
                ],
            }
            compensationState = compensationState.map((c) => (c.id === id ? updated : c))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async placeOnHold(id: string, remarks: string): Promise<CompensationRecord> {
        if (USE_MOCKS) {
            const record = compensationState.find((c) => c.id === id)
            if (!record) throw new Error(`Compensation record ${id} not found`)

            const updated: CompensationRecord = {
                ...record,
                assessmentStatus: 'ON_HOLD',
                paymentStatus: 'ON_HOLD',
                holdReason: remarks,
                lastUpdatedAt: new Date().toISOString().split('T')[0],
                timeline: [
                    ...record.timeline,
                    {
                        id: `t-${Date.now()}`,
                        compensationId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'Anand Kumar (LAO Officer)',
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'PAYMENT_PLACED_ON_HOLD',
                        remarks,
                    },
                ],
            }
            compensationState = compensationState.map((c) => (c.id === id ? updated : c))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async resumeReview(id: string, remarks?: string): Promise<CompensationRecord> {
        if (USE_MOCKS) {
            const record = compensationState.find((c) => c.id === id)
            if (!record) throw new Error(`Compensation record ${id} not found`)

            const updated: CompensationRecord = {
                ...record,
                assessmentStatus: 'UNDER_ASSESSMENT',
                paymentStatus: 'PENDING',
                holdReason: undefined,
                lastUpdatedAt: new Date().toISOString().split('T')[0],
                timeline: [
                    ...record.timeline,
                    {
                        id: `t-${Date.now()}`,
                        compensationId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'Anand Kumar (LAO Officer)',
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: 'PAYMENT_REVIEW_RESUMED',
                        remarks: remarks || 'Stay lifted / review resumed for payment processing',
                    },
                ],
            }
            compensationState = compensationState.map((c) => (c.id === id ? updated : c))
            return delay(updated, 400)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },

    async recordDisbursement(
        id: string,
        amountInr: number,
        transactionReference: string,
        remarks?: string,
    ): Promise<CompensationRecord> {
        if (USE_MOCKS) {
            const record = compensationState.find((c) => c.id === id)
            if (!record) throw new Error(`Compensation record ${id} not found`)

            const newDisbursed = record.amountDisbursedInr + amountInr
            const newPending = Math.max(0, record.totalPayableAmountInr - newDisbursed)
            const newPaymentStatus: CompensationPaymentStatus =
                newPending === 0 ? 'DISBURSED' : 'PARTIALLY_DISBURSED'

            const newTxn = {
                id: `txn-${Date.now()}`,
                compensationId: id,
                transactionReference: transactionReference || `PFMS-${Date.now().toString().slice(-6)}`,
                date: new Date().toISOString().split('T')[0],
                amountInr,
                paymentStatus: newPaymentStatus,
                recordedBy: 'Anand Kumar (LAO Officer)',
                remarks: remarks || `Disbursement of ₹${amountInr.toLocaleString('en-IN')}`,
            }

            const updated: CompensationRecord = {
                ...record,
                amountDisbursedInr: newDisbursed,
                amountPendingInr: newPending,
                paymentStatus: newPaymentStatus,
                assessmentStatus: newPending === 0 ? 'DISBURSED' : 'PARTIALLY_DISBURSED',
                lastUpdatedAt: new Date().toISOString().split('T')[0],
                transactions: [newTxn, ...record.transactions],
                timeline: [
                    ...record.timeline,
                    {
                        id: `t-${Date.now()}`,
                        compensationId: id,
                        timestamp: new Date().toISOString(),
                        actor: 'Anand Kumar (LAO Officer)',
                        role: 'LAND_ACQUISITION_OFFICER',
                        organization: 'DISTRICT_AUTHORITY',
                        action: newPending === 0 ? 'FULL_DISBURSEMENT_RECORDED' : 'PARTIAL_DISBURSEMENT_RECORDED',
                        remarks: `Recorded disbursement of ₹${amountInr.toLocaleString('en-IN')}. Ref: ${newTxn.transactionReference}`,
                    },
                ],
            }
            compensationState = compensationState.map((c) => (c.id === id ? updated : c))
            return delay(updated, 500)
        }
        throw new Error('Live API not yet connected — set VITE_USE_MOCKS=true')
    },
}
