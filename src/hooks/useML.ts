import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MLService, MLPredictionRequest } from '@/services/mlService'

// Query keys for ML predictions
export const mlKeys = {
  all: ['ml'] as const,
  predictions: () => [...mlKeys.all, 'predictions'] as const,
  bestWorker: (taskId: string) => [...mlKeys.predictions(), 'bestWorker', taskId] as const,
  skillGap: (workerId: string) => [...mlKeys.all, 'skillGap', workerId] as const,
  performance: (workerId: string, taskId: string) => [...mlKeys.all, 'performance', workerId, taskId] as const,
}

/**
 * Hook to get the best worker for a task using ML predictions
 */
export function useBestWorkerForTask(request: MLPredictionRequest) {
  return useMutation({
    mutationFn: (req: MLPredictionRequest) => MLService.getBestWorkerForTask(req),
    onSuccess: (data) => {
      console.log('ML prediction successful:', data)
    },
    onError: (error) => {
      console.error('ML prediction failed:', error)
    }
  })
}

/**
 * Hook to get skill gap analysis for a worker
 */
export function useSkillGapAnalysis(workerId: string, targetSkills: Record<string, number>) {
  return useQuery({
    queryKey: mlKeys.skillGap(workerId),
    queryFn: () => MLService.getSkillGapAnalysis(workerId, targetSkills),
    enabled: !!workerId && Object.keys(targetSkills).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to predict performance for a worker-task combination
 */
export function usePerformancePrediction(workerId: string, taskId: string, taskRequirements: any) {
  return useQuery({
    queryKey: mlKeys.performance(workerId, taskId),
    queryFn: () => MLService.predictPerformance(workerId, taskId, taskRequirements),
    enabled: !!workerId && !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook for AI-powered task assignment
 */
export function useAITaskAssignment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (request: MLPredictionRequest) => {
      const prediction = await MLService.getBestWorkerForTask(request)
      
      // You can add additional logic here to actually assign the task
      // For example, update the worker's assigned_task in Supabase
      
      return prediction
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: mlKeys.predictions() })
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      
      console.log(`Task assigned to worker ${data.bestWorkerId} with confidence ${data.confidence}`)
    },
    onError: (error) => {
      console.error('AI task assignment failed:', error)
    }
  })
}

/**
 * Hook for batch AI recommendations
 */
export function useBatchAIRecommendations(tasks: any[], workers: any[]) {
  return useMutation({
    mutationFn: async () => {
      const recommendations = []
      
      for (const task of tasks) {
        const request: MLPredictionRequest = {
          taskId: task.id,
          taskRequirements: {
            skill_engine_assembly: task.requiredSkills?.includes('Engine Assembly') ? 0.8 : 0,
            skill_painting_finishing: task.requiredSkills?.includes('Painting') ? 0.8 : 0,
            skill_ev_battery_assembly: task.requiredSkills?.includes('EV Battery') ? 0.9 : 0,
            skill_ckd_kitting: task.requiredSkills?.includes('CKD') ? 0.7 : 0,
            skill_quality_inspection: task.requiredSkills?.includes('Quality') ? 0.8 : 0,
            task_complexity: task.difficulty === 'Hard' ? 0.9 : task.difficulty === 'Medium' ? 0.6 : 0.3,
            duration_hours: this.parseDuration(task.duration)
          },
          availableWorkers: workers
        }
        
        const prediction = await MLService.getBestWorkerForTask(request)
        recommendations.push({
          taskId: task.id,
          taskName: task.name,
          ...prediction
        })
      }
      
      return recommendations
    },
    onError: (error) => {
      console.error('Batch AI recommendations failed:', error)
    }
  })
}

/**
 * Helper function to parse duration string to hours
 */
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)-(\d+)/)
  if (match) {
    return (parseInt(match[1]) + parseInt(match[2])) / 2
  }
  return 4 // Default 4 hours
}
