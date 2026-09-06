import { useNavigate } from 'react-router-dom'
import { Layers, MapPin, Tag, ExternalLink } from 'lucide-react'
import type { RAndRCase } from '@/types'
import { useParcel } from '@/hooks/use-parcels'
import { formatArea } from '@/lib/format'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface RAndRParcelContextProps {
    record: RAndRCase
}

export function RAndRParcelContext({ record }: RAndRParcelContextProps) {
    const navigate = useNavigate()
    const { data: parcel } = useParcel(record.parcelId)

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Affected Cadastral Parcel
                    </h3>
                </div>
                {parcel && <StatusBadge status={parcel.status} type="parcel" />}
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Parcel Identifier</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">{record.parcelId}</dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Khasra / Survey Number</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">{record.surveyNumber}</dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Location</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>{record.village}, {record.tehsil}</span>
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Cadastral Land Area</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                        {parcel ? formatArea(parcel.areaHectares) : `${record.affectedAreaHectares} ha`}
                    </dd>
                </div>

                <div className="sm:col-span-2">
                    <dt className="text-ink-400 font-medium text-[11px]">Land Classification</dt>
                    <dd className="font-medium text-ink-800 mt-0.5 flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-ink-400" />
                        <span>{parcel?.landType ? parcel.landType.replace(/_/g, ' ') : 'Agricultural / Displaced Settlement'}</span>
                    </dd>
                </div>
            </dl>

            <div className="pt-2 border-t border-ink-100">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.parcelDetail(record.parcelId))}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold w-full cursor-pointer"
                >
                    <span>Open Parcel Dossier</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}
