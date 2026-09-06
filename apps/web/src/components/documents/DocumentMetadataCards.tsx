import { Building, FileCode, FileText, Lock, ShieldCheck, UserCheck } from 'lucide-react'
import type { ProjectDocument } from '@/types'
import { formatDate } from '@/lib/format'
import { StatusBadge } from '@/components/common/StatusBadge'

interface DocumentMetadataCardsProps {
    document: ProjectDocument
}

export function DocumentMetadataCards({ document }: DocumentMetadataCardsProps) {
    const formatFileSize = (kb: number) => {
        if (kb >= 1024) {
            return `${(kb / 1024).toFixed(1)} MB (${kb.toLocaleString()} KB)`
        }
        return `${kb} KB`
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Document Identity */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <FileText className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Statutory Document Identity
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Gazette / Reference No.</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {document.documentNumber ?? document.id}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Document Category</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{document.category.replace(/_/g, ' ')}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Verification Status</dt>
                        <dd className="mt-1">
                            <StatusBadge status={document.verificationStatus} type="document" />
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Security Classification</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5 flex items-center gap-1">
                            <Lock className="h-3 w-3 text-signal-600" />
                            <span>Statutory Protected Record</span>
                        </dd>
                    </div>
                </dl>
            </div>

            {/* 2. File & Storage Architecture */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <FileCode className="h-4 w-4 text-signal-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        File & Object Storage Profile
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div className="sm:col-span-2">
                        <dt className="text-ink-400 font-medium text-[11px]">File Name</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">{document.fileName}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">MIME / File Format</dt>
                        <dd className="font-mono font-semibold text-ink-900 mt-0.5">{document.fileType}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">File Size</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {formatFileSize(document.fileSizeKb)}
                        </dd>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-signal-600" />
                            <span>Storage Tier: S3/MinIO Encrypted Vault</span>
                        </span>
                        <span className="font-mono text-signal-700 font-semibold">SHA-256 Verified</span>
                    </div>
                </dl>
            </div>

            {/* 3. Custody & Officer Audit */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <UserCheck className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Officer Custody & Verification Log
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Submitted By</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">{document.uploadedBy}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Uploaded Timestamp</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {formatDate(document.uploadedAt)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Verified Officer</dt>
                        <dd className="font-semibold text-ink-900 mt-0.5">
                            {document.verifiedBy ?? 'Verification Pending'}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Verification Date</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">
                            {document.verifiedAt ? formatDate(document.verifiedAt) : 'Pending'}
                        </dd>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                        <span>Statutory Seal: {document.verificationStatus === 'VERIFIED' ? 'Affixed' : 'Pending'}</span>
                        <span className="font-mono text-ink-700 font-semibold">Digital Sign-Off</span>
                    </div>
                </dl>
            </div>

            {/* 4. Scheme & Cadastral Association */}
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Building className="h-4 w-4 text-ink-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Scheme & Cadastral Linkage
                    </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Acquisition Scheme ID</dt>
                        <dd className="font-mono font-bold text-ink-900 text-xs mt-0.5">{document.projectId}</dd>
                    </div>

                    <div>
                        <dt className="text-ink-400 font-medium text-[11px]">Cadastral Survey Plot</dt>
                        <dd className="font-mono font-semibold text-ink-900 mt-0.5">
                            {document.surveyNumber ?? (document.parcelId ? `Plot: ${document.parcelId}` : 'Project Wide')}
                        </dd>
                    </div>

                    <div className="sm:col-span-2">
                        <dt className="text-ink-400 font-medium text-[11px]">Officer Scrutiny Remarks</dt>
                        <dd className="font-medium text-ink-800 text-xs mt-0.5 bg-ink-50 p-2 rounded border border-ink-200">
                            {document.remarks || 'No remarks recorded.'}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    )
}
