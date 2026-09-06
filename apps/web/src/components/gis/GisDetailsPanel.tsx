import { useNavigate } from 'react-router-dom'
import {
    X,
    ExternalLink,
    Building2,
    MapPin,
    IndianRupee,
    Flag,
    HeartHandshake,
    FileStack,
    AlertTriangle,
    Tag,
    User,
} from 'lucide-react'
import type { MapSelection, GisParcelProperties, GisProjectProperties, GisAdministrativeProperties } from '@/types/gis'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatArea, formatINR } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface GisDetailsPanelProps {
    selection: MapSelection
    onClose: () => void
    onFilterByProject?: (projectId: string) => void
}

export function GisDetailsPanel({
    selection,
    onClose,
    onFilterByProject,
}: GisDetailsPanelProps) {
    const navigate = useNavigate()

    if (!selection.type || !selection.properties) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xl space-y-3 w-80 text-xs">
                <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                    <span className="font-bold text-ink-900 uppercase tracking-wider text-[11px]">
                        Spatial Feature Inspector
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-ink-400 hover:text-ink-800 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-6 text-center text-ink-400 space-y-2">
                    <MapPin className="h-8 w-8 text-ink-300 mx-auto" />
                    <p className="font-semibold text-ink-700">No Feature Selected</p>
                    <p className="text-[11px]">
                        Click on any cadastral parcel polygon, project marker node, or corridor alignment to inspect its statutory dossier.
                    </p>
                </div>
            </div>
        )
    }

    // 1. Parcel Selected
    if (selection.type === 'parcel') {
        const p = selection.properties as GisParcelProperties

        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-4 sm:p-5 shadow-2xl space-y-4 w-84 sm:w-96 text-xs max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-ink-100 pb-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-ink-900 bg-ink-100 px-2 py-0.5 rounded border border-ink-200">
                                {p.parcelId}
                            </span>
                            <StatusBadge status={p.parcelStatus} type="parcel" />
                            {p.isDisputed && (
                                <span className="rounded bg-rust-100 px-1.5 py-0.5 text-[10px] font-bold text-rust-800 border border-rust-200 uppercase flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Disputed</span>
                                </span>
                            )}
                        </div>
                        <h2 className="text-sm font-bold text-ink-900">
                            {p.surveyNumber} {p.khasraNumber ? `(${p.khasraNumber})` : ''}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-ink-400 hover:text-ink-800 cursor-pointer shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Scheme & Cadastre Location */}
                <div className="rounded-lg bg-ink-50/70 p-3 border border-ink-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-ink-800 font-semibold">
                        <Building2 className="h-3.5 w-3.5 text-terracotta-600 shrink-0" />
                        <span className="truncate">{p.projectCode} — {p.projectName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-500 text-[11px]">
                        <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                        <span>{p.village}, {p.district}, {p.state}</span>
                    </div>
                </div>

                {/* Attributes Grid */}
                <dl className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg border border-ink-100 bg-paper space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Cadastral Area</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs">
                            {formatArea(p.areaHectares)}
                        </dd>
                    </div>

                    <div className="p-2.5 rounded-lg border border-ink-100 bg-paper space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Land Classification</dt>
                        <dd className="font-semibold text-ink-900 text-[11px] truncate flex items-center gap-1">
                            <Tag className="h-3 w-3 text-ink-400" />
                            <span>{p.landType ? p.landType.replace(/_/g, ' ') : 'Agricultural'}</span>
                        </dd>
                    </div>

                    <div className="p-2.5 rounded-lg border border-ink-100 bg-paper space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Compensation Assessed</dt>
                        <dd className="font-mono font-bold text-signal-700 text-xs">
                            {formatINR(p.compensationInr)}
                        </dd>
                    </div>

                    <div className="p-2.5 rounded-lg border border-ink-100 bg-paper space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Registered Owners</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs flex items-center gap-1">
                            <User className="h-3 w-3 text-ink-400" />
                            <span>{p.landownerCount} Co-Sharers</span>
                        </dd>
                    </div>
                </dl>

                {/* Linked Status Badges */}
                <div className="rounded-lg border border-ink-200 bg-ink-50/40 p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-600 flex items-center gap-1">
                            <IndianRupee className="h-3 w-3 text-signal-600" />
                            <span>Compensation DBT:</span>
                        </span>
                        <span className={`font-bold font-mono ${p.compensationStatus === 'PAID' ? 'text-signal-700' : 'text-amber-700'}`}>
                            {p.compensationStatus === 'PAID' ? 'Disbursed' : 'Under Assessment'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-600 flex items-center gap-1">
                            <Flag className="h-3 w-3 text-terracotta-600" />
                            <span>Land Possession:</span>
                        </span>
                        <span className={`font-bold font-mono ${p.possessionStatus === 'POSSESSION_TAKEN' ? 'text-signal-700' : 'text-amber-700'}`}>
                            {p.possessionStatus === 'POSSESSION_TAKEN' ? 'Possession Taken' : 'Pending Handover'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-600 flex items-center gap-1">
                            <HeartHandshake className="h-3 w-3 text-pink-600" />
                            <span>R&R Second Sched:</span>
                        </span>
                        <span className="font-bold text-ink-800">
                            {p.randrStatus ? p.randrStatus.replace(/_/g, ' ') : 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Action Deep-Links */}
                <div className="space-y-1.5 pt-2 border-t border-ink-100">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(ROUTES.parcelDetail(p.parcelId))}
                        className="w-full justify-center text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>Open Parcel Dossier</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>

                    <div className="grid grid-cols-2 gap-1.5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(ROUTES.projectDetail(p.projectId))}
                            className="text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <Building2 className="h-3 w-3" />
                            <span>Scheme</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`${ROUTES.documents}?parcelId=${p.parcelId}`)}
                            className="text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <FileStack className="h-3 w-3" />
                            <span>Vault Files</span>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // 2. Project Selected
    if (selection.type === 'project') {
        const prj = selection.properties as GisProjectProperties

        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-4 sm:p-5 shadow-2xl space-y-4 w-84 sm:w-96 text-xs max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-ink-100 pb-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-ink-900 bg-ink-100 px-2 py-0.5 rounded border border-ink-200">
                                {prj.code}
                            </span>
                            <StatusBadge status={prj.projectStatus} type="project" />
                        </div>
                        <h2 className="text-sm font-bold text-ink-900 leading-tight">
                            {prj.title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-ink-400 hover:text-ink-800 cursor-pointer shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-1 text-ink-600">
                    <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-ink-400" />
                        <span>Agency: <strong className="text-ink-900">{prj.implementingAgency}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>{prj.state} ({prj.districts.join(', ')})</span>
                    </div>
                </div>

                <dl className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg border border-ink-100 bg-ink-50/40 space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Acquisition Scope</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs">
                            {formatArea(prj.totalAreaHectares)}
                        </dd>
                    </div>

                    <div className="p-2.5 rounded-lg border border-ink-100 bg-ink-50/40 space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Affected Parcels</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs">
                            {prj.parcelCount} Plots
                        </dd>
                    </div>

                    <div className="p-2.5 rounded-lg border border-ink-100 bg-ink-50/40 space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Est. Compensation</dt>
                        <dd className="font-mono font-bold text-signal-700 text-xs">
                            {formatINR(prj.estimatedCompensationInr, { compact: true })}
                        </dd>
                    </div>

                    <div className="p-2.5 rounded-lg border border-ink-100 bg-ink-50/40 space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Disbursed DBT</dt>
                        <dd className="font-mono font-bold text-signal-700 text-xs">
                            {formatINR(prj.disbursedCompensationInr, { compact: true })}
                        </dd>
                    </div>
                </dl>

                {/* Actions */}
                <div className="space-y-1.5 pt-2 border-t border-ink-100">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(ROUTES.projectDetail(prj.projectId))}
                        className="w-full justify-center text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>Open Scheme Dossier</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>

                    {onFilterByProject && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onFilterByProject(prj.projectId)}
                            className="w-full justify-center text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-terracotta-700 border-terracotta-200 bg-terracotta-50/40"
                        >
                            <span>Filter Map to This Scheme Only</span>
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    // 3. Administrative Boundary Selected
    if (selection.type === 'administrative' || selection.type === 'district') {
        const adm = selection.properties as GisAdministrativeProperties

        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-4 sm:p-5 shadow-2xl space-y-4 w-84 sm:w-96 text-xs max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-ink-100 pb-3">
                    <div className="space-y-1">
                        <span className="font-mono text-xs font-bold text-ink-600 uppercase">
                            Administrative Jurisdiction
                        </span>
                        <h2 className="text-sm font-bold text-ink-900">
                            {adm.name}, {adm.state}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-ink-400 hover:text-ink-800 cursor-pointer shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <dl className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg border border-ink-100 bg-ink-50/40 space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Acquisition Schemes</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs">
                            {adm.totalProjectsCount} Schemes
                        </dd>
                    </div>

                    <div className="p-2.5 rounded-lg border border-ink-100 bg-ink-50/40 space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Cadastral Parcels</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs">
                            {adm.totalParcelsCount} Plots
                        </dd>
                    </div>

                    <div className="p-2.5 rounded-lg border border-ink-100 bg-ink-50/40 space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Proposed Area</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs">
                            {formatArea(adm.totalAreaHectares)}
                        </dd>
                    </div>

                    <div className="p-2.5 rounded-lg border border-ink-100 bg-ink-50/40 space-y-0.5">
                        <dt className="text-[10px] text-ink-400 font-medium">Acquired Area</dt>
                        <dd className="font-mono font-bold text-signal-700 text-xs">
                            {formatArea(adm.acquiredAreaHectares)}
                        </dd>
                    </div>
                </dl>
            </div>
        )
    }

    return null
}
