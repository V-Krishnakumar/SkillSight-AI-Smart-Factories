import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Assignment, AssignmentInsert, AssignmentUpdate } from '@/types/database'
import { PointsService } from '@/services/pointsService'

export class AssignmentService {
  private static throwIfNotConfigured() {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }
  }

  // Get all assignments
  static async getAllAssignments(): Promise<Assignment[]> {
    AssignmentService.throwIfNotConfigured()
    
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('assigned_date', { ascending: false })

      if (error) {
        console.error('Error fetching assignments:', error)
        // If assignments table doesn't exist, return empty array instead of throwing
        if (error.code === 'PGRST116' || error.message.includes('relation "assignments" does not exist')) {
          console.warn('⚠️ Assignments table does not exist. Please run the SQL setup script.')
          return []
        }
        throw new Error(`Failed to fetch assignments: ${error.message}`)
      }

      return data || []
    } catch (err) {
      console.error('Error in getAllAssignments:', err)
      // Return empty array for now to prevent crashes
      return []
    }
  }

  // Get assignments by worker ID
  static async getAssignmentsByWorker(workerId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('worker_id', workerId)
      .order('assigned_date', { ascending: false })

    if (error) {
      console.error('Error fetching worker assignments:', error)
      throw new Error(`Failed to fetch worker assignments: ${error.message}`)
    }

    return data || []
  }

  // Get current assignment for a worker
  static async getCurrentAssignment(workerId: string): Promise<Assignment | null> {
    console.log('🔍 getCurrentAssignment called for worker:', workerId);
    
    try {
      // First, try to get from assignments table
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select('*')
        .eq('worker_id', workerId)
        .in('status', ['assigned', 'in_progress'])
        .order('assigned_date', { ascending: false })
        .limit(1)
        .single()

      console.log('📋 Assignment table result:', { assignmentData, assignmentError });

      if (assignmentData && !assignmentError) {
        console.log('✅ Found assignment in assignments table:', assignmentData);
        return assignmentData
      }

      // If no assignment found in assignments table, check worker's direct assignment
      console.log('🔍 Checking worker table for direct assignment...');
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('assigned_task, current_assignment_status, skill_match_percent')
        .eq('worker_id', workerId)
        .single()

      console.log('👤 Worker table result:', { workerData, workerError });
      console.log('👤 Worker data details:', workerData);

      if (workerError) {
        console.error('❌ Error fetching worker data:', workerError)
        return null
      }

      console.log('🔍 Checking assignment conditions:');
      console.log('- Has workerData:', !!workerData);
      console.log('- Has assigned_task:', workerData?.assigned_task);
      console.log('- Has current_assignment_status:', workerData?.current_assignment_status);
      console.log('- Status is not Available:', workerData?.current_assignment_status !== 'Available');
      console.log('- Status is not empty:', workerData?.current_assignment_status !== '');

      if (workerData && workerData.assigned_task && 
          workerData.current_assignment_status && 
          workerData.current_assignment_status !== '') {
        
        console.log('✅ Creating virtual assignment from worker data:', workerData);
        
        // Create a virtual assignment object from worker data
        const virtualAssignment: Assignment = {
          id: `virtual-${workerId}`,
          worker_id: workerId,
          task_name: workerData.assigned_task,
          skill_match_pct: workerData.skill_match_percent || 0,
          assigned_date: new Date().toISOString().split('T')[0],
          status: workerData.current_assignment_status === 'Pending' ? 'pending' : 
                  workerData.current_assignment_status === 'Available' ? 'pending' :
                  workerData.current_assignment_status === 'Completed' ? 'completed' : 
                  workerData.current_assignment_status === 'Under Review' ? 'in_progress' : 'assigned',
          ml_confidence_score: 0.8, // Default confidence
          ml_reasoning: 'Assignment from worker record',
          completion_time: null,
          quality_rating: null,
          manager_feedback: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('🎯 Virtual assignment created:', virtualAssignment);
        return virtualAssignment
      }

      console.log('❌ No assignment found for worker:', workerId);
      return null
    } catch (error) {
      console.error('❌ Error in getCurrentAssignment:', error)
      return null
    }
  }

  // Get assignments by task name
  static async getAssignmentsByTask(taskName: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('task_name', taskName)
      .order('assigned_date', { ascending: false })

    if (error) {
      console.error('Error fetching task assignments:', error)
      throw new Error(`Failed to fetch task assignments: ${error.message}`)
    }

    return data || []
  }

  // Create new assignment
  static async createAssignment(assignment: AssignmentInsert): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignment)
      .select()
      .single()

    if (error) {
      console.error('Error creating assignment:', error)
      throw new Error(`Failed to create assignment: ${error.message}`)
    }

    return data
  }

  // Update assignment
  static async updateAssignment(assignmentId: string, updates: AssignmentUpdate): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating assignment:', error)
      throw new Error(`Failed to update assignment: ${error.message}`)
    }

    return data
  }

  // Start a pending assignment
  static async startAssignment(assignmentId: string): Promise<Assignment> {
    console.log('🚀 Starting assignment:', assignmentId);
    
    if (assignmentId.startsWith('virtual-')) {
      const workerId = assignmentId.replace('virtual-', '');
      
      // Update worker's status from Available/Pending to Assigned
      const { error: workerError } = await supabase
        .from('workers')
        .update({
          current_assignment_status: 'Assigned',
        })
        .eq('worker_id', workerId);

      if (workerError) {
        console.error('Error updating worker status:', workerError);
        throw new Error(`Failed to start assignment: ${workerError.message}`);
      }

      // Return updated assignment
      const updatedAssignment = await this.getCurrentAssignment(workerId);
      if (updatedAssignment) {
        return {
          ...updatedAssignment,
          status: 'assigned'
        };
      }
    }

    throw new Error('Assignment not found');
  }

  // Mark assignment as completed
  static async completeAssignment(assignmentId: string, completionTime?: number, qualityRating?: number): Promise<Assignment> {
    // Check if this is a virtual assignment (from worker record)
    if (assignmentId.startsWith('virtual-')) {
      const workerId = assignmentId.replace('virtual-', '')
      
      // Get worker data to determine task difficulty
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('assigned_task')
        .eq('worker_id', workerId)
        .single()

      if (workerError) {
        console.error('Error fetching worker data for completion:', workerError)
        throw new Error(`Failed to fetch worker data: ${workerError.message}`)
      }

      // Update worker's status to completed
      const { error: updateError } = await supabase
        .from('workers')
        .update({
          current_assignment_status: 'Completed',
        })
        .eq('worker_id', workerId)

      if (updateError) {
        console.error('Error updating worker status:', updateError)
        throw new Error(`Failed to update worker status: ${updateError.message}`)
      }

      // Award points for task completion
      try {
        const taskName = workerData.assigned_task || 'Unknown Task'
        const difficulty = this.getTaskDifficulty(taskName) // Helper method to determine difficulty
        const finalQualityRating = qualityRating || 4.0
        
        console.log(`🎯 Awarding points for task completion: ${taskName} (${difficulty}, Quality: ${finalQualityRating})`)
        const pointsAwarded = await PointsService.awardTaskCompletionPoints(
          workerId, 
          taskName, 
          difficulty, 
          finalQualityRating
        )
        
        console.log(`✅ Awarded ${pointsAwarded} points to worker ${workerId}`)
        
        // Check for achievements
        await PointsService.checkAndAwardAchievements(workerId)
        
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError)
        // Don't throw here - task completion should still succeed even if points fail
      }

      // Return updated assignment
      const updatedAssignment = await this.getCurrentAssignment(workerId)
      if (updatedAssignment) {
        return {
          ...updatedAssignment,
          status: 'completed',
          completion_time: completionTime || null,
          quality_rating: qualityRating || null
        }
      }
    }

    // Regular assignment completion
    const updates: AssignmentUpdate = {
      status: 'completed',
      completion_time: completionTime,
      quality_rating: qualityRating
    }

    return AssignmentService.updateAssignment(assignmentId, updates)
  }

  // Helper method to determine task difficulty
  private static getTaskDifficulty(taskName: string): 'Easy' | 'Medium' | 'Hard' {
    const taskDifficulties: Record<string, 'Easy' | 'Medium' | 'Hard'> = {
      'CKD Kit Packing / Kitting': 'Easy',
      'Painting & Finishing': 'Medium',
      'EV Battery Pack Assembly': 'Hard',
      'Engine Assembly': 'Hard',
      'Quality Inspection': 'Medium'
    }
    
    return taskDifficulties[taskName] || 'Medium'
  }

  // Get assignments by status
  static async getAssignmentsByStatus(status: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('status', status)
      .order('assigned_date', { ascending: false })

    if (error) {
      console.error('Error fetching assignments by status:', error)
      throw new Error(`Failed to fetch assignments by status: ${error.message}`)
    }

    return data || []
  }

  // Get assignment statistics
  static async getAssignmentStats() {
    AssignmentService.throwIfNotConfigured()
    try {
      // Get total assignments
      const { count: totalAssignments } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })

      // Get assignments by status
      const { data: statusData } = await supabase
        .from('assignments')
        .select('status')
        .not('status', 'is', null)

      const statusCounts = statusData?.reduce((acc, assignment) => {
        const status = assignment.status || 'Unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Get average skill match percentage
      const { data: skillMatchData } = await supabase
        .from('assignments')
        .select('skill_match_pct')
        .not('skill_match_pct', 'is', null)

      const avgSkillMatch = skillMatchData?.length 
        ? skillMatchData.reduce((sum, assignment) => sum + (assignment.skill_match_pct || 0), 0) / skillMatchData.length
        : 0

      // Get assignments by task
      const { data: taskData } = await supabase
        .from('assignments')
        .select('task_name')
        .not('task_name', 'is', null)

      const taskCounts = taskData?.reduce((acc, assignment) => {
        const task = assignment.task_name || 'Unknown'
        acc[task] = (acc[task] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        totalAssignments: totalAssignments || 0,
        statusCounts,
        avgSkillMatch: Math.round(avgSkillMatch * 100) / 100,
        taskCounts
      }
    } catch (error) {
      console.error('Error fetching assignment stats:', error)
      throw new Error('Failed to fetch assignment statistics')
    }
  }

  // Delete assignment
  static async deleteAssignment(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId)

    if (error) {
      console.error('Error deleting assignment:', error)
      throw new Error(`Failed to delete assignment: ${error.message}`)
    }
  }
}
