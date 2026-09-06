import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    useGisLayers,
    useGisProjects,
    useGisParcels,
    useGisAdministrativeBoundaries,
    useGisCorridors,
    useGisSpatialSummary,
    useGisSpatialAttention,
    useGisDistrictSummaries,
} from '@/hooks/use-gis'
import { useProjects } from '@/hooks/use-projects'
import { MOCK_PARCELS_GEOJSON, MOCK_PROJECTS_GEOJSON } from '@/mock/gis'
import type {
    GisMapBaseStyle,
    GisMapViewport,
    GisFilterState,
    GisLayerId,
    MapSelection,
} from '@/types/gis'

// GIS Components
import { GisToolbar } from '@/components/gis/GisToolbar'
import { GisSearch } from '@/components/gis/GisSearch'
import { GisFilters } from '@/components/gis/GisFilters'
import { GisLayerControl } from '@/components/gis/GisLayerControl'
import { GisLegend } from '@/components/gis/GisLegend'
import { GisKpiSummary } from '@/components/gis/GisKpiSummary'
import { GisDetailsPanel } from '@/components/gis/GisDetailsPanel'
import { SpatialAnalyticsPanel } from '@/components/gis/SpatialAnalyticsPanel'
import { SpatialAttentionPanel } from '@/components/gis/SpatialAttentionPanel'
import { GisMap } from '@/components/gis/GisMap'

