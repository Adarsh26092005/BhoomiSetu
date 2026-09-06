import { Layers, MapPin, Tag } from 'lucide-react'
import type { CompensationRecord } from '@/types'
import { useParcel } from '@/hooks/use-parcels'
import { formatArea } from '@/lib/format'
import { StatusBadge } from '@/components/common/StatusBadge'

interface CompensationParcelContextProps {
    record: CompensationRecord
}

export function CompensationParcelContext({ record }: CompensationParcelContextProps) {
    const { data: parcel } = useParcel(record.parcelId)

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Cadastral Parcel Details
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
                    <dt className="text-ink-400 font-medium text-[11px]">Village / Tehsil Location</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>{parcel ? `${parcel.village}, ${parcel.tehsil ?? parcel.district}` : 'Cadastral Unit'}</span>
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Land Area</dt>
                    <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                        {formatArea(record.landAreaHectares)}
                    </dd>
                </div>

                <div className="sm:col-span-2">
                    <dt className="text-ink-400 font-medium text-[11px]">Land Classification</dt>
                    <dd className="font-medium text-ink-800 mt-0.5 flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-ink-400" />
                        <span>{record.landClassification}</span>
                    </dd>
                </div>
            </dl>
        </div>
    )
}
