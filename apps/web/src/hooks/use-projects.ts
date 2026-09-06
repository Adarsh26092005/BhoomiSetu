import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/projects.service';
import type {
  CreateProjectPayload,
  ProjectQueryParams,
  UpdateProjectPayload,
  UpdateProjectStatusPayload,
} from '@/types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: ProjectQueryParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  kpis: () => [...projectKeys.all, 'kpis'] as const,
  summary: () => [...projectKeys.all, 'summary'] as const,
  activity: (id: string) => [...projectKeys.detail(id), 'activity'] as const,
  assignments: (id: string) => [...projectKeys.detail(id), 'assignments'] as const,
};

export function useProjects(params?: ProjectQueryParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsService.list(params),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: () => projectsService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useProjectKpis() {
  return useQuery({
    queryKey: projectKeys.kpis(),
    queryFn: () => projectsService.getKpiSummary(),
  });
}

export function useProjectSummaryMetrics() {
  return useQuery({
    queryKey: projectKeys.summary(),
    queryFn: () => projectsService.getSummaryMetrics(),
  });
}

export function useProjectActivity(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.activity(id ?? ''),
    queryFn: () => projectsService.getActivity(id as string),
    enabled: Boolean(id),
  });
}

export function useProjectAssignments(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.assignments(id ?? ''),
    queryFn: () => projectsService.getAssignments(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      projectsService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
    },
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectStatusPayload }) =>
      projectsService.updateStatus(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
    },
  });
}