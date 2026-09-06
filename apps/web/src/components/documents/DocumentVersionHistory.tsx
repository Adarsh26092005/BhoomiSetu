import { History, CheckCircle2, FileText } from 'lucide-react'
import type { ProjectDocument } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'

interface DocumentVersionHistoryProps {
    document: ProjectDocument
}

export function DocumentVersionHistory({ document }: DocumentVersionHistoryProps) {
    const versions = document.versions && document.versions.length > 0
        ? document.versions
        : [
            {
                version: document.version,
                fileName: document.fileName,
                fileSizeKb: document.fileSizeKb,
                uploadedBy: document.uploadedBy,
                uploadedAt: document.uploadedAt,
                verificationStatus: document.verificationStatus,
                remarks: document.remarks || 'Current active version',
            },
        ]

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <History className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Document Version History</h3>
                        <p className="text-[11px] text-ink-500">Immutable chronological chain of statutory revisions</p>
                    </div>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {versions.length} {versions.length === 1 ? 'Version' : 'Versions'} Tracked
                </span>
            </div>

            <div className="space-y-3">
                {versions.map((ver) => {
                    const isCurrent = ver.version === document.version

                    return (
                        <div
                            key={ver.version}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors ${
                                isCurrent
                                    ? 'border-terracotta-300 bg-terracotta-50/40 shadow-xs'
                                    : 'border-ink-200 bg-ink-50/40'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-ink-900 bg-paper px-2 py-0.5 rounded border border-ink-200">
                                        Version {ver.version}
                                    </span>
                                    {isCurrent && (
                                        <span className="rounded bg-terracotta-600 px-1.5 py-0.2 text-[10px] font-bold text-paper uppercase">
                                            Current Active
                                        </span>
                                    )}
                                    <StatusBadge status={ver.verificationStatus} type="document" />
                                </div>

                                <div className="flex items-center gap-2 text-xs text-ink-700 font-medium">
                                    <FileText className="h-3.5 w-3.5 text-ink-500" />
                                    <span>{ver.fileName}</span>
                                    <span className="text-ink-400 font-mono text-[11px]">({ver.fileSizeKb} KB)</span>
                                </div>

                                <p className="text-[11px] text-ink-500">
                                    Uploaded by <strong>{ver.uploadedBy}</strong> on {formatDate(ver.uploadedAt)}
                                    {ver.remarks ? ` • "${ver.remarks}"` : ''}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                {isCurrent ? (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-signal-700">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Active Copy</span>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => alert(`Viewing archived version ${ver.version} metadata`)}
                                        className="text-xs font-semibold text-ink-600 hover:text-ink-900 underline"
                                    >
                                        Inspect v{ver.version}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
