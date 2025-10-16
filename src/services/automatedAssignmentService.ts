import { Worker, Assignment } from '@/types/database'
import { AssignmentInsert } from '@/types/database'
import { TASK_DEFINITIONS } from '@/data/taskDefinitions'
import { AssignmentService } from '@/services/assignmentService'
import { WorkerService } from '@/services/workerService'

export interface AssignmentResult {
  workerId: string;
  taskName: string;
  skillMatchPct: number;
  confidenceScore: number;
  reasoning: string;
  success: boolean;
  error?: string;
}

export interface AutomatedAssignmentResult {
  assignments: AssignmentResult[];
  testingWorkers: Worker[];
  summary: {
    totalWorkers: number;
    assignedWorkers: number;
    testingWorkers: number;
    taskDistribution: Record<string, number>;
    avgSkillMatch: number;
    avgConfidence: number;
  };
}

export class AutomatedAssignmentService {
  private static readonly WORKERS_PER_TASK = 20;
  private static readonly TOTAL_TASKS = 5;

  /**
   * SMART ASSIGNMENT: Find top 20 workers for each task, handle conflicts intelligently
   */
  static async performAutomatedAssignment(): Promise<AutomatedAssignmentResult> {
    const startTime = Date.now()
    try {
      console.log('🎯 Starting SMART assignment process...')
      console.log('🔍 ALGORITHM VERSION: SMART v1.0')

      // 1. Get all workers
      const allWorkers = await WorkerService.getAllWorkers()
      console.log(`📊 Total workers in database: ${allWorkers.length}`)

      // 2. Filter active workers (exclude those in testing period)
      const activeWorkers = allWorkers.filter(worker => 
        worker.training_status !== "Pending" && worker.training_status !== "Under Review" && worker.training_status !== "In Testing"
      )
      const testingWorkers = allWorkers.filter(worker => 
        worker.training_status === "Pending" || worker.training_status === "Under Review" || worker.training_status === "In Testing"
      )

      console.log(`👷 Active workers: ${activeWorkers.length}`)
      console.log(`🧪 Testing workers: ${testingWorkers.length}`)

      // 3. Clear existing assignments for ACTIVE workers only
      console.log('🧹 Clearing existing assignments for active workers...')
      await AutomatedAssignmentService.clearAllAssignments(activeWorkers)

      // 4. SMART ASSIGNMENT: Calculate scores for all worker-task combinations
      console.log('🧠 Calculating skill scores for all worker-task combinations...')
      
      const workerTaskScores: Array<{
        worker: Worker;
        task: any;
        score: number;
        skillMatch: number;
      }> = []

      // Calculate scores for every worker-task combination
      for (const worker of activeWorkers) {
        for (const task of TASK_DEFINITIONS) {
          const skillMatch = AutomatedAssignmentService.calculateSkillMatch(worker, task)
          const score = AutomatedAssignmentService.calculateWorkerScore(worker, task)
          
          workerTaskScores.push({
            worker,
            task,
            score,
            skillMatch
          })
        }
      }

      console.log(`📊 Calculated ${workerTaskScores.length} worker-task combinations`)

      // 5. Sort by score and assign workers to their BEST tasks
      console.log('🎯 Assigning workers to their best tasks...')
      
      const assignments: AssignmentResult[] = []
      const taskDistribution: Record<string, number> = {}
      const assignedWorkerIds = new Set<string>()
      
      // Sort all combinations by score (highest first)
      workerTaskScores.sort((a, b) => b.score - a.score)
      
      // Initialize task counts
      for (const task of TASK_DEFINITIONS) {
        taskDistribution[task.name] = 0
      }

      // Assign workers to their best available tasks
      for (const { worker, task, score, skillMatch } of workerTaskScores) {
        // Skip if worker already assigned
        if (assignedWorkerIds.has(worker.worker_id)) {
          continue
        }
        
        // Skip if task already has 20 workers
        if (taskDistribution[task.name] >= 20) {
          continue
        }

        // Assign this worker to this task
        const assignment: AssignmentResult = {
          workerId: worker.worker_id,
          taskName: task.name,
          skillMatchPct: skillMatch,
          confidenceScore: Math.min(score / 100, 0.95),
          reasoning: `Assigned to best task based on skill match (${skillMatch}%) and overall score (${Math.round(score)})`,
          success: true
        }

        assignments.push(assignment)
        assignedWorkerIds.add(worker.worker_id)
        taskDistribution[task.name]++
        
        console.log(`✅ Assigned ${worker.name} to ${task.name} (Score: ${Math.round(score)}, Skill Match: ${skillMatch}%)`)
      }

      // 6. Update worker records in Supabase (only active workers)
      console.log('🔄 Updating worker records...')
      await AutomatedAssignmentService.updateWorkerRecords(assignments)
      
      // DEBUG: Check if updates actually worked
      console.log('🔍 DEBUG: Checking if database updates worked...')
      const debugWorkers = await WorkerService.getAllWorkers()
      const debugTaskCounts: Record<string, number> = {}
      
      for (const task of TASK_DEFINITIONS) {
        const count = debugWorkers.filter(w => w.assigned_task === task.name).length
        debugTaskCounts[task.name] = count
        console.log(`🔍 DEBUG: ${task.name} has ${count} workers in database`)
      }
      
      const totalAssigned = debugWorkers.filter(w => w.assigned_task).length
      console.log(`🔍 DEBUG: Total assigned workers in database: ${totalAssigned}`)
      
      if (totalAssigned !== assignments.length) {
        console.error(`❌ DATABASE UPDATE FAILED: Expected ${assignments.length}, got ${totalAssigned}`)
      } else {
        console.log(`✅ DATABASE UPDATE SUCCESS: All ${assignments.length} assignments saved`)
      }

      // 7. Create assignment records
      console.log('📝 Creating assignment records...')
      await AutomatedAssignmentService.createAssignmentRecords(assignments)

      // 8. Calculate summary
      const summary = {
        totalWorkers: allWorkers.length,
        assignedWorkers: assignments.length,
        testingWorkers: testingWorkers.length,
        taskDistribution,
        avgSkillMatch: assignments.reduce((sum, a) => sum + a.skillMatchPct, 0) / assignments.length,
        avgConfidence: assignments.reduce((sum, a) => sum + a.confidenceScore, 0) / assignments.length
      }

      const endTime = Date.now()
      const duration = endTime - startTime
      
      console.log('🎉 SMART assignment completed!')
      console.log(`📊 Task Distribution:`, taskDistribution)
      console.log(`👥 Total assigned: ${assignments.length} workers`)
      console.log(`🔒 Unique workers assigned: ${assignedWorkerIds.size}`)
      console.log(`⏱️ Total time: ${duration}ms`)

      return {
        assignments,
        testingWorkers,
        summary
      }

    } catch (error) {
      console.error('❌ Error in smart assignment:', error)
      throw new Error(`Smart assignment failed: ${error}`)
    }
  }

