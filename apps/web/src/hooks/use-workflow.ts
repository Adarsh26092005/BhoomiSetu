import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workflowService } from '@/services/workflow.service'
import type { UserRole, OrganizationType } from '@/types'

export const workflowKeys = {
    all: ['workflow'] as const,
    list: (projectId?: string) => ['workflow', 'list', projectId ?? 'all'] as const,
    detail: (id: string) => ['workflow', id] as const,
    byProject: (projectId: string) => ['workflow', 'project', projectId] as const,
}

export function useWorkflowTasks(projectId?: string) {
    return useQuery({
        queryKey: workflowKeys.list(projectId),
        queryFn: () => workflowService.list(projectId),
    })
}

export function useWorkflowTask(id: string | undefined) {
    return useQuery({
        queryKey: workflowKeys.detail(id ?? ''),
        queryFn: () => workflowService.getById(id as string),
        enabled: Boolean(id),
    })
}

export function useWorkflowByProject(projectId: string | undefined) {
    return useQuery({
        queryKey: workflowKeys.byProject(projectId ?? ''),
        queryFn: () => workflowService.getByProjectId(projectId as string),
        enabled: Boolean(projectId),
    })
}

export function useApproveWorkflow() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
            workflowService.approve(id, remarks),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.all })
            queryClient.setQueryData(workflowKeys.detail(updated.id), updated)
        },
    })
}

export function useRejectWorkflow() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
            workflowService.reject(id, remarks),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.all })
            queryClient.setQueryData(workflowKeys.detail(updated.id), updated)
        },
    })
}

export function usePutWorkflowOnHold() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
            workflowService.putOnHold(id, remarks),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.all })
            queryClient.setQueryData(workflowKeys.detail(updated.id), updated)
        },
    })
}

export function useReassignWorkflow() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            newOfficer,
            newRole,
            newOrg,
            remarks,
        }: {
            id: string
            newOfficer: string
            newRole: UserRole
            newOrg: OrganizationType | string
            remarks?: string
        }) => workflowService.reassign(id, newOfficer, newRole, newOrg, remarks),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.all })
            queryClient.setQueryData(workflowKeys.detail(updated.id), updated)
        },
    })
}

export function useAddWorkflowComment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, comment }: { id: string; comment: string }) =>
            workflowService.addComment(id, comment),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: workflowKeys.all })
            queryClient.setQueryData(workflowKeys.detail(updated.id), updated)
        },
    })
}
