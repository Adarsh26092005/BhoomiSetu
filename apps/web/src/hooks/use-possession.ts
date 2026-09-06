import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { possessionService } from '@/services/possession.service'
import type { SiteVerificationResult } from '@/types'

export const possessionKeys = {
    all: ['possession'] as const,
    list: (projectId?: string, parcelId?: string) =>
        ['possession', 'list', projectId ?? 'all', parcelId ?? 'all'] as const,
    detail: (id: string) => ['possession', id] as const,
    byProject: (projectId: string) => ['possession', 'project', projectId] as const,
    byParcel: (parcelId: string) => ['possession', 'parcel', parcelId] as const,
}

export function usePossessionRecords(projectId?: string, parcelId?: string) {
    return useQuery({
        queryKey: possessionKeys.list(projectId, parcelId),
        queryFn: () => possessionService.list(projectId, parcelId),
    })
}

export function usePossessionRecord(id: string | undefined) {
    return useQuery({
        queryKey: possessionKeys.detail(id ?? ''),
        queryFn: () => possessionService.getById(id as string),
        enabled: Boolean(id),
    })
}

export function usePossessionByProject(projectId: string | undefined) {
    return useQuery({
        queryKey: possessionKeys.byProject(projectId ?? ''),
        queryFn: () => possessionService.getByProjectId(projectId as string),
        enabled: Boolean(projectId),
    })
}

export function usePossessionByParcel(parcelId: string | undefined) {
    return useQuery({
        queryKey: possessionKeys.byParcel(parcelId ?? ''),
        queryFn: () => possessionService.getByParcelId(parcelId as string),
        enabled: Boolean(parcelId),
    })
}

export function usePreparePossessionNotice() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, noticeReference, remarks }: { id: string; noticeReference: string; remarks?: string }) =>
            possessionService.prepareNotice(id, { noticeReference, remarks }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: possessionKeys.all })
            queryClient.setQueryData(possessionKeys.detail(updated.id), updated)
        },
    })
}

export function useIssuePossessionNotice() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
            possessionService.issueNotice(id, { remarks }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: possessionKeys.all })
            queryClient.setQueryData(possessionKeys.detail(updated.id), updated)
        },
    })
}

export function useSchedulePossession() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            scheduledDate,
            officer,
            remarks,
        }: {
            id: string
            scheduledDate: string
            officer: string
            remarks?: string
        }) =>
            possessionService.schedulePossession(id, { scheduledDate, officer, remarks }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: possessionKeys.all })
            queryClient.setQueryData(possessionKeys.detail(updated.id), updated)
        },
    })
}

export function useRecordSiteVerification() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            visitDate,
            officer,
            result,
            observations,
            remarks,
        }: {
            id: string
            visitDate: string
            officer: string
            result: SiteVerificationResult
            observations: string
            remarks?: string
        }) =>
            possessionService.recordSiteVerification(id, {
                visitDate,
                officer,
                result,
                observations,
                remarks,
            }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: possessionKeys.all })
            queryClient.setQueryData(possessionKeys.detail(updated.id), updated)
        },
    })
}

export function useRecordPossession() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            possessionDate,
            officer,
            remarks,
        }: {
            id: string
            possessionDate: string
            officer: string
            remarks?: string
        }) =>
            possessionService.recordPossession(id, {
                possessionDate,
                officer,
                remarks,
            }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: possessionKeys.all })
            queryClient.setQueryData(possessionKeys.detail(updated.id), updated)
        },
    })
}

export function useGenerateMockPossessionCertificate() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            certificateRef,
            remarks,
        }: {
            id: string
            certificateRef: string
            remarks?: string
        }) =>
            possessionService.generateMockCertificate(id, {
                certificateRef,
                remarks,
            }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: possessionKeys.all })
            queryClient.setQueryData(possessionKeys.detail(updated.id), updated)
        },
    })
}

export function useAddPossessionRemark() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remark }: { id: string; remark: string }) =>
            possessionService.addRemark(id, remark),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: possessionKeys.all })
            queryClient.setQueryData(possessionKeys.detail(updated.id), updated)
        },
    })
}

export function usePlacePossessionOnHold() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            possessionService.placeOnHold(id, reason),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: possessionKeys.all })
            queryClient.setQueryData(possessionKeys.detail(updated.id), updated)
        },
    })
}

export function useResumePossessionReview() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
            possessionService.resumeReview(id, remarks),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: possessionKeys.all })
            queryClient.setQueryData(possessionKeys.detail(updated.id), updated)
        },
    })
}