  /**
   * Calculate worker score based on skills and performance
   */
  private static calculateWorkerScore(worker: Worker, task: any): number {
    let score = 0
    const requirements = task.skillRequirements

    // Score based on skill matches (60% of total score)
    if (requirements.skill_engine_assembly && worker.skill_engine_assembly) {
      score += (worker.skill_engine_assembly / 100) * (requirements.skill_engine_assembly * 100) * 0.6
    }
    if (requirements.skill_painting_finishing && worker.skill_painting_finishing) {
      score += (worker.skill_painting_finishing / 100) * (requirements.skill_painting_finishing * 100) * 0.6
    }
    if (requirements.skill_ev_battery_assembly && worker.skill_ev_battery_assembly) {
      score += (worker.skill_ev_battery_assembly / 100) * (requirements.skill_ev_battery_assembly * 100) * 0.6
    }
    if (requirements.skill_ckd_kitting && worker.skill_ckd_kitting) {
      score += (worker.skill_ckd_kitting / 100) * (requirements.skill_ckd_kitting * 100) * 0.6
    }
    if (requirements.skill_quality_inspection && worker.skill_quality_inspection) {
      score += (worker.skill_quality_inspection / 100) * (requirements.skill_quality_inspection * 100) * 0.6
    }

    // Factor in performance score (25% of total score)
    if (worker.performance_score) {
      score += (worker.performance_score / 100) * 25
    }

    // Factor in experience (10% of total score)
    if (worker.years_experience) {
      score += Math.min(worker.years_experience * 1, 10) // Max 10 points for experience
    }

    // Factor in accuracy (5% of total score)
    if (worker.recent_accuracy_avg) {
      score += (worker.recent_accuracy_avg * 100) * 0.05
    }

    return Math.min(score, 100) // Cap at 100
  }

