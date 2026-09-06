import * as React from 'react'
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import type { DocumentCategory } from '@/types'
import { useUploadDocumentMock } from '@/hooks/use-documents'
import { Button } from '@/components/ui/button'

interface DocumentUploadModalProps {
    isOpen: boolean
    onClose: () => void
    defaultProjectId?: string
    defaultParcelId?: string
    availableProjects: { id: string; code: string; title: string }[]
}

export function DocumentUploadModal({
    isOpen,
    onClose,
    defaultProjectId = 'prj-001',
    defaultParcelId = '',
    availableProjects,
}: DocumentUploadModalProps) {
    const { mutate: uploadDoc } = useUploadDocumentMock()
    const [title, setTitle] = React.useState('')
    const [category, setCategory] = React.useState<DocumentCategory>('GAZETTE_NOTIFICATION')
    const [projectId, setProjectId] = React.useState(defaultProjectId)
    const [parcelId, setParcelId] = React.useState(defaultParcelId)
    const [fileName, setFileName] = React.useState('')
    const [fileType, setFileType] = React.useState<'PDF' | 'GEOJSON' | 'XLSX' | 'IMAGE'>('PDF')
    const [remarks, setRemarks] = React.useState('')
    const [submitted, setSubmitted] = React.useState(false)

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        uploadDoc({
            title,
            category,
            projectId,
            parcelId: parcelId || undefined,
            fileName: fileName || `${title.replace(/\s+/g, '_')}.${fileType.toLowerCase()}`,
            fileType,
            fileSizeKb: Math.floor(500 + Math.random() * 3500),
            remarks,
        })
        setSubmitted(true)
        setTimeout(() => {
            setSubmitted(false)
            onClose()
        }, 1200)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
            <div className="relative w-full max-w-xl bg-paper rounded-xl border border-ink-200 shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 bg-ink-50/70">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-paper">
                            <Upload className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-ink-900">Upload Statutory Document</h2>
                            <p className="text-[11px] text-ink-500">Secure upload to central encrypted government archive</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        aria-label="Close dialog"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {submitted ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-signal-50 text-signal-700">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-ink-900">Document Uploaded Successfully</h3>
                        <p className="text-xs text-ink-500 max-w-sm mx-auto">
                            The statutory document has been cataloged and placed in "Pending Verification" queue.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                        <div className="rounded-lg border border-signal-200 bg-signal-50/60 p-3 text-signal-900 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-signal-700 shrink-0 mt-0.5" />
                            <span>
                                <strong>MinIO/S3 Storage Gateway:</strong> Direct presigned multipart upload supported. Digital hash and timestamp will be generated upon confirmation.
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-ink-800">Document Title / Subject</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Gazette Section 19 Declaration Order"
                                required
                                className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Document Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                                    className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                >
                                    <option value="GAZETTE_NOTIFICATION">Gazette Notification</option>
                                    <option value="TITLE_DOCUMENT">Title Deed / Pahani</option>
                                    <option value="SURVEY_RECORD">Survey Record / DGPS</option>
                                    <option value="AWARD_DOCUMENT">Statutory Award Order</option>
                                    <option value="COMPENSATION_DOCUMENT">Compensation Receipt</option>
                                    <option value="POSSESSION_DOCUMENT">Possession Certificate</option>
                                    <option value="OBJECTION_FILING">Section 15 Objection</option>
                                    <option value="PROJECT_PROPOSAL">Project Proposal & SIA</option>
                                    <option value="COURT_ORDER">Court Order / Stay</option>
                                    <option value="OTHER">Other Record</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Associated Scheme</label>
                                <select
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                >
                                    {availableProjects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.code} ({p.title.slice(0, 20)}...)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Cadastral Plot (Optional)</label>
                                <input
                                    type="text"
                                    value={parcelId}
                                    onChange={(e) => setParcelId(e.target.value)}
                                    placeholder="e.g. pcl-101 or Sy. No. 42/1"
                                    className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 font-mono focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Format</label>
                                <select
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value as any)}
                                    className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                >
                                    <option value="PDF">PDF (.pdf)</option>
                                    <option value="GEOJSON">GeoJSON (.geojson / .json)</option>
                                    <option value="XLSX">Spreadsheet (.xlsx / .csv)</option>
                                    <option value="IMAGE">Image (.png / .jpg)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-ink-800">Select File</label>
                            <input
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFileName(e.target.files[0].name)
                                    }
                                }}
                                className="block w-full text-xs text-ink-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-ink-100 file:text-ink-800 hover:file:bg-ink-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-ink-800">Upload Remarks / Note</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter reference details, gazette volume number, or verification notes..."
                                rows={2}
                                className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                            />
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="pt-3 border-t border-ink-200 flex items-center justify-end gap-2.5">
                            <Button type="button" variant="outline" size="sm" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
                                <FileText className="h-4 w-4" />
                                <span>Save & Upload Record</span>
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
