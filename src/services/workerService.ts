import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Worker, WorkerInsert, WorkerUpdate } from '@/types/database'

export class WorkerService {
  private static throwIfNotConfigured() {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }
  }
  // Get all workers
  static async getAllWorkers(): Promise<Worker[]> {
    WorkerService.throwIfNotConfigured()
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching workers:', error)
      throw new Error(`Failed to fetch workers: ${error.message}`)
    }

    return data || []
  }

  // Get worker by ID
  static async getWorkerById(workerId: string): Promise<Worker | null> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('worker_id', workerId)
      .single()

    if (error) {
      console.error('Error fetching worker:', error)
      if (error.code === 'PGRST116') {
        return null // Worker not found
      }
      throw new Error(`Failed to fetch worker: ${error.message}`)
    }

    return data
  }

  // Create new worker
  static async createWorker(worker: WorkerInsert): Promise<Worker> {
    const { data, error } = await supabase
      .from('workers')
      .insert(worker)
      .select()
      .single()

    if (error) {
      console.error('Error creating worker:', error)
      throw new Error(`Failed to create worker: ${error.message}`)
    }

    return data
  }

  // Update worker
  static async updateWorker(workerId: string, updates: WorkerUpdate): Promise<Worker> {
    const { data, error } = await supabase
      .from('workers')
      .update(updates)
      .eq('worker_id', workerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating worker:', error)
      throw new Error(`Failed to update worker: ${error.message}`)
    }

    return data
  }

  // Delete worker
  static async deleteWorker(workerId: string): Promise<void> {
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('worker_id', workerId)

    if (error) {
      console.error('Error deleting worker:', error)
      throw new Error(`Failed to delete worker: ${error.message}`)
    }
  }

  // Get workers with high performance scores
  static async getTopPerformers(limit: number = 10): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('performance_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top performers:', error)
      throw new Error(`Failed to fetch top performers: ${error.message}`)
    }

    return data || []
  }

  // Get workers by skill
  static async getWorkersBySkill(skillColumn: string, minScore: number = 0.7): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .gte(skillColumn, minScore)
      .order(skillColumn, { ascending: false })

    if (error) {
      console.error('Error fetching workers by skill:', error)
      throw new Error(`Failed to fetch workers by skill: ${error.message}`)
    }

    return data || []
  }

  // Get workers by shift preference
  static async getWorkersByShift(shift: string): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('preferred_shift', shift)
      .order('performance_score', { ascending: false })

    if (error) {
      console.error('Error fetching workers by shift:', error)
      throw new Error(`Failed to fetch workers by shift: ${error.message}`)
    }

    return data || []
  }

  // Get workers needing training
  static async getWorkersNeedingTraining(): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .in('training_status', ['Needs Training', 'In Progress'])
      .order('performance_score', { ascending: true })

    if (error) {
      console.error('Error fetching workers needing training:', error)
      throw new Error(`Failed to fetch workers needing training: ${error.message}`)
    }

    return data || []
  }

  // Get analytics data for dashboard
  static async getAnalyticsData() {
    WorkerService.throwIfNotConfigured()
    try {
      // Get total workers
      const { count: totalWorkers } = await supabase
        .from('workers')
        .select('*', { count: 'exact', head: true })

      // Get average performance score
      const { data: avgPerformanceData } = await supabase
        .from('workers')
        .select('performance_score')
        .not('performance_score', 'is', null)

      const avgPerformance = avgPerformanceData?.length 
        ? (avgPerformanceData.reduce((sum, worker) => sum + (worker.performance_score || 0), 0) / avgPerformanceData.length) * 100
        : 0

      // Get workers by training status
      const { data: trainingStatusData } = await supabase
        .from('workers')
        .select('training_status')
        .not('training_status', 'is', null)

      const trainingStatusCounts = trainingStatusData?.reduce((acc, worker) => {
        const status = worker.training_status || 'Unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Get skill distribution
      const { data: skillData } = await supabase
        .from('workers')
        .select('skill_engine_assembly, skill_painting_finishing, skill_ev_battery_assembly, skill_ckd_kitting, skill_quality_inspection')

      const skillAverages = {
        engineAssembly: 0,
        paintingFinishing: 0,
        evBatteryAssembly: 0,
        ckdKitting: 0,
        qualityInspection: 0
      }

      if (skillData?.length) {
        skillData.forEach(worker => {
          skillAverages.engineAssembly += worker.skill_engine_assembly || 0
          skillAverages.paintingFinishing += worker.skill_painting_finishing || 0
          skillAverages.evBatteryAssembly += worker.skill_ev_battery_assembly || 0
          skillAverages.ckdKitting += worker.skill_ckd_kitting || 0
          skillAverages.qualityInspection += worker.skill_quality_inspection || 0
        })

        const count = skillData.length
        skillAverages.engineAssembly /= count
        skillAverages.paintingFinishing /= count
        skillAverages.evBatteryAssembly /= count
        skillAverages.ckdKitting /= count
        skillAverages.qualityInspection /= count
      }

      return {
        totalWorkers: totalWorkers || 0,
        avgPerformance: Math.round(avgPerformance),
        trainingStatusCounts,
        skillAverages
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      throw new Error('Failed to fetch analytics data')
    }
  }
}
