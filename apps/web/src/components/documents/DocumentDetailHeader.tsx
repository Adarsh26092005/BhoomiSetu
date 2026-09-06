import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Landmark, Layers, Map, Calendar, User, FileText, Download } from 'lucide-react'
import type { ProjectDocument } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface DocumentDetailHeaderProps {
    document: ProjectDocument
}

export function DocumentDetailHeader({ document }: DocumentDetailHeaderProps) {
    const navigate = useNavigate()

    const formatFileSize = (kb: number) => {
        if (kb >= 1024) {
            return `${(kb / 1024).toFixed(1)} MB`
        }
        return `${kb} KB`
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-3">
                <button
                    type="button"
                    onClick={() => navigate(ROUTES.documents)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Document Vault</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-ink-500 font-mono">
                    <span>Vault Ref: <strong className="text-ink-900">{document.id}</strong></span>
                </div>
            </div>

            {/* Main Title & Scope Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-ink-900 bg-ink-100 px-2.5 py-0.5 rounded border border-ink-200">
                            {document.documentNumber ?? document.id}
                        </span>
                        <StatusBadge status={document.verificationStatus} type="document" />
                        <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[11px] font-bold text-terracotta-800 border border-terracotta-200">
                            {document.category.replace(/_/g, ' ')}
                        </span>
                        <span className="rounded bg-ink-100 px-2 py-0.5 text-[11px] font-mono font-bold text-ink-900 border border-ink-200">
                            v{document.version} (Active)
                        </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
                        {document.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-ink-600">
                        <span className="flex items-center gap-1 font-mono text-ink-900 font-semibold">
                            <FileText className="h-3.5 w-3.5 text-terracotta-600" />
                            <span>{document.fileName} ({formatFileSize(document.fileSizeKb)})</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-ink-500" />
                            <span>Uploaded by {document.uploadedBy}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-ink-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Uploaded: {formatDate(document.uploadedAt)}</span>
                        </span>
                    </div>
                </div>

                {/* Module Action Shortcuts */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.projectDetail(document.projectId))}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <Landmark className="h-3.5 w-3.5 text-ink-600" />
                        <span>Scheme: {document.projectId}</span>
                    </Button>

                    {document.parcelId && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(ROUTES.parcelDetail(document.parcelId as string))}
                            className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/50"
                        >
                            <Layers className="h-3.5 w-3.5 text-terracotta-600" />
                            <span>Plot: {document.surveyNumber ?? document.parcelId}</span>
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.gis)}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <Map className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>GIS Map</span>
                    </Button>

                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => alert(`Simulated secure statutory download for ${document.fileName}. Future release will fetch presigned MinIO/S3 URL.`)}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Original</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
