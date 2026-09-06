import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileQuestion } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-paper text-ink-900 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-600 mb-4 border border-ink-200">
                <FileQuestion className="h-8 w-8 text-terracotta-600" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">404 — Page Not Found</h1>
            <p className="mt-2 text-sm text-ink-500 max-w-md">
                The requested statutory resource, parcel URL, or portal path does not exist or has been moved.
            </p>
            <div className="mt-6">
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate(ROUTES.dashboard)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Return to Dashboard</span>
                </Button>
            </div>
        </div>
    )
}
