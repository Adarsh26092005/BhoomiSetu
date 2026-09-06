import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Landmark, Map, MapPin, Layers, FileStack, Wallet, Flag } from 'lucide-react'
import type { LandParcel } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface ParcelDetailHeaderProps {
    parcel: LandParcel
}

export function ParcelDetailHeader({ parcel }: ParcelDetailHeaderProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-3">
                <button
                    type="button"
                    onClick={() => navigate(ROUTES.parcels)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Land Parcel Register</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-ink-500 font-mono">
                    <span>Cadastral ID: <strong className="text-ink-900">{parcel.id}</strong></span>
                </div>
            </div>

            {/* Main Title & Scope Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-ink-900 bg-ink-100 px-2.5 py-0.5 rounded border border-ink-200">
                            {parcel.surveyNumber}
                        </span>
                        <StatusBadge status={parcel.status} type="parcel" />
                        <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[11px] font-bold text-terracotta-800 border border-terracotta-200">
                            {parcel.landType.replace('_', ' ')}
                        </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                        Survey Plot {parcel.surveyNumber}
                        {parcel.khasraNumber ? ` (${parcel.khasraNumber})` : ''}
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-ink-600">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.projectDetail(parcel.projectId))}
                            className="flex items-center gap-1 font-semibold text-terracotta-700 hover:underline"
                        >
                            <Landmark className="h-3.5 w-3.5" />
                            <span>Scheme: {parcel.projectId}</span>
                        </button>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
                            <span>
                                {parcel.village}, {parcel.tehsil ?? 'Circle'}, {parcel.district}, {parcel.state}
                            </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-ink-500 font-mono">
                            <Layers className="h-3.5 w-3.5" />
                            <span>Ref: {parcel.gisPolygonReference ?? 'POLY-PENDING'}</span>
                        </span>
                    </div>
                </div>

                {/* Module Navigation Shortcuts */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.gis}?parcelId=${parcel.id}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/50"
                    >
                        <Map className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>View on GIS</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.documents}?parcelId=${parcel.id}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <FileStack className="h-3.5 w-3.5 text-ink-600" />
                        <span>Title Deeds</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.compensation}?parcelId=${parcel.id}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <Wallet className="h-3.5 w-3.5 text-signal-600" />
                        <span>DBT Award</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.possession}?parcelId=${parcel.id}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/50"
                    >
                        <Flag className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>Possession</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
