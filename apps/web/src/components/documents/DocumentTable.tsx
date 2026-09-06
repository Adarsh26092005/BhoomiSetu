import { useNavigate } from 'react-router-dom'
import { ExternalLink, FileText, FileCode, FileSpreadsheet, FileArchive, File, RotateCcw, SearchX } from 'lucide-react'
import type { ProjectDocument } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface DocumentTableProps {
    documents: ProjectDocument[]
    onResetFilters?: () => void
    isFiltered?: boolean
}

export function DocumentTable({ documents, onResetFilters, isFiltered = false }: DocumentTableProps) {
    const navigate = useNavigate()

    const getFileIcon = (fileType: string) => {
        switch (fileType?.toUpperCase()) {
            case 'PDF':
                return <FileText className="h-4 w-4 text-rust-600" />
            case 'GEOJSON':
            case 'DWG':
                return <FileCode className="h-4 w-4 text-terracotta-600" />
            case 'XLSX':
                return <FileSpreadsheet className="h-4 w-4 text-signal-600" />
            case 'IMAGE':
                return <FileArchive className="h-4 w-4 text-ink-600" />
            default:
                return <File className="h-4 w-4 text-ink-500" />
        }
    }

    const formatFileSize = (kb: number) => {
        if (kb >= 1024) {
            return `${(kb / 1024).toFixed(1)} MB`
        }
        return `${kb} KB`
    }

    if (documents.length === 0) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
                    <SearchX className="h-7 w-7 text-terracotta-600" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink-900">No Statutory Documents Found</h3>
                    <p className="text-xs text-ink-500 max-w-sm mx-auto">
                        No official records match your applied search query or verification filter. Try modifying your search or clearing all filters.
                    </p>
                </div>
                {isFiltered && onResetFilters && (
                    <div className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onResetFilters}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset All Filters</span>
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-ink-200 bg-ink-50/70 text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                            <th scope="col" className="py-3.5 px-4">Document Title & Ref No.</th>
                            <th scope="col" className="py-3.5 px-4">Category</th>
                            <th scope="col" className="py-3.5 px-4">Scheme / Parcel</th>
                            <th scope="col" className="py-3.5 px-4">File Format</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Version</th>
                            <th scope="col" className="py-3.5 px-4">Uploaded By</th>
                            <th scope="col" className="py-3.5 px-4">Verification</th>
                            <th scope="col" className="py-3.5 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {documents.map((doc) => (
                            <tr
                                key={doc.id}
                                className="group hover:bg-ink-50/60 transition-colors cursor-pointer"
                                onClick={() => navigate(ROUTES.documentDetail(doc.id))}
                            >
                                {/* Title & Ref */}
                                <td className="py-3.5 px-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-ink-100 shrink-0">
                                                {getFileIcon(doc.fileType)}
                                            </div>
                                            <span className="font-semibold text-xs text-ink-900 group-hover:text-terracotta-700 transition-colors">
                                                {doc.title}
                                            </span>
                                        </div>
                                        <span className="font-mono text-[10px] text-ink-400 block pl-8">
                                            {doc.documentNumber ?? doc.id} • {doc.fileName}
                                        </span>
                                    </div>
                                </td>

                                {/* Category */}
                                <td className="py-3.5 px-4">
                                    <span className="rounded bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-800 border border-ink-200 whitespace-nowrap">
                                        {doc.category.replace(/_/g, ' ')}
                                    </span>
                                </td>

                                {/* Scheme / Parcel */}
                                <td className="py-3.5 px-4 text-ink-700 font-mono text-xs">
                                    <span className="font-bold text-ink-900 block">{doc.projectId}</span>
                                    <span className="text-[10px] text-ink-500 block">
                                        {doc.surveyNumber ?? (doc.parcelId ? `Plot: ${doc.parcelId}` : 'Scheme Level')}
                                    </span>
                                </td>

                                {/* Format & Size */}
                                <td className="py-3.5 px-4 text-ink-600">
                                    <span className="font-mono font-bold text-ink-900 block text-xs">{doc.fileType}</span>
                                    <span className="font-mono text-[10px] text-ink-400 block">
                                        {formatFileSize(doc.fileSizeKb)}
                                    </span>
                                </td>

                                {/* Version */}
                                <td className="py-3.5 px-4 text-center">
                                    <span className="rounded bg-ink-100 px-2 py-0.5 font-mono text-[11px] font-bold text-ink-800 border border-ink-200">
                                        v{doc.version}
                                    </span>
                                </td>

                                {/* Uploaded By & Date */}
                                <td className="py-3.5 px-4 text-ink-700">
                                    <span className="font-medium text-ink-900 block text-xs max-w-[160px] truncate" title={doc.uploadedBy}>
                                        {doc.uploadedBy}
                                    </span>
                                    <span className="font-mono text-[10px] text-ink-400 block">
                                        {formatDate(doc.uploadedAt)}
                                    </span>
                                </td>

                                {/* Verification Status */}
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={doc.verificationStatus} type="document" />
                                </td>

                                {/* Action */}
                                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(ROUTES.documentDetail(doc.id))}
                                        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-ink-800 bg-ink-100 hover:bg-ink-200 transition-colors"
                                        title={`Inspect document ${doc.documentNumber ?? doc.id}`}
                                    >
                                        <span>Inspect</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
