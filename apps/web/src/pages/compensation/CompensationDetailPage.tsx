import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, IndianRupee, Loader2 } from 'lucide-react'
import { useCompensationRecord } from '@/hooks/use-compensation'
import { CompensationDetailHeader } from '@/components/compensation/CompensationDetailHeader'
import { CompensationBreakdown } from '@/components/compensation/CompensationBreakdown'
import { LandownerCompensationTable } from '@/components/compensation/LandownerCompensationTable'
import { CompensationAssessmentPanel } from '@/components/compensation/CompensationAssessmentPanel'
import { DisbursementPanel } from '@/components/compensation/DisbursementPanel'
import { PaymentHistoryTable } from '@/components/compensation/PaymentHistoryTable'
import { CompensationTimeline } from '@/components/compensation/CompensationTimeline'
import { AwardInformationCard } from '@/components/compensation/AwardInformationCard'
import { CompensationPossessionCard } from '@/components/compensation/CompensationPossessionCard'
import { CompensationRAndRCard } from '@/components/compensation/CompensationRAndRCard'
import { CompensationParcelContext } from '@/components/compensation/CompensationParcelContext'
import { CompensationProjectContext } from '@/components/compensation/CompensationProjectContext'
import { CompensationWorkflowCard } from '@/components/compensation/CompensationWorkflowCard'
import { CompensationRelatedDocuments } from '@/components/compensation/CompensationRelatedDocuments'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

export function CompensationDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: record, isLoading } = useCompensationRecord(id)

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Statutory Compensation Dossier...</p>
            </div>
        )
    }

    if (!record) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rust-50 text-rust-600 border border-rust-200">
                    <IndianRupee className="h-7 w-7 text-rust-600" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-ink-900">Compensation Record Not Found</h2>
                    <p className="text-xs text-ink-500">
                        No statutory compensation assessment was found matching identifier <strong className="font-mono text-ink-800">{id}</strong>.
                    </p>
                </div>
                <div className="pt-2">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(ROUTES.compensation)}
                        className="inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to Compensation Register</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Header & Navigation */}
            <CompensationDetailHeader record={record} />

            {/* 2. Primary 12-Column Responsive Workspace */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left 8 Cols: Breakdown, Landowners, Assessment, Disbursement, Transactions, Timeline */}
                <div className="space-y-6 lg:col-span-8">
                    <CompensationBreakdown record={record} />
                    <LandownerCompensationTable landowners={record.landowners} />
                    <CompensationAssessmentPanel record={record} />
                    <DisbursementPanel record={record} />
                    <PaymentHistoryTable transactions={record.transactions} />
                    <CompensationTimeline timeline={record.timeline} />
                </div>

                {/* Right 4 Cols: Award Info, Possession Readiness, R&R Linkage, Plot Context, Scheme Context, Workflow, Documents */}
                <div className="space-y-6 lg:col-span-4">
                    <AwardInformationCard record={record} />
                    <CompensationPossessionCard parcelId={record.parcelId} />
                    <CompensationRAndRCard parcelId={record.parcelId} />
                    <CompensationParcelContext record={record} />
                    <CompensationProjectContext record={record} />
                    <CompensationWorkflowCard projectId={record.projectId} />
                    <CompensationRelatedDocuments projectId={record.projectId} parcelId={record.parcelId} />
                </div>
            </div>
        </div>
    )
}
