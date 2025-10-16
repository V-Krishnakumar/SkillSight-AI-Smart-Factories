import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AssignmentService } from '@/services/assignmentService'
import { AutomatedAssignmentService } from '@/services/automatedAssignmentService'
import { Assignment, AssignmentInsert, AssignmentUpdate } from '@/types/database'

// Query keys
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters: string) => [...assignmentKeys.lists(), { filters }] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
  byWorker: (workerId: string) => [...assignmentKeys.all, 'byWorker', workerId] as const,
  byTask: (taskName: string) => [...assignmentKeys.all, 'byTask', taskName] as const,
  current: (workerId: string) => [...assignmentKeys.all, 'current', workerId] as const,
  stats: () => [...assignmentKeys.all, 'stats'] as const,
  overview: () => [...assignmentKeys.all, 'overview'] as const,
}

// Hooks for fetching data
export function useAssignments() {
  return useQuery({
    queryKey: assignmentKeys.lists(),
    queryFn: AssignmentService.getAllAssignments,
  })
}

export function useAssignment(assignmentId: string) {
  return useQuery({
    queryKey: assignmentKeys.detail(assignmentId),
    queryFn: () => AssignmentService.getAllAssignments().then(assignments => 
      assignments.find(a => a.id === assignmentId) || null
    ),
    enabled: !!assignmentId,
  })
}

export function useAssignmentsByWorker(workerId: string) {
  return useQuery({
    queryKey: assignmentKeys.byWorker(workerId),
    queryFn: () => AssignmentService.getAssignmentsByWorker(workerId),
    enabled: !!workerId,
  })
}

export function useCurrentAssignment(workerId: string) {
  return useQuery({
    queryKey: assignmentKeys.current(workerId),
    queryFn: () => AssignmentService.getCurrentAssignment(workerId),
    enabled: !!workerId,
  })
}

export function useAssignmentsByTask(taskName: string) {
  return useQuery({
    queryKey: assignmentKeys.byTask(taskName),
    queryFn: () => AssignmentService.getAssignmentsByTask(taskName),
    enabled: !!taskName,
  })
}

export function useAssignmentStats() {
  return useQuery({
    queryKey: assignmentKeys.stats(),
    queryFn: AssignmentService.getAssignmentStats,
  })
}

export function useAssignmentOverview() {
  return useQuery({
    queryKey: assignmentKeys.overview(),
    queryFn: AutomatedAssignmentService.getAssignmentOverview,
  })
}

// Mutation hooks for data modification
export function useCreateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignment: AssignmentInsert) => AssignmentService.createAssignment(assignment),
    onSuccess: () => {
      // Invalidate and refetch assignments
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.overview() })
    },
  })
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, updates }: { assignmentId: string; updates: AssignmentUpdate }) =>
      AssignmentService.updateAssignment(assignmentId, updates),
    onSuccess: (data, { assignmentId }) => {
      // Update the specific assignment in cache
      queryClient.setQueryData(assignmentKeys.detail(assignmentId), data)
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.overview() })
    },
  })
}

export function useStartAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignmentId: string) => AssignmentService.startAssignment(assignmentId),
    onSuccess: (data, assignmentId) => {
      // Update the specific assignment in cache
      queryClient.setQueryData(assignmentKeys.detail(assignmentId), data)
      // Invalidate current assignment query for this worker
      queryClient.invalidateQueries({ queryKey: assignmentKeys.current(data.worker_id) })
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.overview() })
      // Also invalidate worker queries since their status will change
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['workers', data.worker_id] })
    },
  })
}

export function useCompleteAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, completionTime, qualityRating }: { 
      assignmentId: string; 
      completionTime?: number; 
      qualityRating?: number 
    }) => AssignmentService.completeAssignment(assignmentId, completionTime, qualityRating),
    onSuccess: (data, { assignmentId }) => {
      // Update the specific assignment in cache
      queryClient.setQueryData(assignmentKeys.detail(assignmentId), data)
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.overview() })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignmentId: string) => AssignmentService.deleteAssignment(assignmentId),
    onSuccess: (_, assignmentId) => {
      // Remove the assignment from cache
      queryClient.removeQueries({ queryKey: assignmentKeys.detail(assignmentId) })
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.overview() })
    },
  })
}

// Automated assignment hook
export function useAutomatedAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => AutomatedAssignmentService.performAutomatedAssignment(),
    onSuccess: () => {
      // Invalidate all assignment-related queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all })
      // Also invalidate worker queries since their statuses will change
      queryClient.invalidateQueries({ queryKey: ['workers'] })
    },
  })
}
