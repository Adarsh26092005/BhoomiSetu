import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileQuestion, Loader2 } from 'lucide-react'
import { useDocument } from '@/hooks/use-documents'
import { DocumentDetailHeader } from '@/components/documents/DocumentDetailHeader'
import { DocumentMetadataCards } from '@/components/documents/DocumentMetadataCards'
import { DocumentPreview } from '@/components/documents/DocumentPreview'
import { DocumentVerificationPanel } from '@/components/documents/DocumentVerificationPanel'
import { DocumentVersionHistory } from '@/components/documents/DocumentVersionHistory'
import { DocumentActivityTimeline } from '@/components/documents/DocumentActivityTimeline'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

export function DocumentDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: document, isLoading } = useDocument(id)

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
                <p className="text-xs font-semibold">Loading Statutory Document Dossier...</p>
            </div>
        )
    }

    if (!document) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rust-50 text-rust-600 border border-rust-200">
                    <FileQuestion className="h-7 w-7 text-rust-600" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-ink-900">Document Record Not Found</h2>
                    <p className="text-xs text-ink-500">
                        No statutory document was found matching vault identifier <strong className="font-mono text-ink-800">{id}</strong>.
                    </p>
                </div>
                <div className="pt-2">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(ROUTES.documents)}
                        className="inline-flex items-center gap-1.5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to Document Vault</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Header & Navigation */}
            <DocumentDetailHeader document={document} />

            {/* 2. Primary 12-Column Responsive Workspace */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left 8 Cols: Metadata, Verification Panel, Version History, Audit */}
                <div className="space-y-6 lg:col-span-8">
                    <DocumentMetadataCards document={document} />
                    <DocumentVerificationPanel document={document} />
                    <DocumentVersionHistory document={document} />
                    <DocumentActivityTimeline document={document} />
                </div>

                {/* Right 4 Cols: Document Preview Surface */}
                <div className="space-y-6 lg:col-span-4">
                    <DocumentPreview document={document} />
                </div>
            </div>
        </div>
    )
}
