import { useQuery } from '@tanstack/react-query'
import { parcelsService } from '@/services/parcels.service'

export const parcelKeys = {
    all: ['parcels'] as const,
    list: (projectId?: string) => ['parcels', 'list', projectId ?? 'all'] as const,
    detail: (id: string) => ['parcels', id] as const,
}

export function useParcels(projectId?: string) {
    return useQuery({
        queryKey: parcelKeys.list(projectId),
        queryFn: () => parcelsService.list(projectId),
    })
}

export function useParcel(id: string | undefined) {
    return useQuery({
        queryKey: parcelKeys.detail(id ?? ''),
        queryFn: () => parcelsService.getById(id as string),
        enabled: Boolean(id),
    })
}
