import {
    Map,
    Layers,
    RotateCcw,
    Maximize2,
    Sun,
    Moon,
    Globe,
    BarChart3,
    AlertTriangle,
    Navigation,
    Filter,
} from 'lucide-react'
import type { GisMapBaseStyle, GisMapViewport } from '@/types/gis'
import { Button } from '@/components/ui/button'

interface GisToolbarProps {
    baseStyle: GisMapBaseStyle
    onBaseStyleChange: (style: GisMapBaseStyle) => void
    viewport: GisMapViewport
    onResetView: () => void
    onFitAll: () => void
    isLayerControlOpen: boolean
    onToggleLayerControl: () => void
    isFiltersOpen: boolean
    onToggleFilters: () => void
    isAnalyticsOpen: boolean
    onToggleAnalytics: () => void
    isAttentionOpen: boolean
    onToggleAttention: () => void
    activeFiltersCount: number
    attentionItemsCount: number
    totalParcelsCount: number
}

export function GisToolbar({
    baseStyle,
    onBaseStyleChange,
    viewport,
    onResetView,
    onFitAll,
    isLayerControlOpen,
    onToggleLayerControl,
    isFiltersOpen,
    onToggleFilters,
    isAnalyticsOpen,
    onToggleAnalytics,
    isAttentionOpen,
    onToggleAttention,
    activeFiltersCount,
    attentionItemsCount,
    totalParcelsCount,
}: GisToolbarProps) {
    return (
        <header className="rounded-xl border border-ink-200 bg-paper p-3 sm:p-4 shadow-xs flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Title & Coordinate Viewport Indicator */}
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta-700 text-paper shadow-xs shrink-0">
                    <Map className="h-5 w-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm sm:text-base font-bold text-ink-900 leading-tight">
                            GIS Cadastral Map & Spatial Intelligence
                        </h1>
                        <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-200 uppercase tracking-wider hidden sm:inline-block">
                            National Land Registry
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-ink-500 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3 text-terracotta-600" />
                            <span>{viewport.lat.toFixed(4)}° N, {viewport.lng.toFixed(4)}° E</span>
                        </span>
                        <span>•</span>
                        <span>Zoom: {viewport.zoom.toFixed(1)}x</span>
                        <span>•</span>
                        <span className="text-ink-700 font-semibold">{totalParcelsCount} Plots Indexed</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Workspace View Controls */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Filters Toggle */}
                <Button
                    type="button"
                    variant={isFiltersOpen ? 'primary' : 'outline'}
                    size="sm"
                    onClick={onToggleFilters}
                    className="relative flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <Filter className="h-3.5 w-3.5" />
                    <span>Spatial Filters</span>
                    {activeFiltersCount > 0 && (
                        <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rust-600 text-[10px] font-bold text-paper px-1">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>

                {/* Layer Control Toggle */}
                <Button
                    type="button"
                    variant={isLayerControlOpen ? 'primary' : 'outline'}
                    size="sm"
                    onClick={onToggleLayerControl}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <Layers className="h-3.5 w-3.5 text-ink-600" />
                    <span>Layers</span>
                </Button>

                {/* Spatial Attention Toggle */}
                <Button
                    type="button"
                    variant={isAttentionOpen ? 'primary' : 'outline'}
                    size="sm"
                    onClick={onToggleAttention}
                    className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                        attentionItemsCount > 0 && !isAttentionOpen
                            ? 'border-rust-300 text-rust-800 bg-rust-50/60 hover:bg-rust-100'
                            : ''
                    }`}
                >
                    <AlertTriangle className="h-3.5 w-3.5 text-rust-600" />
                    <span>Risk & Attention</span>
                    {attentionItemsCount > 0 && (
                        <span className="rounded bg-rust-600 px-1.5 py-0.2 text-[10px] font-bold text-paper">
                            {attentionItemsCount}
                        </span>
                    )}
                </Button>

                {/* Analytics Drawer Toggle */}
                <Button
                    type="button"
                    variant={isAnalyticsOpen ? 'primary' : 'outline'}
                    size="sm"
                    onClick={onToggleAnalytics}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <BarChart3 className="h-3.5 w-3.5 text-signal-700" />
                    <span>Analytics</span>
                </Button>

                {/* Base Map Style Switcher */}
                <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5 text-xs">
                    <button
                        type="button"
                        onClick={() => onBaseStyleChange('light')}
                        className={`rounded-md px-2 py-1 flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                            baseStyle === 'light' ? 'bg-paper text-ink-900 shadow-xs' : 'text-ink-600 hover:text-ink-900'
                        }`}
                        title="Light Cadastral Basemap"
                    >
                        <Sun className="h-3 w-3 text-amber-500" />
                        <span className="hidden sm:inline">Light</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onBaseStyleChange('dark')}
                        className={`rounded-md px-2 py-1 flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                            baseStyle === 'dark' ? 'bg-paper text-ink-900 shadow-xs' : 'text-ink-600 hover:text-ink-900'
                        }`}
                        title="Dark Vector Basemap"
                    >
                        <Moon className="h-3 w-3 text-indigo-500" />
                        <span className="hidden sm:inline">Dark</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onBaseStyleChange('satellite')}
                        className={`rounded-md px-2 py-1 flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                            baseStyle === 'satellite' ? 'bg-paper text-ink-900 shadow-xs' : 'text-ink-600 hover:text-ink-900'
                        }`}
                        title="Satellite Imagery Basemap"
                    >
                        <Globe className="h-3 w-3 text-signal-600" />
                        <span className="hidden sm:inline">Satellite</span>
                    </button>
                </div>

                {/* Fit / Reset Actions */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onFitAll}
                    className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    title="Fit all features into view"
                >
                    <Maximize2 className="h-3 w-3" />
                    <span className="hidden md:inline">Fit All</span>
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onResetView}
                    className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    title="Reset to National Centroid View"
                >
                    <RotateCcw className="h-3 w-3" />
                    <span className="hidden md:inline">Reset</span>
                </Button>
            </div>
        </header>
    )
}
