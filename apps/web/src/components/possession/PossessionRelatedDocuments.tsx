import { useNavigate } from 'react-router-dom'
import { FileStack, ExternalLink, FileText, FileCode, FileSpreadsheet, File } from 'lucide-react'
import { useDocuments } from '@/hooks/use-documents'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'

interface PossessionRelatedDocumentsProps {
    projectId: string
    parcelId?: string
}

export function PossessionRelatedDocuments({ projectId, parcelId }: PossessionRelatedDocumentsProps) {
    const navigate = useNavigate()
    const { data: documents = [] } = useDocuments(projectId, parcelId)

    const getFileIcon = (fileType: string) => {
        switch (fileType?.toUpperCase()) {
            case 'PDF':
                return <FileText className="h-4 w-4 text-rust-600" />
            case 'GEOJSON':
            case 'DWG':
                return <FileCode className="h-4 w-4 text-terracotta-600" />
            case 'XLSX':
                return <FileSpreadsheet className="h-4 w-4 text-signal-600" />
            default:
                return <File className="h-4 w-4 text-ink-500" />
        }
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <FileStack className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Statutory Handover Records</h3>
                        <p className="text-[11px] text-ink-500">Supporting Form 21 notices, Form 22 certificates, and revenue maps</p>
                    </div>
                </div>

                <span className="font-mono text-xs text-ink-500">
                    {documents.length} Files Linked
                </span>
            </div>

            {documents.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-400 bg-ink-50 rounded-lg border border-ink-100">
                    No statutory documents found specifically linked to this parcel.
                </div>
            ) : (
                <div className="space-y-2.5">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            onClick={() => navigate(ROUTES.documentDetail(doc.id))}
                            className="group flex items-center justify-between gap-3 rounded-lg border border-ink-100 bg-ink-50/40 p-3 text-xs hover:bg-ink-100 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-paper border border-ink-200">
                                    {getFileIcon(doc.fileType)}
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <span className="font-semibold text-ink-900 group-hover:text-terracotta-700 transition-colors block truncate">
                                        {doc.title}
                                    </span>
                                    <span className="font-mono text-[10px] text-ink-400 block truncate">
                                        {doc.documentNumber ?? doc.id} • {doc.category.replace(/_/g, ' ')} • {formatDate(doc.uploadedAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <StatusBadge status={doc.verificationStatus} type="document" />
                                <ExternalLink className="h-3.5 w-3.5 text-ink-400 group-hover:text-ink-700" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
