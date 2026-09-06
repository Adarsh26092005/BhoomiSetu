import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, HeartHandshake, Loader2 } from 'lucide-react'
import { useRAndRCase } from '@/hooks/use-rehabilitation'
import { RAndRDetailHeader } from '@/components/rehabilitation/RAndRDetailHeader'
import { RAndRProgressTracker } from '@/components/rehabilitation/RAndRProgressTracker'
import { AffectedHouseholdCard } from '@/components/rehabilitation/AffectedHouseholdCard'
import { RAndREligibilityPanel } from '@/components/rehabilitation/RAndREligibilityPanel'
import { RAndREntitlementPanel } from '@/components/rehabilitation/RAndREntitlementPanel'
import { RAndRBenefitsPanel } from '@/components/rehabilitation/RAndRBenefitsPanel'
import { RelocationProgressPanel } from '@/components/rehabilitation/RelocationProgressPanel'
import { ResettlementSiteCard } from '@/components/rehabilitation/ResettlementSiteCard'
import { LivelihoodSupportCard } from '@/components/rehabilitation/LivelihoodSupportCard'
import { RAndRCompensationCard } from '@/components/rehabilitation/RAndRCompensationCard'
import { RAndRPossessionCard } from '@/components/rehabilitation/RAndRPossessionCard'
import { RAndRParcelContext } from '@/components/rehabilitation/RAndRParcelContext'
import { RAndRProjectContext } from '@/components/rehabilitation/RAndRProjectContext'
import { RAndRWorkflowCard } from '@/components/rehabilitation/RAndRWorkflowCard'
import { RAndRRelatedDocuments } from '@/components/rehabilitation/RAndRRelatedDocuments'
import { RAndRMapPreview } from '@/components/rehabilitation/RAndRMapPreview'
import { PostRelocationVerificationPanel } from '@/components/rehabilitation/PostRelocationVerificationPanel'
import { RAndRCompletionPanel } from '@/components/rehabilitation/RAndRCompletionPanel'
import { RAndRTimeline } from '@/components/rehabilitation/RAndRTimeline'
import { RAndRRemarks } from '@/components/rehabilitation/RAndRRemarks'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

export function RehabilitationDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: record, isLoading } = useRAndRCase(id)

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Statutory R&R Dossier...</p>
            </div>
        )
    }

    if (!record) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rust-50 text-rust-600 border border-rust-200">
                    <HeartHandshake className="h-7 w-7 text-rust-600" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-ink-900">R&R Case Not Found</h2>
                    <p className="text-xs text-ink-500">
                        No statutory rehabilitation & resettlement record was found matching identifier <strong className="font-mono text-ink-800">{id}</strong>.
                    </p>
                </div>
                <div className="pt-2">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(ROUTES.rehabilitation)}
                        className="inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to R&R Register</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Header & Navigation */}
            <RAndRDetailHeader record={record} />

            {/* 2. Pipeline Visual Progress Tracker */}
            <RAndRProgressTracker status={record.rAndRStatus} />

            {/* 3. Primary 12-Column Responsive Workspace */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left 8 Cols: Household, Eligibility, Entitlements, Benefits, Relocation, Verification, Completion, Timeline, Remarks */}
                <div className="space-y-6 lg:col-span-8">
                    <AffectedHouseholdCard household={record.household} />
                    <RAndREligibilityPanel record={record} />
                    <RAndREntitlementPanel record={record} />
                    <RAndRBenefitsPanel record={record} />
                    <RelocationProgressPanel record={record} />
                    <PostRelocationVerificationPanel record={record} />
                    <RAndRCompletionPanel record={record} />
                    <RAndRTimeline timeline={record.timeline} />
                    <RAndRRemarks rAndRCaseId={record.id} remarks={record.remarksList} />
                </div>

                {/* Right 4 Cols: Resettlement Site, Livelihood Support, Compensation Linkage, Possession Linkage, Plot Context, Scheme Context, Workflow, Documents, GIS */}
                <div className="space-y-6 lg:col-span-4">
                    <ResettlementSiteCard site={record.resettlementSite} relocationRequired={record.relocationRequired} />
                    <LivelihoodSupportCard livelihood={record.livelihoodSupport} />
                    <RAndRCompensationCard parcelId={record.parcelId} compensationId={record.compensationId} />
                    <RAndRPossessionCard parcelId={record.parcelId} possessionId={record.possessionId} />
                    <RAndRParcelContext record={record} />
                    <RAndRProjectContext record={record} />
                    <RAndRWorkflowCard projectId={record.projectId} />
                    <RAndRRelatedDocuments projectId={record.projectId} parcelId={record.parcelId} />
                    <RAndRMapPreview record={record} />
                </div>
            </div>
        </div>
    )
}
