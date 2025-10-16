import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { WorkerService } from '@/services/workerService'
import { Worker, WorkerInsert, WorkerUpdate } from '@/types/database'

// Query keys
export const workerKeys = {
  all: ['workers'] as const,
  lists: () => [...workerKeys.all, 'list'] as const,
  list: (filters: string) => [...workerKeys.lists(), { filters }] as const,
  details: () => [...workerKeys.all, 'detail'] as const,
  detail: (id: string) => [...workerKeys.details(), id] as const,
  analytics: () => [...workerKeys.all, 'analytics'] as const,
  topPerformers: () => [...workerKeys.all, 'topPerformers'] as const,
  bySkill: (skill: string, minScore: number) => [...workerKeys.all, 'bySkill', skill, minScore] as const,
  byShift: (shift: string) => [...workerKeys.all, 'byShift', shift] as const,
  needingTraining: () => [...workerKeys.all, 'needingTraining'] as const,
}

// Hooks for fetching data
export function useWorkers() {
  return useQuery({
    queryKey: workerKeys.lists(),
    queryFn: WorkerService.getAllWorkers,
  })
}

export function useWorker(workerId: string) {
  return useQuery({
    queryKey: workerKeys.detail(workerId),
    queryFn: () => WorkerService.getWorkerById(workerId),
    enabled: !!workerId,
  })
}

export function useAnalyticsData() {
  return useQuery({
    queryKey: workerKeys.analytics(),
    queryFn: WorkerService.getAnalyticsData,
  })
}

export function useTopPerformers(limit: number = 10) {
  return useQuery({
    queryKey: workerKeys.topPerformers(),
    queryFn: () => WorkerService.getTopPerformers(limit),
  })
}

export function useWorkersBySkill(skillColumn: string, minScore: number = 0.7) {
  return useQuery({
    queryKey: workerKeys.bySkill(skillColumn, minScore),
    queryFn: () => WorkerService.getWorkersBySkill(skillColumn, minScore),
    enabled: !!skillColumn,
  })
}

export function useWorkersByShift(shift: string) {
  return useQuery({
    queryKey: workerKeys.byShift(shift),
    queryFn: () => WorkerService.getWorkersByShift(shift),
    enabled: !!shift,
  })
}

export function useWorkersNeedingTraining() {
  return useQuery({
    queryKey: workerKeys.needingTraining(),
    queryFn: WorkerService.getWorkersNeedingTraining,
  })
}

// Mutation hooks for data modification
export function useCreateWorker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (worker: WorkerInsert) => WorkerService.createWorker(worker),
    onSuccess: () => {
      // Invalidate and refetch workers list
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workerKeys.analytics() })
    },
  })
}

export function useUpdateWorker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workerId, updates }: { workerId: string; updates: WorkerUpdate }) =>
      WorkerService.updateWorker(workerId, updates),
    onSuccess: (data, { workerId }) => {
      // Update the specific worker in cache
      queryClient.setQueryData(workerKeys.detail(workerId), data)
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workerKeys.analytics() })
    },
  })
}

export function useDeleteWorker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workerId: string) => WorkerService.deleteWorker(workerId),
    onSuccess: (_, workerId) => {
      // Remove the worker from cache
      queryClient.removeQueries({ queryKey: workerKeys.detail(workerId) })
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workerKeys.analytics() })
    },
  })
}
