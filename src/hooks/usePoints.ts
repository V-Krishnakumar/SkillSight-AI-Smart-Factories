import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PointsService } from '@/services/pointsService'
import { PointsTransaction, Achievement, DailyStats, LeaderboardEntry } from '@/services/pointsService'

// Query keys
export const pointsKeys = {
  all: ['points'] as const,
  leaderboard: () => [...pointsKeys.all, 'leaderboard'] as const,
  leaderboardWithLimit: (limit: number) => [...pointsKeys.leaderboard(), limit] as const,
  workerTransactions: (workerId: string) => [...pointsKeys.all, 'transactions', workerId] as const,
  workerAchievements: (workerId: string) => [...pointsKeys.all, 'achievements', workerId] as const,
  workerDailyStats: (workerId: string, date?: string) => [...pointsKeys.all, 'dailyStats', workerId, date] as const,
}

// Hooks for fetching data
export function useLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: pointsKeys.leaderboardWithLimit(limit),
    queryFn: () => PointsService.getLeaderboard(limit),
  })
}

export function useWorkerPointsTransactions(workerId: string) {
  return useQuery({
    queryKey: pointsKeys.workerTransactions(workerId),
    queryFn: () => PointsService.getWorkerPointsTransactions(workerId),
    enabled: !!workerId,
  })
}

export function useWorkerAchievements(workerId: string) {
  return useQuery({
    queryKey: pointsKeys.workerAchievements(workerId),
    queryFn: () => PointsService.getWorkerAchievements(workerId),
    enabled: !!workerId,
  })
}

export function useWorkerDailyStats(workerId: string, date?: string) {
  return useQuery({
    queryKey: pointsKeys.workerDailyStats(workerId, date),
    queryFn: () => PointsService.getWorkerDailyStats(workerId, date),
    enabled: !!workerId,
  })
}

// Mutation hooks for data modification
export function useAwardTaskCompletionPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      workerId, 
      taskName, 
      difficulty, 
      qualityRating 
    }: { 
      workerId: string; 
      taskName: string; 
      difficulty: 'Easy' | 'Medium' | 'Hard'; 
      qualityRating?: number 
    }) => PointsService.awardTaskCompletionPoints(workerId, taskName, difficulty, qualityRating),
    onSuccess: (pointsAwarded, { workerId }) => {
      // Invalidate all points-related queries
      queryClient.invalidateQueries({ queryKey: pointsKeys.all })
      // Invalidate worker queries since their XP points will change
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['workers', workerId] })
      // Invalidate leaderboard
      queryClient.invalidateQueries({ queryKey: pointsKeys.leaderboard() })
    },
  })
}

export function useAwardBonusPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      workerId, 
      points, 
      reason, 
      transactionType 
    }: { 
      workerId: string; 
      points: number; 
      reason: string; 
      transactionType?: 'bonus' | 'achievement' 
    }) => PointsService.awardBonusPoints(workerId, points, reason, transactionType),
    onSuccess: (_, { workerId }) => {
      // Invalidate all points-related queries
      queryClient.invalidateQueries({ queryKey: pointsKeys.all })
      // Invalidate worker queries since their XP points will change
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['workers', workerId] })
      // Invalidate leaderboard
      queryClient.invalidateQueries({ queryKey: pointsKeys.leaderboard() })
    },
  })
}

export function useCheckAndAwardAchievements() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workerId: string) => PointsService.checkAndAwardAchievements(workerId),
    onSuccess: (newAchievements, workerId) => {
      // Invalidate all points-related queries
      queryClient.invalidateQueries({ queryKey: pointsKeys.all })
      // Invalidate worker queries since their XP points will change
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['workers', workerId] })
      // Invalidate leaderboard
      queryClient.invalidateQueries({ queryKey: pointsKeys.leaderboard() })
    },
  })
}
