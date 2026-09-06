import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RehabilitationService } from '@/services/rehabilitation.service'
import type {
    RAndREligibilityStatus,
    RAndRBenefitType,
    RAndRBenefitStatus,
    PostRelocationVerificationResult,
} from '@/types'

export const RANDR_QUERY_KEYS = {
    all: ['randr'] as const,
    list: (projectId?: string, parcelId?: string) => ['randr', 'list', { projectId, parcelId }] as const,
    detail: (id: string | undefined) => ['randr', 'detail', id] as const,
    byProject: (projectId: string | undefined) => ['randr', 'byProject', projectId] as const,
    byParcel: (parcelId: string | undefined) => ['randr', 'byParcel', parcelId] as const,
}

export function useRAndRCases(projectId?: string, parcelId?: string) {
    return useQuery({
        queryKey: RANDR_QUERY_KEYS.list(projectId, parcelId),
        queryFn: () => RehabilitationService.list(projectId, parcelId),
    })
}

export function useRAndRCase(id: string | undefined) {
    return useQuery({
        queryKey: RANDR_QUERY_KEYS.detail(id),
        queryFn: () => {
            if (!id) return null
            return RehabilitationService.getById(id)
        },
        enabled: Boolean(id),
    })
}

export function useRAndRByProject(projectId: string | undefined) {
    return useQuery({
        queryKey: RANDR_QUERY_KEYS.byProject(projectId),
        queryFn: () => {
            if (!projectId) return []
            return RehabilitationService.getByProjectId(projectId)
        },
        enabled: Boolean(projectId),
    })
}

export function useRAndRByParcel(parcelId: string | undefined) {
    return useQuery({
        queryKey: RANDR_QUERY_KEYS.byParcel(parcelId),
        queryFn: async () => {
            if (!parcelId) return null
            const list = await RehabilitationService.getByParcelId(parcelId)
            return list[0] ?? null
        },
        enabled: Boolean(parcelId),
    })
}

export function useStartEligibilityReview() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id }: { id: string }) => RehabilitationService.startEligibilityReview(id),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useRecordEligibilityAssessment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status, remarks }: { id: string; status: RAndREligibilityStatus; remarks: string }) =>
            RehabilitationService.recordEligibilityAssessment(id, { status, remarks }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useDefineEntitlement() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            entitlementType,
            description,
            quantityValue,
            remarks,
        }: {
            id: string
            entitlementType: RAndRBenefitType
            description: string
            quantityValue?: string
            remarks?: string
        }) =>
            RehabilitationService.defineEntitlement(id, { entitlementType, description, quantityValue, remarks }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useAddRAndRBenefit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            benefitType,
            plannedValue,
            approvedValue,
            responsibleOfficer,
            remarks,
        }: {
            id: string
            benefitType: RAndRBenefitType
            plannedValue: number
            approvedValue: number
            responsibleOfficer: string
            remarks?: string
        }) =>
            RehabilitationService.addBenefit(id, {
                benefitType,
                plannedValue,
                approvedValue,
                responsibleOfficer,
                remarks,
            }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useUpdateRAndRBenefit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            benefitId,
            status,
            deliveredValue,
            deliveryDate,
            verificationDate,
            remarks,
        }: {
            id: string
            benefitId: string
            status: RAndRBenefitStatus
            deliveredValue?: number
            deliveryDate?: string
            verificationDate?: string
            remarks?: string
        }) =>
            RehabilitationService.updateBenefit(id, benefitId, {
                status,
                deliveredValue,
                deliveryDate,
                verificationDate,
                remarks,
            }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useScheduleRelocation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            relocationDate,
            siteReference,
            location,
            remarks,
        }: {
            id: string
            relocationDate: string
            siteReference?: string
            location?: string
            remarks?: string
        }) =>
            RehabilitationService.scheduleRelocation(id, {
                relocationDate,
                siteReference,
                location,
                remarks,
            }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useRecordRelocation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, completionDate, remarks }: { id: string; completionDate: string; remarks?: string }) =>
            RehabilitationService.recordRelocation(id, { completionDate, remarks }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useRecordPostRelocationVerification() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            result,
            officer,
            date,
            observations,
            remarks,
        }: {
            id: string
            result: PostRelocationVerificationResult
            officer: string
            date: string
            observations: string
            remarks?: string
        }) =>
            RehabilitationService.recordPostRelocationVerification(id, {
                result,
                officer,
                date,
                observations,
                remarks,
            }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useCompleteRAndR() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
            RehabilitationService.completeCase(id, { remarks }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function usePlaceRAndROnHold() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            RehabilitationService.placeOnHold(id, reason),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useResumeRAndRReview() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
            RehabilitationService.resumeReview(id, remarks),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}

export function useAddRAndRRemark() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remark }: { id: string; remark: string }) =>
            RehabilitationService.addRemark(id, remark),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RANDR_QUERY_KEYS.detail(variables.id) })
        },
    })
}