export function GisPage() {
    const [searchParams] = useSearchParams()
    const queryProjectId = searchParams.get('projectId') ?? 'ALL'
    const queryParcelId = searchParams.get('parcelId') ?? ''
    const queryDistrict = searchParams.get('district') ?? 'ALL'

    // Compute initial viewport and selection directly from query parameters and static mock data
    const initialSetup = React.useMemo(() => {
        if (queryParcelId) {
            const found = MOCK_PARCELS_GEOJSON.features.find((f) => f.properties.parcelId === queryParcelId)
            if (found) {
                const coords = found.geometry.coordinates[0]
                const lng = (coords[0][0] + coords[2][0]) / 2
                const lat = (coords[0][1] + coords[2][1]) / 2
                return {
                    viewport: { lat, lng, zoom: 14 },
                    selection: {
                        type: 'parcel' as const,
                        id: found.properties.parcelId,
                        properties: found.properties,
                        coordinates: [lng, lat] as [number, number],
                    },
                }
            }
        } else if (queryProjectId !== 'ALL') {
            const found = MOCK_PROJECTS_GEOJSON.features.find((f) => f.properties.projectId === queryProjectId)
            if (found) {
                const [lng, lat] = found.geometry.coordinates
                return {
                    viewport: { lat, lng, zoom: 10 },
                    selection: {
                        type: 'project' as const,
                        id: found.properties.projectId,
                        properties: found.properties,
                        coordinates: [lng, lat] as [number, number],
                    },
                }
            }
        }

        return {
            viewport: { lat: 21.7679, lng: 78.8718, zoom: 5.2 },
            selection: { type: null, id: '' },
        }
    }, [queryParcelId, queryProjectId])

    // 1. Basemap and Viewport State
    const [baseStyle, setBaseStyle] = React.useState<GisMapBaseStyle>('light')
    const [viewport, setViewport] = React.useState<GisMapViewport>(initialSetup.viewport)

    // 2. Spatial Query Filters State
    const [filters, setFilters] = React.useState<GisFilterState>({
        search: queryParcelId || '',
        projectId: queryProjectId,
        state: 'ALL',
        district: queryDistrict,
        village: 'ALL',
        parcelStatus: 'ALL',
        projectStatus: 'ALL',
        landType: 'ALL',
        compensationStatus: 'ALL',
        possessionStatus: 'ALL',
        randrStatus: 'ALL',
        disputedOnly: false,
    })

    // 3. Modals & Panels UI State
    const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)
    const [isLayerControlOpen, setIsLayerControlOpen] = React.useState(false)
    const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(false)
    const [isAttentionOpen, setIsAttentionOpen] = React.useState(false)

    // 4. Feature Selection State
    const [selection, setSelection] = React.useState<MapSelection>(initialSetup.selection)

    // 5. Data Queries
    const { data: initialLayers = [] } = useGisLayers()
    const [layersState, setLayersState] = React.useState(initialLayers)

    const activeLayers = layersState.length > 0 ? layersState : initialLayers

    const { data: projectsData } = useGisProjects()
    const { data: parcelsData } = useGisParcels(filters)
    const { data: administrativeData } = useGisAdministrativeBoundaries()
    const { data: corridorsData } = useGisCorridors()
    const { data: summaryMetrics } = useGisSpatialSummary(filters)
    const { data: attentionItems = [] } = useGisSpatialAttention()
    const { data: districtSummaries = [] } = useGisDistrictSummaries()
    const { data: projects = [] } = useProjects()

    // Layer Toggle Handlers
    const handleToggleLayer = (layerId: GisLayerId) => {
        setLayersState((prev) => {
            const current = prev.length > 0 ? prev : initialLayers
            return current.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
        })
    }

    const handleToggleAllLayers = (visible: boolean) => {
        setLayersState((prev) => {
            const current = prev.length > 0 ? prev : initialLayers
            return current.map((l) => ({ ...l, visible }))
        })
    }

    // Filter Options
    const availableProjects = React.useMemo(() => {
        return projects.map((p) => ({ id: p.id, code: p.code, title: p.title }))
    }, [projects])

    const availableStates = React.useMemo(() => {
        const set = new Set<string>()
        projects.forEach((p) => set.add(p.state))
        return Array.from(set).sort()
    }, [projects])

    const availableDistricts = React.useMemo(() => {
        const set = new Set<string>()
        projects.forEach((p) => p.districts.forEach((d) => set.add(d)))
        return Array.from(set).sort()
    }, [projects])

    const availableVillages = React.useMemo(() => {
        const set = new Set<string>()
        parcelsData?.features.forEach((f) => set.add(f.properties.village))
        return Array.from(set).sort()
    }, [parcelsData])

    const activeFiltersCount = React.useMemo(() => {
        let count = 0
        if (filters.search) count++
        if (filters.projectId !== 'ALL') count++
        if (filters.state !== 'ALL') count++
        if (filters.district !== 'ALL') count++
        if (filters.village !== 'ALL') count++
        if (filters.parcelStatus !== 'ALL') count++
        if (filters.landType !== 'ALL') count++
        if (filters.compensationStatus !== 'ALL') count++
        if (filters.possessionStatus !== 'ALL') count++
        if (filters.randrStatus !== 'ALL') count++
        if (filters.disputedOnly) count++
        return count
    }, [filters])

    const handleResetFilters = () => {
        setFilters({
            search: '',
            projectId: 'ALL',
            state: 'ALL',
            district: 'ALL',
            village: 'ALL',
            parcelStatus: 'ALL',
            projectStatus: 'ALL',
            landType: 'ALL',
            compensationStatus: 'ALL',
            possessionStatus: 'ALL',
            randrStatus: 'ALL',
            disputedOnly: false,
        })
    }

    // Reset View / Fit All
    const handleResetView = () => {
        setViewport({ lat: 21.7679, lng: 78.8718, zoom: 5.2 })
    }

    const handleFitAll = () => {
        setViewport({ lat: 21.7679, lng: 78.8718, zoom: 5.8 })
    }

    const handleLocateCoordinates = (coordinates?: [number, number], parcelIds?: string[]) => {
        if (coordinates) {
            setViewport({ lat: coordinates[1], lng: coordinates[0], zoom: 12 })
        }
        if (parcelIds && parcelIds.length > 0 && parcelsData) {
            const found = parcelsData.features.find((f) => f.properties.parcelId === parcelIds[0])
            if (found) {
                setSelection({
                    type: 'parcel',
                    id: found.properties.parcelId,
                    properties: found.properties,
                })
            }
        }
    }

    return (
        <div className="space-y-4">
            {/* 1. GIS Top Command Toolbar */}
            <GisToolbar
                baseStyle={baseStyle}
                onBaseStyleChange={setBaseStyle}
                viewport={viewport}
                onResetView={handleResetView}
                onFitAll={handleFitAll}
                isLayerControlOpen={isLayerControlOpen}
                onToggleLayerControl={() => setIsLayerControlOpen(!isLayerControlOpen)}
                isFiltersOpen={isFiltersOpen}
                onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
                isAnalyticsOpen={isAnalyticsOpen}
                onToggleAnalytics={() => setIsAnalyticsOpen(true)}
                isAttentionOpen={isAttentionOpen}
                onToggleAttention={() => setIsAttentionOpen(true)}
                activeFiltersCount={activeFiltersCount}
                attentionItemsCount={attentionItems.length}
                totalParcelsCount={parcelsData?.features.length ?? 16}
            />

            {/* 2. Collapsible Spatial Filters */}
            {isFiltersOpen && (
                <GisFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    onResetFilters={handleResetFilters}
                    availableProjects={availableProjects}
                    availableStates={availableStates}
                    availableDistricts={availableDistricts}
                    availableVillages={availableVillages}
                    activeCount={activeFiltersCount}
                />
            )}

            {/* 3. Spatial KPI Metrics Strip */}
            {summaryMetrics && <GisKpiSummary metrics={summaryMetrics} />}

            {/* 4. Main Spatial Canvas Workspace */}
            <div className="relative h-[650px] w-full">
                {/* Floating Search Bar (Top Left) */}
                <div className="absolute top-4 left-4 z-20 w-80 sm:w-96">
                    <GisSearch
                        onSelectFeature={(res) => {
                            setViewport({ lat: res.coordinates[1], lng: res.coordinates[0], zoom: 13 })
                            setSelection({
                                type: res.type,
                                id: res.id,
                                properties: res.properties,
                                coordinates: res.coordinates,
                            })
                        }}
                    />
                </div>

                {/* Floating Layer Control (Top Right) */}
                {isLayerControlOpen && (
                    <div className="absolute top-4 right-4 z-30">
                        <GisLayerControl
                            layers={activeLayers}
                            onToggleLayer={handleToggleLayer}
                            onToggleAll={handleToggleAllLayers}
                        />
                    </div>
                )}

                {/* Floating Legend (Bottom Left) */}
                <div className="absolute bottom-4 left-4 z-20 hidden md:block">
                    <GisLegend layers={activeLayers} />
                </div>

                {/* Floating Details Dossier (Right Side) */}
                {selection.type && (
                    <div className="absolute top-4 right-4 z-20">
                        <GisDetailsPanel
                            selection={selection}
                            onClose={() => setSelection({ type: null, id: '' })}
                            onFilterByProject={(projectId) => setFilters({ ...filters, projectId })}
                        />
                    </div>
                )}

                {/* Map Component */}
                <GisMap
                    baseStyle={baseStyle}
                    viewport={viewport}
                    onViewportChange={setViewport}
                    layers={activeLayers}
                    projectsData={projectsData}
                    parcelsData={parcelsData}
                    administrativeData={administrativeData}
                    corridorsData={corridorsData}
                    selection={selection}
                    onSelectFeature={setSelection}
                />
            </div>

            {/* 5. Spatial Analytics Modal */}
            {isAnalyticsOpen && (
                <SpatialAnalyticsPanel
                    parcels={parcelsData?.features.map((f) => f.properties) ?? []}
                    districts={districtSummaries}
                    onClose={() => setIsAnalyticsOpen(false)}
                />
            )}

            {/* 6. Spatial Risk & Attention Modal */}
            {isAttentionOpen && (
                <SpatialAttentionPanel
                    items={attentionItems}
                    onLocate={handleLocateCoordinates}
                    onClose={() => setIsAttentionOpen(false)}
                />
            )}
        </div>
    )
}
