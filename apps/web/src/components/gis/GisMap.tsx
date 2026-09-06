import * as React from 'react'
import {
    Plus,
    Minus,
    Compass,
} from 'lucide-react'
import type {
    GisMapBaseStyle,
    GisMapViewport,
    GisLayer,
    GeoJsonFeatureCollection,
    GisParcelProperties,
    GisProjectProperties,
    GisAdministrativeProperties,
    GisCorridorProperties,
    MapSelection,
} from '@/types/gis'

interface GisMapProps {
    baseStyle: GisMapBaseStyle
    viewport: GisMapViewport
    onViewportChange: (viewport: GisMapViewport) => void
    layers: GisLayer[]
    projectsData?: GeoJsonFeatureCollection<GisProjectProperties>
    parcelsData?: GeoJsonFeatureCollection<GisParcelProperties>
    administrativeData?: GeoJsonFeatureCollection<GisAdministrativeProperties>
    corridorsData?: GeoJsonFeatureCollection<GisCorridorProperties>
    selection: MapSelection
    onSelectFeature: (selection: MapSelection) => void
    compact?: boolean
}

export function GisMap({
    baseStyle,
    viewport,
    onViewportChange,
    layers,
    projectsData,
    parcelsData,
    administrativeData,
    corridorsData,
    selection,
    onSelectFeature,
    compact = false,
}: GisMapProps) {
    const mapContainerRef = React.useRef<HTMLDivElement>(null)
    const [hoveredFeature, setHoveredFeature] = React.useState<{
        type: 'parcel' | 'project'
        title: string
        subtitle: string
        x: number
        y: number
    } | null>(null)

    // Check layer visibility
    const isProjectsVisible = layers.find((l) => l.id === 'project-locations')?.visible ?? true
    const isParcelsVisible = layers.find((l) => l.id === 'cadastral-parcels')?.visible ?? true
    const isCorridorsVisible = layers.find((l) => l.id === 'project-corridors')?.visible ?? true
    const isAdministrativeVisible = layers.find((l) => l.id === 'administrative-boundaries')?.visible ?? true

    // Zoom controls
    const handleZoomIn = () => {
        onViewportChange({ ...viewport, zoom: Math.min(viewport.zoom + 1, 18) })
    }

    const handleZoomOut = () => {
        onViewportChange({ ...viewport, zoom: Math.max(viewport.zoom - 1, 4) })
    }

    const handleResetNorth = () => {
        onViewportChange({ ...viewport, bearing: 0, pitch: 0 })
    }

    // Geometry projection helper for SVG / canvas representation
    const projectToSvg = React.useCallback(
        (lng: number, lat: number, width: number, height: number) => {
            const scale = Math.pow(2, viewport.zoom) * 20
            const x = width / 2 + (lng - viewport.lng) * scale
            const y = height / 2 - (lat - viewport.lat) * scale
            return [x, y] as [number, number]
        },
        [viewport],
    )

    const [containerDimensions, setContainerDimensions] = React.useState({ width: 800, height: 600 })

    React.useEffect(() => {
        const updateSize = () => {
            if (mapContainerRef.current) {
                setContainerDimensions({
                    width: mapContainerRef.current.clientWidth || 800,
                    height: mapContainerRef.current.clientHeight || 600,
                })
            }
        }
        updateSize()
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    const getParcelColor = (status: string, isDisputed: boolean) => {
        if (isDisputed) return '#dc2626'
        switch (status) {
            case 'COMPENSATION_PAID':
            case 'POSSESSION_TAKEN':
                return '#16a34a'
            case 'AWARD_DECLARED':
                return '#0284c7'
            case 'UNDER_ACQUISITION':
            case 'COMPENSATION_PENDING':
            case 'POSSESSION_PENDING':
                return '#eab308'
            default:
                return '#64748b'
        }
    }

    return (
        <div
            ref={mapContainerRef}
            className={`relative h-full w-full overflow-hidden rounded-xl border border-ink-200 shadow-inner select-none ${
                compact ? 'min-h-[240px]' : 'min-h-[520px]'
            } ${
                baseStyle === 'dark'
                    ? 'bg-[#0f172a]'
                    : baseStyle === 'satellite'
                    ? 'bg-[#0b192c]'
                    : 'bg-[#f8fafc]'
            }`}
        >
            {/* Background Map Grid Pattern */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-20">
                <defs>
                    <pattern id="gis-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke={baseStyle === 'dark' || baseStyle === 'satellite' ? '#94a3b8' : '#64748b'}
                            strokeWidth="0.5"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gis-grid-pattern)" />
            </svg>

            {/* Interactive Vector GIS SVG Canvas */}
            <svg className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing">
                {/* 1. Administrative Boundaries */}
                {isAdministrativeVisible &&
                    administrativeData?.features.map((feat) => {
                        const coords = feat.geometry.coordinates[0]
                        const pathData = coords
                            .map((c: [number, number], i: number) => {
                                const [px, py] = projectToSvg(c[0], c[1], containerDimensions.width, containerDimensions.height)
                                return `${i === 0 ? 'M' : 'L'} ${px} ${py}`
                            })
                            .join(' ') + ' Z'

                        return (
                            <path
                                key={feat.id}
                                d={pathData}
                                fill={baseStyle === 'dark' ? 'rgba(51, 65, 85, 0.15)' : 'rgba(226, 232, 240, 0.3)'}
                                stroke="#64748b"
                                strokeWidth="1.2"
                                strokeDasharray="4 4"
                                className="transition-colors hover:fill-slate-500/20 cursor-pointer"
                                onClick={() =>
                                    onSelectFeature({
                                        type: 'administrative',
                                        id: String(feat.id),
                                        properties: feat.properties,
                                    })
                                }
                            />
                        )
                    })}

                {/* 2. Corridors / RoW Alignments */}
                {isCorridorsVisible &&
                    corridorsData?.features.map((feat) => {
                        const coords = feat.geometry.coordinates
                        const pathData = coords
                            .map((c: [number, number], i: number) => {
                                const [px, py] = projectToSvg(c[0], c[1], containerDimensions.width, containerDimensions.height)
                                return `${i === 0 ? 'M' : 'L'} ${px} ${py}`
                            })
                            .join(' ')

                        return (
                            <g key={feat.id}>
                                {/* Buffer glow */}
                                <path
                                    d={pathData}
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="12"
                                    strokeOpacity="0.25"
                                />
                                {/* Main Centerline */}
                                <path
                                    d={pathData}
                                    fill="none"
                                    stroke="#ea580c"
                                    strokeWidth="3"
                                    strokeDasharray="6 3"
                                />
                            </g>
                        )
                    })}

                {/* 3. Cadastral Parcel Polygons */}
                {isParcelsVisible &&
                    parcelsData?.features.map((feat) => {
                        const coords = feat.geometry.coordinates[0]
                        const pathData = coords
                            .map((c: [number, number], i: number) => {
                                const [px, py] = projectToSvg(c[0], c[1], containerDimensions.width, containerDimensions.height)
                                return `${i === 0 ? 'M' : 'L'} ${px} ${py}`
                            })
                            .join(' ') + ' Z'

                        const isSelected = selection.type === 'parcel' && selection.id === feat.properties.parcelId
                        const fillColor = getParcelColor(feat.properties.parcelStatus, feat.properties.isDisputed)

                        // Polygon centroid for label
                        const [cx, cy] = projectToSvg(
                            (coords[0][0] + coords[2][0]) / 2,
                            (coords[0][1] + coords[2][1]) / 2,
                            containerDimensions.width,
                            containerDimensions.height,
                        )

                        return (
                            <g key={feat.id}>
                                <path
                                    d={pathData}
                                    fill={fillColor}
                                    fillOpacity={isSelected ? 0.85 : 0.55}
                                    stroke={isSelected ? '#ffffff' : fillColor}
                                    strokeWidth={isSelected ? 3 : 1.5}
                                    className="transition-all hover:fill-opacity-80 hover:stroke-paper cursor-pointer"
                                    onClick={() =>
                                        onSelectFeature({
                                            type: 'parcel',
                                            id: feat.properties.parcelId,
                                            properties: feat.properties,
                                            coordinates: [(coords[0][0] + coords[2][0]) / 2, (coords[0][1] + coords[2][1]) / 2],
                                        })
                                    }
                                    onMouseEnter={(e) => {
                                        setHoveredFeature({
                                            type: 'parcel',
                                            title: `${feat.properties.surveyNumber} (${feat.properties.parcelId})`,
                                            subtitle: `${feat.properties.village}, ${feat.properties.district} • ${feat.properties.areaHectares} ha`,
                                            x: e.clientX,
                                            y: e.clientY,
                                        })
                                    }}
                                    onMouseLeave={() => setHoveredFeature(null)}
                                />
                                {viewport.zoom >= 8 && (
                                    <text
                                        x={cx}
                                        y={cy}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className={`pointer-events-none text-[9px] font-mono font-bold select-none ${
                                            baseStyle === 'dark' || baseStyle === 'satellite' ? 'fill-paper' : 'fill-ink-950'
                                        }`}
                                    >
                                        {feat.properties.surveyNumber}
                                    </text>
                                )}
                            </g>
                        )
                    })}

                {/* 4. Project Markers */}
                {isProjectsVisible &&
                    projectsData?.features.map((feat) => {
                        const [px, py] = projectToSvg(
                            feat.geometry.coordinates[0],
                            feat.geometry.coordinates[1],
                            containerDimensions.width,
                            containerDimensions.height,
                        )
                        const isSelected = selection.type === 'project' && selection.id === feat.properties.projectId

                        return (
                            <g
                                key={feat.id}
                                transform={`translate(${px}, ${py})`}
                                className="cursor-pointer group"
                                onClick={() =>
                                    onSelectFeature({
                                        type: 'project',
                                        id: feat.properties.projectId,
                                        properties: feat.properties,
                                        coordinates: [feat.geometry.coordinates[0], feat.geometry.coordinates[1]],
                                    })
                                }
                                onMouseEnter={(e) => {
                                    setHoveredFeature({
                                        type: 'project',
                                        title: `${feat.properties.code} — ${feat.properties.title}`,
                                        subtitle: `${feat.properties.state} • ${feat.properties.totalAreaHectares} ha`,
                                        x: e.clientX,
                                        y: e.clientY,
                                    })
                                }}
                                onMouseLeave={() => setHoveredFeature(null)}
                            >
                                <circle
                                    r={isSelected ? 16 : 12}
                                    fill="#b91c1c"
                                    stroke="#ffffff"
                                    strokeWidth="2.5"
                                    className="filter drop-shadow-md group-hover:scale-110 transition-transform"
                                />
                                <circle
                                    r={isSelected ? 22 : 18}
                                    fill="none"
                                    stroke="#b91c1c"
                                    strokeWidth="1.5"
                                    strokeOpacity="0.4"
                                    className="animate-pulse"
                                />
                                <text
                                    y={22}
                                    textAnchor="middle"
                                    className="fill-ink-900 text-[10px] font-mono font-bold bg-paper px-1 rounded shadow-xs pointer-events-none"
                                >
                                    {feat.properties.code}
                                </text>
                            </g>
                        )
                    })}
            </svg>

            {/* Hover Tooltip Popup */}
            {hoveredFeature && (
                <div
                    className="pointer-events-none fixed z-50 rounded-lg border border-ink-200 bg-paper/95 p-2 shadow-xl backdrop-blur-xs text-xs space-y-0.5"
                    style={{ left: hoveredFeature.x + 12, top: hoveredFeature.y + 12 }}
                >
                    <div className="flex items-center gap-1.5 font-bold text-ink-900">
                        <span>{hoveredFeature.title}</span>
                    </div>
                    <p className="text-[10px] text-ink-500">{hoveredFeature.subtitle}</p>
                </div>
            )}

            {/* Map Control Buttons (Bottom Left / Right) */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
                <button
                    type="button"
                    onClick={handleZoomIn}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 bg-paper/95 text-ink-700 shadow-md hover:bg-ink-100 hover:text-ink-900 transition-colors cursor-pointer"
                    title="Zoom In"
                >
                    <Plus className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={handleZoomOut}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 bg-paper/95 text-ink-700 shadow-md hover:bg-ink-100 hover:text-ink-900 transition-colors cursor-pointer"
                    title="Zoom Out"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={handleResetNorth}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 bg-paper/95 text-ink-700 shadow-md hover:bg-ink-100 hover:text-ink-900 transition-colors cursor-pointer"
                    title="Reset North Compass"
                >
                    <Compass className="h-4 w-4 text-terracotta-600" />
                </button>
            </div>

            {/* Scale Bar Indicator */}
            <div className="absolute bottom-4 left-4 rounded bg-ink-900/80 px-2 py-1 text-[9px] font-mono text-paper backdrop-blur-xs flex items-center gap-2">
                <span>EPSG:4326 (WGS84)</span>
                <span>•</span>
                <span>PostGIS / MapLibre Engine</span>
            </div>
        </div>
    )
}
