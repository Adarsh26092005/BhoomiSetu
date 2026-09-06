import type {
    RAndRCase,
    RAndREligibilityStatus,
    RAndRBenefitType,
    RAndRBenefitStatus,
    PostRelocationVerificationResult,
    REntitlement,
    RAndRBenefit,
    RAndRTimelineEvent,
    RAndRRemark,
} from '@/types'
import { MOCK_R_AND_R_CASES } from '@/mock/rehabilitation'

let casesState: RAndRCase[] = [...MOCK_R_AND_R_CASES]

export const RehabilitationService = {
    async list(projectId?: string, parcelId?: string): Promise<RAndRCase[]> {
        await new Promise((r) => setTimeout(r, 120))
        let filtered = [...casesState]
        if (projectId && projectId !== 'ALL') {
            filtered = filtered.filter((c) => c.projectId === projectId)
        }
        if (parcelId) {
            filtered = filtered.filter((c) => c.parcelId === parcelId)
        }
        return filtered
    },

    async getById(id: string): Promise<RAndRCase | null> {
        await new Promise((r) => setTimeout(r, 100))
        const found = casesState.find((c) => c.id === id)
        return found ? { ...found } : null
    },

    async getByProjectId(projectId: string): Promise<RAndRCase[]> {
        await new Promise((r) => setTimeout(r, 100))
        return casesState.filter((c) => c.projectId === projectId)
    },

    async getByParcelId(parcelId: string): Promise<RAndRCase[]> {
        await new Promise((r) => setTimeout(r, 100))
        return casesState.filter((c) => c.parcelId === parcelId)
    },

    async startEligibilityReview(id: string): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: 'ELIGIBILITY_REVIEW_STARTED',
            remarks: 'Formal scrutiny of socio-economic survey & household documentation commenced.',
        }

        const updated: RAndRCase = {
            ...current,
            rAndRStatus: 'ELIGIBILITY_REVIEW',
            eligibilityStatus: 'UNDER_REVIEW',
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: new Date().toISOString(),
        }

        casesState[idx] = updated
        return updated
    },

    async recordEligibilityAssessment(
        id: string,
        data: { status: RAndREligibilityStatus; remarks: string },
    ): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: `ELIGIBILITY_${data.status}`,
            remarks: `Assessment result recorded as ${data.status}. ${data.remarks}`,
        }

        const nextStatus = data.status === 'ELIGIBLE'
            ? (current.entitlements.length > 0 ? 'PLAN_PREPARED' : 'ENTITLEMENT_DEFINED')
            : data.status === 'DISPUTED'
            ? 'DISPUTED'
            : current.rAndRStatus

        const updated: RAndRCase = {
            ...current,
            rAndRStatus: nextStatus,
            eligibilityStatus: data.status,
            assessmentDate: now.split('T')[0],
            assessingOfficer: current.assignedOfficer,
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async defineEntitlement(
        id: string,
        data: { entitlementType: RAndRBenefitType; description: string; quantityValue?: string; remarks?: string },
    ): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const newEntitlement: REntitlement = {
            id: `ent-${Date.now().toString().slice(-4)}`,
            rAndRCaseId: id,
            entitlementType: data.entitlementType,
            description: data.description,
            quantityValue: data.quantityValue,
            status: 'DEFINED',
            remarks: data.remarks,
        }

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: 'ENTITLEMENT_DEFINED',
            remarks: `Entitlement added: ${data.description}`,
        }

        const updated: RAndRCase = {
            ...current,
            rAndRStatus: current.rAndRStatus === 'IDENTIFIED' || current.rAndRStatus === 'ASSESSMENT_PENDING' ? 'ENTITLEMENT_DEFINED' : current.rAndRStatus,
            entitlements: [...current.entitlements, newEntitlement],
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async addBenefit(
        id: string,
        data: { benefitType: RAndRBenefitType; plannedValue: number; approvedValue: number; responsibleOfficer: string; remarks?: string },
    ): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const newBenefit: RAndRBenefit = {
            id: `ben-${Date.now().toString().slice(-4)}`,
            rAndRCaseId: id,
            benefitType: data.benefitType,
            status: 'APPROVED',
            plannedValue: data.plannedValue,
            approvedValue: data.approvedValue,
            deliveredValue: 0,
            responsibleOfficer: data.responsibleOfficer,
            remarks: data.remarks,
        }

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: 'BENEFIT_APPROVED',
            remarks: `Approved benefit item: ₹${data.approvedValue.toLocaleString('en-IN')}`,
        }

        const updated: RAndRCase = {
            ...current,
            rAndRStatus: 'BENEFIT_IN_PROGRESS',
            benefits: [...current.benefits, newBenefit],
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async updateBenefit(
        id: string,
        benefitId: string,
        data: { status: RAndRBenefitStatus; deliveredValue?: number; deliveryDate?: string; verificationDate?: string; remarks?: string },
    ): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const updatedBenefits = current.benefits.map((b) => {
            if (b.id !== benefitId) return b
            return {
                ...b,
                status: data.status,
                deliveredValue: data.deliveredValue !== undefined ? data.deliveredValue : b.deliveredValue,
                deliveryDate: data.deliveryDate ?? b.deliveryDate,
                verificationDate: data.verificationDate ?? b.verificationDate,
                remarks: data.remarks ?? b.remarks,
            }
        })

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: `BENEFIT_${data.status}`,
            remarks: `Benefit status updated to ${data.status}. ${data.remarks ?? ''}`,
        }

        const updated: RAndRCase = {
            ...current,
            benefits: updatedBenefits,
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async scheduleRelocation(
        id: string,
        data: { relocationDate: string; siteReference?: string; location?: string; remarks?: string },
    ): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: 'RELOCATION_SCHEDULED',
            remarks: `Relocation scheduled for ${data.relocationDate}. ${data.remarks ?? ''}`,
        }

        const updated: RAndRCase = {
            ...current,
            relocationStatus: 'PLANNED',
            relocationDate: data.relocationDate,
            resettlementSite: data.siteReference
                ? {
                      id: `site-${Date.now().toString().slice(-4)}`,
                      siteReference: data.siteReference,
                      location: data.location ?? 'Designated Model R&R Township',
                      allocatedStatus: 'ALLOCATED',
                      allocationDate: now.split('T')[0],
                      infrastructureReadiness: 'READY',
                      handoverStatus: 'PENDING',
                  }
                : current.resettlementSite,
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async recordRelocation(
        id: string,
        data: { completionDate: string; remarks?: string },
    ): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: 'RELOCATION_COMPLETED',
            remarks: `Household physical shifting completed on ${data.completionDate}. ${data.remarks ?? ''}`,
        }

        const updated: RAndRCase = {
            ...current,
            rAndRStatus: 'POST_RELOCATION_VERIFICATION',
            relocationStatus: 'COMPLETED',
            relocationDate: data.completionDate,
            resettlementSite: current.resettlementSite
                ? { ...current.resettlementSite, handoverStatus: 'HANDED_OVER' }
                : undefined,
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async recordPostRelocationVerification(
        id: string,
        data: { result: PostRelocationVerificationResult; officer: string; date: string; observations: string; remarks?: string },
    ): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: data.officer,
            role: current.assignedRole,
            organization: current.organization,
            action: `POST_RELOCATION_${data.result}`,
            remarks: `Post-relocation inspection result: ${data.result}. ${data.observations}`,
        }

        const updated: RAndRCase = {
            ...current,
            postRelocationVerificationStatus: data.result,
            postRelocationVerificationDate: data.date,
            postRelocationVerificationOfficer: data.officer,
            postRelocationObservations: data.observations,
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async completeCase(
        id: string,
        data: { remarks?: string },
    ): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        // Validate completion preconditions
        if (current.eligibilityStatus !== 'ELIGIBLE') {
            throw new Error('Case cannot be completed: Eligibility assessment is not marked ELIGIBLE.')
        }
        if (current.rAndRStatus === 'ON_HOLD' || current.rAndRStatus === 'DISPUTED') {
            throw new Error('Case cannot be completed: Active hold or dispute pending on file.')
        }
        if (current.relocationRequired && current.relocationStatus !== 'COMPLETED') {
            throw new Error('Case cannot be completed: Relocation is required but has not been recorded as completed.')
        }
        if (current.relocationRequired && current.postRelocationVerificationStatus !== 'VERIFIED') {
            throw new Error('Case cannot be completed: Post-relocation verification is not VERIFIED.')
        }

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: 'R_AND_R_COMPLETED',
            remarks: `Case officially closed and R&R completion recorded. ${data.remarks ?? ''}`,
        }

        const updated: RAndRCase = {
            ...current,
            rAndRStatus: 'COMPLETED',
            completionDate: now.split('T')[0],
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async addRemark(id: string, remark: string): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 100))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const newRemark: RAndRRemark = {
            id: `rem-rnr-${Date.now()}`,
            author: current.assignedOfficer,
            role: current.assignedRole,
            timestamp: now,
            remark,
        }

        const updated: RAndRCase = {
            ...current,
            remarksList: [newRemark, ...current.remarksList],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async placeOnHold(id: string, reason: string): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: 'CASE_ON_HOLD',
            remarks: `Case placed on statutory hold: ${reason}`,
        }

        const updated: RAndRCase = {
            ...current,
            rAndRStatus: 'ON_HOLD',
            holdReason: reason,
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },

    async resumeReview(id: string, remarks?: string): Promise<RAndRCase> {
        await new Promise((r) => setTimeout(r, 150))
        const idx = casesState.findIndex((c) => c.id === id)
        if (idx === -1) throw new Error('R&R case not found')

        const current = casesState[idx]
        const now = new Date().toISOString()

        const newTimelineEvent: RAndRTimelineEvent = {
            id: `tl-rnr-${Date.now()}`,
            timestamp: now,
            actor: current.assignedOfficer,
            role: current.assignedRole,
            organization: current.organization,
            action: 'REVIEW_RESUMED',
            remarks: `Stay / Hold resolved. Review resumed. ${remarks ?? ''}`,
        }

        const updated: RAndRCase = {
            ...current,
            rAndRStatus: current.benefits.length > 0 ? 'BENEFIT_IN_PROGRESS' : 'ELIGIBILITY_REVIEW',
            holdReason: undefined,
            disputeReason: undefined,
            timeline: [newTimelineEvent, ...current.timeline],
            updatedAt: now,
        }

        casesState[idx] = updated
        return updated
    },
}
