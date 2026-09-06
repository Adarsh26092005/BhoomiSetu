import { Settings } from 'lucide-react'
import { ModulePlaceholder } from '@/pages/placeholder/ModulePlaceholder'

export function SettingsPage() {
    return (
        <ModulePlaceholder
            title="System Settings & Jurisdiction Preferences"
            subtitle="Configure organization profiles, officer designations, notification dispatch gateways, and integration endpoints."
            icon={Settings}
            badgeText="System Configuration"
            features={[
                'Officer profile and digital signature certificate (.pfx/.p12) management',
                'Jurisdiction boundary preferences (State, District, Taluk / Tahsil mapping)',
                'API gateway endpoints for NestJS backend and FastAPI ML microservice',
                'Display and language preferences (English, Hindi, and Regional State Languages)',
            ]}
        />
    )
}
