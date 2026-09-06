import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileQuestion, Loader2 } from 'lucide-react'
import { useParcel } from '@/hooks/use-parcels'
import { ParcelDetailHeader } from '@/components/parcels/ParcelDetailHeader'
import { ParcelInfoCards } from '@/components/parcels/ParcelInfoCards'
import { ParcelCompensationCard } from '@/components/parcels/ParcelCompensationCard'
import { ParcelPossessionCard } from '@/components/parcels/ParcelPossessionCard'
import { ParcelLandownerTable } from '@/components/parcels/ParcelLandownerTable'
import { ParcelTimeline } from '@/components/parcels/ParcelTimeline'
import { ParcelMapPreview } from '@/components/parcels/ParcelMapPreview'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

export function ParcelDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: parcel, isLoading } = useParcel(id)

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Cadastral Parcel Dossier...</p>
            </div>
        )
    }

    if (!parcel) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rust-50 text-rust-600 border border-rust-200">
                    <FileQuestion className="h-7 w-7 text-rust-600" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-ink-900">Parcel Record Not Found</h2>
                    <p className="text-xs text-ink-500">
                        No cadastral land parcel was found matching identifier <strong className="font-mono text-ink-800">{id}</strong>.
                    </p>
                </div>
                <div className="pt-2">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(ROUTES.parcels)}
                        className="inline-flex items-center gap-1.5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to Parcel Register</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Header & Navigation */}
            <ParcelDetailHeader parcel={parcel} />

            {/* 2. Primary 12-Column Responsive Workspace */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left 8 Cols: Cadastral Info, Compensation Entitlement, Possession Handover, Landowners & Statutory Lifecycle */}
                <div className="space-y-6 lg:col-span-8">
                    <ParcelInfoCards parcel={parcel} />
                    <ParcelCompensationCard parcelId={parcel.id} />
                    <ParcelPossessionCard parcelId={parcel.id} />
                    <ParcelLandownerTable
                        owners={parcel.owners}
                        totalCompensationInr={parcel.compensationInr}
                    />
                    <ParcelTimeline parcel={parcel} />
                </div>

                {/* Right 4 Cols: Geospatial Vector Preview */}
                <div className="space-y-6 lg:col-span-4">
                    <ParcelMapPreview parcel={parcel} />
                </div>
            </div>
        </div>
    )
}
