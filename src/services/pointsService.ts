import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface PointsTransaction {
  id: string;
  worker_id: string;
  points_change: number;
  transaction_type: 'task_completion' | 'skill_improvement' | 'bonus' | 'penalty' | 'achievement' | 'daily_login';
  task_name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  worker_id: string;
  achievement_type: 'first_task' | 'task_streak' | 'skill_master' | 'speed_demon' | 'quality_expert' | 'team_player';
  achievement_name: string;
  description?: string;
  points_reward: number;
  earned_at: string;
  created_at: string;
}

export interface DailyStats {
  id: string;
  worker_id: string;
  date: string;
  tasks_completed: number;
  total_points_earned: number;
  average_task_time?: number;
  quality_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  worker_id: string;
  worker_name: string;
  total_points: number;
  tasks_completed_today: number;
  current_task?: string;
}

export class PointsService {
  private static throwIfNotConfigured() {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }
  }

  // Award points for task completion
  static async awardTaskCompletionPoints(
    workerId: string, 
    taskName: string, 
    difficulty: 'Easy' | 'Medium' | 'Hard',
    qualityRating: number = 4.0
  ): Promise<number> {
    PointsService.throwIfNotConfigured()
    
    try {
      console.log(`🎯 Awarding task completion points for ${workerId}: ${taskName} (${difficulty}, Quality: ${qualityRating})`)
      
      const { data, error } = await supabase.rpc('award_task_completion_points', {
        p_worker_id: workerId,
        p_task_name: taskName,
        p_difficulty: difficulty,
        p_quality_rating: qualityRating
      })

      if (error) {
        console.error('Error awarding task completion points:', error)
        throw new Error(`Failed to award points: ${error.message}`)
      }

      console.log(`✅ Awarded ${data} points to worker ${workerId}`)
      return data
    } catch (err) {
      console.error('Error in awardTaskCompletionPoints:', err)
      throw new Error(`Failed to award task completion points: ${err}`)
    }
  }

  // Get leaderboard
  static async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    PointsService.throwIfNotConfigured()
    
    try {
      console.log(`🏆 Fetching leaderboard (top ${limit})`)
      
      const { data, error } = await supabase.rpc('get_leaderboard', {
        limit_count: limit
      })

      if (error) {
        console.error('Error fetching leaderboard:', error)
        throw new Error(`Failed to fetch leaderboard: ${error.message}`)
      }

      console.log(`✅ Fetched leaderboard with ${data?.length || 0} entries`)
      return data || []
    } catch (err) {
      console.error('Error in getLeaderboard:', err)
      throw new Error(`Failed to fetch leaderboard: ${err}`)
    }
  }

  // Get worker's points transactions
  static async getWorkerPointsTransactions(workerId: string): Promise<PointsTransaction[]> {
    PointsService.throwIfNotConfigured()
    
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('worker_id', workerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching worker points transactions:', error)
        throw new Error(`Failed to fetch points transactions: ${error.message}`)
      }

      return data || []
    } catch (err) {
      console.error('Error in getWorkerPointsTransactions:', err)
      throw new Error(`Failed to fetch worker points transactions: ${err}`)
    }
  }

  // Get worker's achievements
  static async getWorkerAchievements(workerId: string): Promise<Achievement[]> {
    PointsService.throwIfNotConfigured()
    
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('worker_id', workerId)
        .order('earned_at', { ascending: false })

      if (error) {
        console.error('Error fetching worker achievements:', error)
        throw new Error(`Failed to fetch achievements: ${error.message}`)
      }

      return data || []
    } catch (err) {
      console.error('Error in getWorkerAchievements:', err)
      throw new Error(`Failed to fetch worker achievements: ${err}`)
    }
  }

  // Get daily stats for a worker
  static async getWorkerDailyStats(workerId: string, date?: string): Promise<DailyStats | null> {
    PointsService.throwIfNotConfigured()
    
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('worker_id', workerId)
        .eq('date', targetDate)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily stats:', error)
        throw new Error(`Failed to fetch daily stats: ${error.message}`)
      }

      return data || null
    } catch (err) {
      console.error('Error in getWorkerDailyStats:', err)
      throw new Error(`Failed to fetch daily stats: ${err}`)
    }
  }

  // Award bonus points
  static async awardBonusPoints(
    workerId: string, 
    points: number, 
    reason: string,
    transactionType: 'bonus' | 'achievement' = 'bonus'
  ): Promise<void> {
    PointsService.throwIfNotConfigured()
    
    try {
      console.log(`🎁 Awarding ${points} bonus points to ${workerId}: ${reason}`)
      
      const { error } = await supabase
        .from('points_transactions')
        .insert({
          worker_id: workerId,
          points_change: points,
          transaction_type: transactionType,
          description: reason
        })

      if (error) {
        console.error('Error awarding bonus points:', error)
        throw new Error(`Failed to award bonus points: ${error.message}`)
      }

      console.log(`✅ Awarded ${points} bonus points to worker ${workerId}`)
    } catch (err) {
      console.error('Error in awardBonusPoints:', err)
      throw new Error(`Failed to award bonus points: ${err}`)
    }
  }

  // Check and award achievements
  static async checkAndAwardAchievements(workerId: string): Promise<Achievement[]> {
    PointsService.throwIfNotConfigured()
    
    try {
      const newAchievements: Achievement[] = []
      
      // Get worker's current stats
      const dailyStats = await PointsService.getWorkerDailyStats(workerId)
      const pointsTransactions = await PointsService.getWorkerPointsTransactions(workerId)
      const existingAchievements = await PointsService.getWorkerAchievements(workerId)
      
      // Check for first task achievement
      const taskCompletions = pointsTransactions.filter(t => t.transaction_type === 'task_completion')
      const hasFirstTaskAchievement = existingAchievements.some(a => a.achievement_type === 'first_task')
      
      if (taskCompletions.length >= 1 && !hasFirstTaskAchievement) {
        await supabase.from('achievements').insert({
          worker_id: workerId,
          achievement_type: 'first_task',
          achievement_name: 'First Steps',
          description: 'Completed your first task!',
          points_reward: 50
        })
        
        await PointsService.awardBonusPoints(workerId, 50, 'Achievement: First Steps', 'achievement')
        newAchievements.push({
          id: '',
          worker_id: workerId,
          achievement_type: 'first_task',
          achievement_name: 'First Steps',
          description: 'Completed your first task!',
          points_reward: 50,
          earned_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
      }
      
      // Check for task streak achievement
      const hasStreakAchievement = existingAchievements.some(a => a.achievement_type === 'task_streak')
      if (dailyStats && dailyStats.tasks_completed >= 5 && !hasStreakAchievement) {
        await supabase.from('achievements').insert({
          worker_id: workerId,
          achievement_type: 'task_streak',
          achievement_name: 'Productivity Master',
          description: 'Completed 5 tasks in a single day!',
          points_reward: 200
        })
        
        await PointsService.awardBonusPoints(workerId, 200, 'Achievement: Productivity Master', 'achievement')
        newAchievements.push({
          id: '',
          worker_id: workerId,
          achievement_type: 'task_streak',
          achievement_name: 'Productivity Master',
          description: 'Completed 5 tasks in a single day!',
          points_reward: 200,
          earned_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
      }
      
      return newAchievements
    } catch (err) {
      console.error('Error in checkAndAwardAchievements:', err)
      return []
    }
  }
}
