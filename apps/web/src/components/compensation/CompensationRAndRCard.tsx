import { useNavigate } from 'react-router-dom'
import { HeartHandshake, ExternalLink, Users } from 'lucide-react'
import { useRAndRByParcel } from '@/hooks/use-rehabilitation'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface CompensationRAndRCardProps {
    parcelId: string
}

export function CompensationRAndRCard({ parcelId }: CompensationRAndRCardProps) {
    const navigate = useNavigate()
    const { data: record, isLoading } = useRAndRByParcel(parcelId)

    if (isLoading || !record) return null

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        R&R Scheme Linkage
                    </h3>
                </div>
                <StatusBadge status={record.rAndRStatus} type="randr" />
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                    <span className="text-ink-600 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-ink-400" />
                        <span>Affected Family:</span>
                    </span>
                    <span className="font-mono font-bold text-ink-900">
                        {record.household.householdReference}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-ink-600">Eligibility Status:</span>
                    <StatusBadge status={record.eligibilityStatus} type="randr-eligibility" />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-ink-600">Defined Entitlements:</span>
                    <span className="font-mono font-bold text-ink-900">
                        {record.entitlements.length} Packages
                    </span>
                </div>

                <div className="pt-2 border-t border-ink-100">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.rehabilitationDetail(record.id))}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold w-full cursor-pointer"
                    >
                        <span>Open R&R Case</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
