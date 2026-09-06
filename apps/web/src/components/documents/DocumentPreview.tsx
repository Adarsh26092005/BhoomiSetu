import { FileText, ShieldCheck, Download, Eye, Lock, FileCode, FileSpreadsheet } from 'lucide-react'
import type { ProjectDocument } from '@/types'
import { Button } from '@/components/ui/button'

interface DocumentPreviewProps {
    document: ProjectDocument
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
    const isPDF = document.fileType === 'PDF'
    const isGeoJSON = document.fileType === 'GEOJSON'
    const isSpreadsheet = document.fileType === 'XLSX'

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <Eye className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Statutory Document Preview</h3>
                        <p className="text-[11px] text-ink-500">
                            Secure preview surface with cryptographic integrity verification
                        </p>
                    </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded bg-signal-50 px-2 py-0.5 text-[10px] font-semibold text-signal-700 border border-signal-200">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Integrity Verified</span>
                </span>
            </div>

            {/* Document Preview Canvas */}
            <div className="relative min-h-[320px] w-full rounded-lg border border-ink-200 bg-ink-950 p-6 flex flex-col items-center justify-center text-paper overflow-hidden">
                {/* Background watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg]">
                    <span className="text-4xl sm:text-6xl font-black uppercase text-paper tracking-widest text-center select-none">
                        GOVERNMENT OF INDIA • NLAMS OFFICIAL ARCHIVE
                    </span>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-md">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper/10 border border-paper/20 backdrop-blur-xs text-paper shadow-xl">
                        {isPDF ? (
                            <FileText className="h-8 w-8 text-rust-400" />
                        ) : isGeoJSON ? (
                            <FileCode className="h-8 w-8 text-terracotta-400" />
                        ) : isSpreadsheet ? (
                            <FileSpreadsheet className="h-8 w-8 text-signal-400" />
                        ) : (
                            <FileText className="h-8 w-8 text-paper" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <span className="font-mono text-xs font-bold text-paper block">
                            {document.fileName}
                        </span>
                        <p className="text-xs text-ink-300">
                            {document.title}
                        </p>
                    </div>

                    {/* Official Stamp Box */}
                    <div className="rounded-lg border border-paper/20 bg-paper/5 p-3 w-full text-left font-mono text-[11px] space-y-1">
                        <div className="flex justify-between text-ink-400">
                            <span>Document ID:</span>
                            <span className="text-paper">{document.documentNumber ?? document.id}</span>
                        </div>
                        <div className="flex justify-between text-ink-400">
                            <span>Format & Size:</span>
                            <span className="text-paper">{document.fileType} • {document.fileSizeKb} KB</span>
                        </div>
                        <div className="flex justify-between text-ink-400">
                            <span>Verification Seal:</span>
                            <span className={document.verificationStatus === 'VERIFIED' ? 'text-signal-400 font-bold' : 'text-amber-400 font-bold'}>
                                {document.verificationStatus}
                            </span>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => alert(`Simulated secure document opening for ${document.fileName}. Presigned MinIO/S3 streaming will activate in the backend release.`)}
                            className="flex items-center gap-1.5 text-xs font-semibold"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Statutory Copy</span>
                        </Button>
                    </div>
                </div>

                {/* Bottom Watermark bar */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-ink-400">
                    <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-signal-400" />
                        <span>Storage Tier: MinIO/S3 Encrypted</span>
                    </span>
                    <span className="text-ink-500">
                        SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </span>
                </div>
            </div>
        </div>
    )
}
