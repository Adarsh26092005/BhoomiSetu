import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, FileStack, Loader2, CheckCircle2, Clock, Lock } from 'lucide-react'
import { useDocuments } from '@/hooks/use-documents'
import { useProjects } from '@/hooks/use-projects'
import { DocumentFilters, type DocumentFilterValues } from '@/components/documents/DocumentFilters'
import { DocumentTable } from '@/components/documents/DocumentTable'
import { DocumentKpiSummary } from '@/components/documents/DocumentKpiSummary'
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal'
import { Button } from '@/components/ui/button'

export function DocumentsPage() {
    const [searchParams] = useSearchParams()
    const queryProjectId = searchParams.get('projectId') ?? 'ALL'
    const queryParcelId = searchParams.get('parcelId') ?? ''

    const { data: documents = [], isLoading } = useDocuments()
    const { data: projects = [] } = useProjects()

    const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false)

    const [filters, setFilters] = React.useState<DocumentFilterValues>({
        search: queryParcelId ? queryParcelId : '',
        status: 'ALL',
        category: 'ALL',
        projectId: queryProjectId,
        fileType: 'ALL',
    })

    const availableProjects = React.useMemo(() => {
        return projects.map((p) => ({ id: p.id, code: p.code, title: p.title }))
    }, [projects])

    // Filter documents client-side
    const filteredDocuments = React.useMemo(() => {
        return documents.filter((doc) => {
            // Search query matching title, documentNumber, fileName, projectId, parcelId, surveyNumber, or uploadedBy
            if (filters.search) {
                const q = filters.search.toLowerCase()
                const matchTitle = doc.title.toLowerCase().includes(q)
                const matchNum = doc.documentNumber?.toLowerCase().includes(q)
                const matchFile = doc.fileName.toLowerCase().includes(q)
                const matchProject = doc.projectId.toLowerCase().includes(q)
                const matchParcel = doc.parcelId?.toLowerCase().includes(q)
                const matchSurvey = doc.surveyNumber?.toLowerCase().includes(q)
                const matchUploader = doc.uploadedBy.toLowerCase().includes(q)
                const matchId = doc.id.toLowerCase().includes(q)

                if (!matchTitle && !matchNum && !matchFile && !matchProject && !matchParcel && !matchSurvey && !matchUploader && !matchId) {
                    return false
                }
            }

            // Status filter
            if (filters.status !== 'ALL' && doc.verificationStatus !== filters.status) {
                return false
            }

            // Category filter
            if (filters.category !== 'ALL' && doc.category !== filters.category) {
                return false
            }

            // Project filter
            if (filters.projectId !== 'ALL' && doc.projectId !== filters.projectId) {
                return false
            }

            // File Type filter
            if (filters.fileType !== 'ALL' && doc.fileType !== filters.fileType) {
                return false
            }

            return true
        })
    }, [documents, filters])

    const totalCount = documents.length
    const verifiedCount = documents.filter((d) => d.verificationStatus === 'VERIFIED').length
    const underReviewCount = documents.filter((d) => d.verificationStatus === 'UNDER_REVIEW').length

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Statutory Document Vault...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Header Section */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper">
                                <FileStack className="h-4 w-4" />
                            </div>
                            <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-200 uppercase tracking-wider">
                                CENTRAL STATUTORY ARCHIVE
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                            Document Management & Verification
                        </h1>
                        <p className="text-xs text-ink-500 max-w-2xl">
                            Central statutory document vault for land acquisition records, gazette notifications, title deeds, and officer verification.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center gap-2 text-xs font-semibold shadow-xs"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Upload Record</span>
                        </Button>
                    </div>
                </div>

                {/* Scope Stats Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200">
                        <FileStack className="h-3.5 w-3.5 text-ink-600" />
                        <span>Vault Records: {totalCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-semibold text-signal-900 border border-signal-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-signal-700" />
                        <span>Statutory Verified: {verifiedCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
                        <Clock className="h-3.5 w-3.5 text-amber-700" />
                        <span>Under Scrutiny: {underReviewCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-700 border border-ink-200">
                        <Lock className="h-3.5 w-3.5 text-signal-600" />
                        <span>MinIO/S3 Storage Gateway: Ready</span>
                    </span>
                </div>
            </div>

            {/* 2. Document KPI Summary (6 Metrics) */}
            <DocumentKpiSummary documents={documents} />

            {/* 3. Interactive Search & Filters */}
            <DocumentFilters
                filters={filters}
                onFilterChange={setFilters}
                availableProjects={availableProjects}
                totalResults={filteredDocuments.length}
                totalDocuments={totalCount}
            />

            {/* 4. Document Register Table */}
            <DocumentTable
                documents={filteredDocuments}
                onResetFilters={() =>
                    setFilters({
                        search: '',
                        status: 'ALL',
                        category: 'ALL',
                        projectId: 'ALL',
                        fileType: 'ALL',
                    })
                }
                isFiltered={
                    Boolean(filters.search) ||
                    filters.status !== 'ALL' ||
                    filters.category !== 'ALL' ||
                    filters.projectId !== 'ALL' ||
                    filters.fileType !== 'ALL'
                }
            />

            {/* 5. Document Upload Modal */}
            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                availableProjects={availableProjects}
                defaultProjectId={queryProjectId !== 'ALL' ? queryProjectId : 'prj-001'}
            />
        </div>
    )
}
