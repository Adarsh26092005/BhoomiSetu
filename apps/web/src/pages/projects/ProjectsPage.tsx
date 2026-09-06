import * as React from 'react';
import { CheckCircle2, Clock, Landmark, Layers, Loader2, Plus } from 'lucide-react';
import { useProjects, useProjectSummaryMetrics } from '@/hooks/use-projects';
import { ProjectFilters, type ProjectFilterValues } from '@/components/projects/ProjectFilters';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { NewProjectModal } from '@/components/projects/NewProjectModal';
import { Button } from '@/components/ui/button';

export function ProjectsPage() {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = React.useState(false);

  const [filters, setFilters] = React.useState<ProjectFilterValues>({
    search: '',
    status: 'ALL',
    state: 'ALL',
    category: 'ALL',
  });

  const { data: projectsData, isLoading, error } = useProjects({
    search: filters.search || undefined,
    status: filters.status !== 'ALL' ? (filters.status as any) : undefined,
    category: filters.category !== 'ALL' ? (filters.category as any) : undefined,
    state: filters.state !== 'ALL' ? filters.state : undefined,
  });

  const { data: summaryMetrics } = useProjectSummaryMetrics();

  const projects = React.useMemo(() => projectsData?.items || [], [projectsData?.items]);

  // Extract available states dynamically
  const availableStates = React.useMemo(() => {
    const set = new Set(projects.map((p) => p.state));
    return Array.from(set).sort();
  }, [projects]);

  const totalCount = summaryMetrics?.totalProjects ?? projectsData?.total ?? projects.length;
  const activeCount = summaryMetrics?.inStatutoryProcess ?? projects.filter((p) => p.status !== 'COMPLETED' && p.status !== 'REJECTED').length;
  const completedCount = summaryMetrics?.completedHandover ?? projects.filter((p) => p.status === 'COMPLETED').length;

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-ink-600">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta-600" />
        <p className="text-xs font-semibold">Loading National Projects Register...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rust-200 bg-rust-50 p-6 text-center text-xs text-rust-900 space-y-2 my-8">
        <p className="font-bold">Failed to load National Projects Register</p>
        <p>{(error as any)?.message || 'Please check your connection and credentials.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper">
                <Landmark className="h-4 w-4" />
              </div>
              <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-200 uppercase tracking-wider">
                STATUTORY PROJECT REPOSITORY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
              Projects Register
            </h1>
            <p className="text-xs text-ink-500 max-w-2xl">
              National statutory register of land acquisition projects and real-time lifecycle tracking under the RFCTLARR Act 2013.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Project</span>
            </Button>
          </div>
        </div>

        {/* Scope Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-ink-200">
            <Layers className="h-3.5 w-3.5 text-ink-600" />
            <span>Total Projects: {totalCount}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
            <Clock className="h-3.5 w-3.5 text-amber-700" />
            <span>In Statutory Process: {activeCount}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-semibold text-signal-900 border border-signal-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-signal-700" />
            <span>Completed Handover: {completedCount}</span>
          </span>
        </div>
      </div>

      {/* 2. Interactive Search & Filters */}
      <ProjectFilters
        filters={filters}
        onFilterChange={setFilters}
        availableStates={availableStates}
        totalResults={projects.length}
        totalProjects={totalCount}
      />

      {/* 3. Projects Register Table */}
      <ProjectTable
        projects={projects}
        onResetFilters={() =>
          setFilters({ search: '', status: 'ALL', state: 'ALL', category: 'ALL' })
        }
        isFiltered={
          Boolean(filters.search) ||
          filters.status !== 'ALL' ||
          filters.state !== 'ALL' ||
          filters.category !== 'ALL'
        }
      />

      {/* 4. New Project Draft Initiation Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
}