  /**
   * Calculate skill match percentage
   */
  private static calculateSkillMatch(worker: Worker, task: any): number {
    const requirements = task.skillRequirements
    let totalMatch = 0
    let skillCount = 0

    if (requirements.skill_engine_assembly && worker.skill_engine_assembly) {
      totalMatch += Math.min(worker.skill_engine_assembly, requirements.skill_engine_assembly * 100)
      skillCount++
    }
    if (requirements.skill_painting_finishing && worker.skill_painting_finishing) {
      totalMatch += Math.min(worker.skill_painting_finishing, requirements.skill_painting_finishing * 100)
      skillCount++
    }
    if (requirements.skill_ev_battery_assembly && worker.skill_ev_battery_assembly) {
      totalMatch += Math.min(worker.skill_ev_battery_assembly, requirements.skill_ev_battery_assembly * 100)
      skillCount++
    }
    if (requirements.skill_ckd_kitting && worker.skill_ckd_kitting) {
      totalMatch += Math.min(worker.skill_ckd_kitting, requirements.skill_ckd_kitting * 100)
      skillCount++
    }
    if (requirements.skill_quality_inspection && worker.skill_quality_inspection) {
      totalMatch += Math.min(worker.skill_quality_inspection, requirements.skill_quality_inspection * 100)
      skillCount++
    }

    return skillCount > 0 ? Math.round(totalMatch / skillCount) : 0
  }

  /**
   * CLEAN: Clear all existing assignments
   */

  /**
   * CLEAN: Clear all existing assignments
   */
  private static async clearAllAssignments(workers: Worker[]): Promise<void> {
    console.log(`🧹 Clearing assignments for ${workers.length} workers`)
    
    // Count workers with existing assignments
    const workersWithAssignments = workers.filter(w => w.assigned_task !== null)
    console.log(`📊 Workers with existing assignments: ${workersWithAssignments.length}`)
    
    // Clear assignments for active workers only
    for (const worker of workers) {
      // Only clear assignments for workers who should be available for assignment
      if (worker.training_status === "Completed") {
        await WorkerService.updateWorker(worker.worker_id, {
          assigned_task: null,
          current_assignment_status: 'Available',
          "Skill_Match_%": 0,
          "Absence_Rate_%": 0
        })
      }
    }
    console.log(`✅ Cleared all assignments`)
  }

  /**
   * CLEAN: Update worker records with new assignments
   */
  private static async updateWorkerRecords(assignments: AssignmentResult[]): Promise<void> {
    console.log(`🔄 Updating ${assignments.length} worker records`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const assignment of assignments) {
      try {
        await WorkerService.updateWorker(assignment.workerId, {
          assigned_task: assignment.taskName,
          current_assignment_status: 'Assigned',
          "Skill_Match_%": assignment.skillMatchPct,
          "Absence_Rate_%": 0
        })
        successCount++
        
        if (successCount % 10 === 0) {
          console.log(`🔄 Updated ${successCount}/${assignments.length} workers...`)
        }
      } catch (error) {
        errorCount++
        console.error(`❌ Failed to update worker ${assignment.workerId}:`, error)
      }
    }
    
    console.log(`✅ Updated ${successCount} worker records successfully`)
    if (errorCount > 0) {
      console.error(`❌ Failed to update ${errorCount} worker records`)
    }
  }

  /**
   * Create assignment records in Supabase
   */
  private static async createAssignmentRecords(assignments: AssignmentResult[]): Promise<void> {
    const assignmentDate = new Date().toISOString().split('T')[0]

    for (const assignment of assignments) {
      if (assignment.success) {
        const assignmentRecord: AssignmentInsert = {
          worker_id: assignment.workerId,
          task_name: assignment.taskName,
          skill_match_pct: assignment.skillMatchPct,
          assigned_date: assignmentDate,
          status: 'assigned',
          ml_confidence_score: assignment.confidenceScore,
          ml_reasoning: assignment.reasoning
        }

        await AssignmentService.createAssignment(assignmentRecord)
      }
    }
  }

  /**
   * Get assignment overview for manager dashboard
   */
  static async getAssignmentOverview() {
    try {
      const assignments = await AssignmentService.getAllAssignments()

      // Try to get stats, but don't fail if it doesn't work
      let stats = {
        totalAssignments: 0,
        statusCounts: {},
        avgSkillMatch: 0,
        taskCounts: {}
      }

      try {
        stats = await AssignmentService.getAssignmentStats()
      } catch (statsError) {
        console.warn('Could not fetch assignment stats:', statsError)
      }

      // Group assignments by task
      const assignmentsByTask: Record<string, Assignment[]> = {}
      for (const assignment of assignments) {
        if (!assignmentsByTask[assignment.task_name]) {
          assignmentsByTask[assignment.task_name] = []
        }
        assignmentsByTask[assignment.task_name].push(assignment)
      }

      return {
        assignments,
        assignmentsByTask,
        stats
      }
    } catch (error) {
      console.error('Error getting assignment overview:', error)
      // Return empty overview instead of throwing
      return {
        assignments: [],
        assignmentsByTask: {},
        stats: {
          totalAssignments: 0,
          statusCounts: {},
          avgSkillMatch: 0,
          taskCounts: {}
        }
      }
    }
  }
}