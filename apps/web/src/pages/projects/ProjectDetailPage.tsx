import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, FileQuestion, Loader2 } from 'lucide-react';
import { useProject } from '@/hooks/use-projects';
import { ProjectDetailHeader } from '@/components/projects/ProjectDetailHeader';
import { ProjectKpiSummary } from '@/components/projects/ProjectKpiSummary';
import { ProjectTimeline } from '@/components/projects/ProjectTimeline';
import { ProjectWorkflowCard } from '@/components/projects/ProjectWorkflowCard';
import { ProjectCompensationCard } from '@/components/projects/ProjectCompensationCard';
import { ProjectPossessionCard } from '@/components/projects/ProjectPossessionCard';
import { ProjectRAndRCard } from '@/components/projects/ProjectRAndRCard';
import { ProjectInfoCards } from '@/components/projects/ProjectInfoCards';
import { ProjectActivityStream } from '@/components/projects/ProjectActivityStream';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
        <p className="text-xs font-semibold">Loading Statutory Project Dossier...</p>
      </div>
    );
  }

  if (error) {
    const isForbidden = (error as any)?.response?.status === 403 || (error as any)?.status === 403;
    return (
      <div className="rounded-xl border border-rust-200 bg-paper p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rust-50 text-rust-600 border border-rust-200">
          <AlertTriangle className="h-7 w-7 text-rust-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-ink-900">
            {isForbidden ? 'Access Restricted' : 'Failed to Load Project'}
          </h2>
          <p className="text-xs text-ink-500">
            {isForbidden
              ? 'You do not have statutory permission to access this project dossier. It falls outside your authorized jurisdiction or implementing agency organization.'
              : (error as any)?.message || 'An unexpected error occurred while loading this project.'}
          </p>
        </div>
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.projects)}
            className="inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Projects Register</span>
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-xl border border-ink-200 bg-paper p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rust-50 text-rust-600 border border-rust-200">
          <FileQuestion className="h-7 w-7 text-rust-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-ink-900">Project Not Found</h2>
          <p className="text-xs text-ink-500">
            No statutory land acquisition scheme was found matching ID{' '}
            <strong className="font-mono text-ink-800">{id}</strong>.
          </p>
        </div>
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.projects)}
            className="inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Projects Register</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Detail Header & Navigation */}
      <ProjectDetailHeader project={project} />

      {/* 2. Scheme-Level KPI Summary */}
      <ProjectKpiSummary project={project} />

      {/* 3. Active Statutory Workflow Card */}
      <ProjectWorkflowCard projectId={project.id} />

      {/* 4. Scheme Compensation & Disbursement Card */}
      <ProjectCompensationCard projectId={project.id} />

      {/* 5. Scheme Possession & Handover Status Card */}
      <ProjectPossessionCard projectId={project.id} />

      {/* 6. Scheme Rehabilitation & Resettlement Card */}
      <ProjectRAndRCard projectId={project.id} />

      {/* 7. 17-Stage Statutory Lifecycle Timeline */}
      <ProjectTimeline project={project} />

      {/* 8. Structured Project Metadata Breakdown */}
      <ProjectInfoCards project={project} />

      {/* 9. Live Project Activity Stream & Alerts */}
      <ProjectActivityStream project={project} />
    </div>
  );
}
