import { Sparkles } from 'lucide-react'
import { ModulePlaceholder } from '@/pages/placeholder/ModulePlaceholder'

export function AiAssistantPage() {
    return (
        <ModulePlaceholder
            title="NLAMS AI Assistant & Predictive Intelligence"
            subtitle="Explainable AI delay prediction, document information extraction, and intelligent statutory workflow guidance."
            icon={Sparkles}
            badgeText="FastAPI ML Service"
            features={[
                'XGBoost acquisition delay probability forecasting based on historical district litigation and land type',
                'SHAP feature importance explanations highlighting primary risk factors (e.g. high parcel count, dense forest cover)',
                'Automated document extraction and OCR parsing for gazette notifications and sale deed title records',
                'Contextual conversational assistant guiding officers on LARR Act 2013 compliance and statutory clauses',
            ]}
        />
    )
}
