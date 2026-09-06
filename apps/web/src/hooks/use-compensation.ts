import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { compensationService } from '@/services/compensation.service'

export const compensationKeys = {
    all: ['compensation'] as const,
    list: (projectId?: string, parcelId?: string) =>
        ['compensation', 'list', projectId ?? 'all', parcelId ?? 'all'] as const,
    detail: (id: string) => ['compensation', id] as const,
    byProject: (projectId: string) => ['compensation', 'project', projectId] as const,
    byParcel: (parcelId: string) => ['compensation', 'parcel', parcelId] as const,
}

export function useCompensationRecords(projectId?: string, parcelId?: string) {
    return useQuery({
        queryKey: compensationKeys.list(projectId, parcelId),
        queryFn: () => compensationService.list(projectId, parcelId),
    })
}

export function useCompensationRecord(id: string | undefined) {
    return useQuery({
        queryKey: compensationKeys.detail(id ?? ''),
        queryFn: () => compensationService.getById(id as string),
        enabled: Boolean(id),
    })
}

export function useCompensationByProject(projectId: string | undefined) {
    return useQuery({
        queryKey: compensationKeys.byProject(projectId ?? ''),
        queryFn: () => compensationService.getByProjectId(projectId as string),
        enabled: Boolean(projectId),
    })
}

export function useCompensationByParcel(parcelId: string | undefined) {
    return useQuery({
        queryKey: compensationKeys.byParcel(parcelId ?? ''),
        queryFn: () => compensationService.getByParcelId(parcelId as string),
        enabled: Boolean(parcelId),
    })
}

export function useApproveAssessment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
            compensationService.approveAssessment(id, remarks),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: compensationKeys.all })
            queryClient.setQueryData(compensationKeys.detail(updated.id), updated)
        },
    })
}

export function useReturnAssessment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
            compensationService.returnAssessment(id, remarks),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: compensationKeys.all })
            queryClient.setQueryData(compensationKeys.detail(updated.id), updated)
        },
    })
}

export function usePlaceCompensationOnHold() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
            compensationService.placeOnHold(id, remarks),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: compensationKeys.all })
            queryClient.setQueryData(compensationKeys.detail(updated.id), updated)
        },
    })
}

export function useResumeCompensationReview() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
            compensationService.resumeReview(id, remarks),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: compensationKeys.all })
            queryClient.setQueryData(compensationKeys.detail(updated.id), updated)
        },
    })
}

export function useRecordDisbursement() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            amountInr,
            transactionReference,
            remarks,
        }: {
            id: string
            amountInr: number
            transactionReference: string
            remarks?: string
        }) =>
            compensationService.recordDisbursement(
                id,
                amountInr,
                transactionReference,
                remarks,
            ),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: compensationKeys.all })
            queryClient.setQueryData(compensationKeys.detail(updated.id), updated)
        },
    })
}
