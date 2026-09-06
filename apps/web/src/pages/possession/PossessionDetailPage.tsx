import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Flag, Loader2 } from 'lucide-react'
import { usePossessionRecord } from '@/hooks/use-possession'
import { PossessionDetailHeader } from '@/components/possession/PossessionDetailHeader'
import { PossessionProgressTracker } from '@/components/possession/PossessionProgressTracker'
import { PossessionReadinessChecklist } from '@/components/possession/PossessionReadinessChecklist'
import { PossessionNoticeCard } from '@/components/possession/PossessionNoticeCard'
import { SiteVerificationPanel } from '@/components/possession/SiteVerificationPanel'
import { PossessionActionPanel } from '@/components/possession/PossessionActionPanel'
import { PossessionCertificatePanel } from '@/components/possession/PossessionCertificatePanel'
import { PossessionMapPreview } from '@/components/possession/PossessionMapPreview'
import { PossessionCompensationCard } from '@/components/possession/PossessionCompensationCard'
import { PossessionRAndRCard } from '@/components/possession/PossessionRAndRCard'
import { PossessionParcelContext } from '@/components/possession/PossessionParcelContext'
import { PossessionProjectContext } from '@/components/possession/PossessionProjectContext'
import { PossessionWorkflowCard } from '@/components/possession/PossessionWorkflowCard'
import { PossessionRelatedDocuments } from '@/components/possession/PossessionRelatedDocuments'
import { PossessionTimeline } from '@/components/possession/PossessionTimeline'
import { PossessionRemarks } from '@/components/possession/PossessionRemarks'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

export function PossessionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: record, isLoading } = usePossessionRecord(id)

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Statutory Possession Dossier...</p>
            </div>
        )
    }

    if (!record) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rust-50 text-rust-600 border border-rust-200">
                    <Flag className="h-7 w-7 text-rust-600" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-ink-900">Possession Record Not Found</h2>
                    <p className="text-xs text-ink-500">
                        No statutory land possession dossier was found matching identifier <strong className="font-mono text-ink-800">{id}</strong>.
                    </p>
                </div>
                <div className="pt-2">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(ROUTES.possession)}
                        className="inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to Possession Register</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Header & Navigation */}
            <PossessionDetailHeader record={record} />

            {/* 2. Pipeline Visual Progress Tracker */}
            <PossessionProgressTracker status={record.possessionStatus} />

            {/* 3. Primary 12-Column Responsive Workspace */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left 8 Cols: Checklist, Notice, Site Verification, Action, Certificate, Timeline, Remarks */}
                <div className="space-y-6 lg:col-span-8">
                    <PossessionReadinessChecklist
                        items={record.readinessChecklist}
                        readinessStatus={record.readinessStatus}
                        holdReason={record.holdReason}
                        disputeReason={record.disputeReason}
                    />
                    <PossessionNoticeCard record={record} />
                    <SiteVerificationPanel record={record} />
                    <PossessionActionPanel record={record} />
                    <PossessionCertificatePanel record={record} />
                    <PossessionTimeline timeline={record.timeline} />
                    <PossessionRemarks possessionId={record.id} remarks={record.remarksList} />
                </div>

                {/* Right 4 Cols: GIS Map, Compensation, R&R Linkage, Plot Context, Scheme Context, Workflow, Documents */}
                <div className="space-y-6 lg:col-span-4">
                    <PossessionMapPreview record={record} />
                    <PossessionCompensationCard record={record} />
                    <PossessionRAndRCard parcelId={record.parcelId} projectId={record.projectId} />
                    <PossessionParcelContext record={record} />
                    <PossessionProjectContext record={record} />
                    <PossessionWorkflowCard projectId={record.projectId} />
                    <PossessionRelatedDocuments projectId={record.projectId} parcelId={record.parcelId} />
                </div>
            </div>
        </div>
    )
}
