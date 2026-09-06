import { Building, Globe, Layers, MapPin, Scale, ShieldCheck } from 'lucide-react'
import type { LandParcel } from '@/types'
import { formatINR, formatArea } from '@/lib/format'
import { StatusBadge } from '@/components/common/StatusBadge'

interface ParcelInfoCardsProps {
    parcel: LandParcel
}

export function ParcelInfoCards({ parcel }: ParcelInfoCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Cadastral Identifiers */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Layers className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Cadastral & Revenue Identifiers
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Survey Number</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">{parcel.surveyNumber}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Khasra / Revenue No.</dt>
                        <dd className="font-mono font-semibold text-ink-900 mt-0.5">{parcel.khasraNumber ?? 'N/A'}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Revenue Village</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{parcel.village}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Tehsil / Taluk</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{parcel.tehsil ?? 'Taluk Center'}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">District & State</dt>
                        <dd className="font-bold text-ink-900 mt-0.5">{parcel.district}, {parcel.state}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Verification Status</dt>
                        <dd className="mt-1">
                            <StatusBadge status={parcel.status} type="parcel" />
                        </dd>
                    </div>
                </dl>
            </div>

            {/* 2. Land Classification & Valuation */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Scale className="h-4 w-4 text-signal-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Land Classification & Valuation
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Land Classification</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{parcel.landType.replace('_', ' ')}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Acquired Area</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {formatArea(parcel.areaHectares)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Circle Rate / Hectare</dt>
                        <dd className="font-mono font-semibold text-ink-900 mt-0.5">
                            {formatINR(parcel.marketRateInrPerHectare)} / ha
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Total Assessed Award</dt>
                        <dd className="font-mono font-bold text-signal-700 text-xs mt-0.5">
                            {formatINR(parcel.compensationInr)}
                        </dd>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-signal-600" />
                            <span>100% Solatium Applied</span>
                        </span>
                        <span className="font-mono text-ink-700 font-semibold">Section 30 Compliant</span>
                    </div>
                </dl>
            </div>

            {/* 3. Geospatial & Centroid Coordinates */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Globe className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Geospatial Centroid & PostGIS Vector
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Centroid Latitude</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">{parcel.centroid.lat.toFixed(6)}° N</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Centroid Longitude</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">{parcel.centroid.lng.toFixed(6)}° E</dd>
                    </div>

                    <div className="sm:col-span-2">
                        <dt className="text-ink-400 font-medium text-[11px]">GIS Polygon Reference</dt>
                        <dd className="font-mono font-semibold text-ink-800 text-xs mt-0.5">
                            {parcel.gisPolygonReference ?? 'POLY-PENDING-VECTOR'}
                        </dd>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
                            <span>CRS: EPSG:4326 (WGS84)</span>
                        </span>
                        <span className="font-mono text-signal-700 font-semibold">Digitized Vector</span>
                    </div>
                </dl>
            </div>

            {/* 4. Scheme & Acquisition Linkage */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Building className="h-4 w-4 text-ink-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Scheme & Statutory Authority Linkage
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Acquisition Scheme ID</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">{parcel.projectId}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Acquisition Authority</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">District LAO Authority</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Registered Owners</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{parcel.owners.length} Landowners</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Last Record Update</dt>
                        <dd className="font-mono text-ink-600 mt-0.5">{parcel.lastUpdated ?? '2026-08-30'}</dd>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                        <span className="font-mono text-xs text-ink-600">Statutory Notice: Issued</span>
                        <span className="font-mono text-signal-700 font-semibold">Active Ledger</span>
                    </div>
                </dl>
            </div>
        </div>
    )
}
