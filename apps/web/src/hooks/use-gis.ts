import { useQuery } from '@tanstack/react-query'
import { gisService } from '@/services/gis.service'
import type { GisFilterState } from '@/types/gis'

export const GIS_QUERY_KEYS = {
    all: ['gis'] as const,
    layers: () => [...GIS_QUERY_KEYS.all, 'layers'] as const,
    projects: () => [...GIS_QUERY_KEYS.all, 'projects'] as const,
    parcels: (filters?: Partial<GisFilterState>) => [...GIS_QUERY_KEYS.all, 'parcels', filters] as const,
    administrative: () => [...GIS_QUERY_KEYS.all, 'administrative'] as const,
    corridors: () => [...GIS_QUERY_KEYS.all, 'corridors'] as const,
    summary: (filters?: Partial<GisFilterState>) => [...GIS_QUERY_KEYS.all, 'summary', filters] as const,
    attention: () => [...GIS_QUERY_KEYS.all, 'attention'] as const,
    districts: () => [...GIS_QUERY_KEYS.all, 'districts'] as const,
    search: (query: string) => [...GIS_QUERY_KEYS.all, 'search', query] as const,
    parcelDetail: (id: string) => [...GIS_QUERY_KEYS.all, 'parcel', id] as const,
    projectDetail: (id: string) => [...GIS_QUERY_KEYS.all, 'project', id] as const,
}

export function useGisLayers() {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.layers(),
        queryFn: () => gisService.getLayers(),
        staleTime: 1000 * 60 * 5,
    })
}

export function useGisProjects() {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.projects(),
        queryFn: () => gisService.getProjectsGeoJson(),
        staleTime: 1000 * 60 * 5,
    })
}

export function useGisParcels(filters?: Partial<GisFilterState>) {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.parcels(filters),
        queryFn: () => gisService.getParcelsGeoJson(filters),
        staleTime: 1000 * 60 * 2,
    })
}

export function useGisAdministrativeBoundaries() {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.administrative(),
        queryFn: () => gisService.getAdministrativeBoundaries(),
        staleTime: 1000 * 60 * 10,
    })
}

export function useGisCorridors() {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.corridors(),
        queryFn: () => gisService.getCorridors(),
        staleTime: 1000 * 60 * 10,
    })
}

export function useGisSpatialSummary(filters?: Partial<GisFilterState>) {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.summary(filters),
        queryFn: () => gisService.getSpatialSummary(filters),
        staleTime: 1000 * 60 * 2,
    })
}

export function useGisSpatialAttention() {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.attention(),
        queryFn: () => gisService.getSpatialAttention(),
        staleTime: 1000 * 60 * 5,
    })
}

export function useGisDistrictSummaries() {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.districts(),
        queryFn: () => gisService.getDistrictSummaries(),
        staleTime: 1000 * 60 * 10,
    })
}

export function useGisSearch(query: string) {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.search(query),
        queryFn: () => gisService.searchFeatures(query),
        enabled: Boolean(query && query.trim().length >= 2),
        staleTime: 1000 * 30,
    })
}

export function useGisParcel(id?: string | null) {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.parcelDetail(id || ''),
        queryFn: () => (id ? gisService.getParcelById(id) : Promise.resolve(null)),
        enabled: Boolean(id),
        staleTime: 1000 * 60 * 5,
    })
}

export function useGisProject(id?: string | null) {
    return useQuery({
        queryKey: GIS_QUERY_KEYS.projectDetail(id || ''),
        queryFn: () => (id ? gisService.getProjectById(id) : Promise.resolve(null)),
        enabled: Boolean(id),
        staleTime: 1000 * 60 * 5,
    })
}
