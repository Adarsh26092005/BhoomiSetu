import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsService } from '@/services/documents.service'
import type { VerificationStatus, ProjectDocument } from '@/types'

export const documentKeys = {
    all: ['documents'] as const,
    list: (projectId?: string, parcelId?: string) =>
        ['documents', 'list', projectId ?? 'all', parcelId ?? 'all'] as const,
    detail: (id: string) => ['documents', id] as const,
}

export function useDocuments(projectId?: string, parcelId?: string) {
    return useQuery({
        queryKey: documentKeys.list(projectId, parcelId),
        queryFn: () => documentsService.list(projectId, parcelId),
    })
}

export function useDocument(id: string | undefined) {
    return useQuery({
        queryKey: documentKeys.detail(id ?? ''),
        queryFn: () => documentsService.getById(id as string),
        enabled: Boolean(id),
    })
}

export function useVerifyDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            newStatus,
            remarks,
        }: {
            id: string
            newStatus: VerificationStatus
            remarks?: string
        }) => documentsService.verify(id, newStatus, remarks),
        onSuccess: (updatedDoc) => {
            queryClient.invalidateQueries({ queryKey: documentKeys.all })
            queryClient.setQueryData(documentKeys.detail(updatedDoc.id), updatedDoc)
        },
    })
}

export function useUploadDocumentMock() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Partial<ProjectDocument>) => documentsService.createMock(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: documentKeys.all })
        },
    })
}
