import { Worker } from '@/types/database'

export interface MLPredictionRequest {
  taskId: string
  taskRequirements: {
    skill_engine_assembly?: number
    skill_painting_finishing?: number
    skill_ev_battery_assembly?: number
    skill_ckd_kitting?: number
    skill_quality_inspection?: number
    task_complexity?: number
    urgency?: number
    duration_hours?: number
  }
  availableWorkers: Worker[]
}

export interface MLPredictionResponse {
  bestWorkerId: string
  confidence: number
  reasoning: string
  alternativeWorkers: Array<{
    workerId: string
    score: number
    reasoning: string
  }>
  predictedCompletionTime: number
  predictedSuccessRate: number
}

export class MLService {
  private static readonly ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000'

  /**
   * Get the best worker for a specific task using ML model
   */
  static async getBestWorkerForTask(request: MLPredictionRequest): Promise<MLPredictionResponse> {
    try {
      const response = await fetch(`${this.ML_API_URL}/api/predict/best-worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`ML API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error calling ML service:', error)
      // Fallback to rule-based approach
      return this.fallbackBestWorkerSelection(request)
    }
  }

  /**
   * Get skill gap analysis for a worker
   */
  static async getSkillGapAnalysis(workerId: string, targetSkills: Record<string, number>): Promise<{
    gaps: Array<{ skill: string; currentLevel: number; requiredLevel: number; gap: number }>
    recommendedTraining: Array<{ skill: string; priority: string; estimatedHours: number }>
  }> {
    try {
      const response = await fetch(`${this.ML_API_URL}/api/analyze/skill-gap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId, targetSkills })
      })

      if (!response.ok) {
        throw new Error(`ML API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting skill gap analysis:', error)
      return { gaps: [], recommendedTraining: [] }
    }
  }

  /**
   * Predict performance for a worker-task combination
   */
  static async predictPerformance(workerId: string, taskId: string, taskRequirements: any): Promise<{
    predictedScore: number
    confidence: number
    riskFactors: string[]
  }> {
    try {
      const response = await fetch(`${this.ML_API_URL}/api/predict/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId, taskId, taskRequirements })
      })

      if (!response.ok) {
        throw new Error(`ML API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error predicting performance:', error)
      return { predictedScore: 0, confidence: 0, riskFactors: [] }
    }
  }

  /**
   * Get suitability scores for multiple workers for a specific task
   */
  static async getWorkerSuitabilityScores(taskId: string, taskRequirements: any, workers: Worker[]): Promise<Array<{
    workerId: string;
    score: number;
    confidence: number;
    reasoning: string;
  }>> {
    try {
      const response = await fetch(`${this.ML_API_URL}/api/predict/batch-suitability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          taskRequirements,
          workers
        })
      })

      if (!response.ok) {
        throw new Error(`ML API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error calling batch ML service:', error)
      // Fallback to individual predictions
      return this.fallbackBatchSuitabilityScores(taskRequirements, workers)
    }
  }

  /**
   * Fallback method when ML service is unavailable
   */
  private static fallbackBestWorkerSelection(request: MLPredictionRequest): MLPredictionResponse {
    const { availableWorkers, taskRequirements } = request
    
    // Simple rule-based scoring
    const scoredWorkers = availableWorkers.map(worker => {
      let score = 0
      let reasoning = ""

      // Score based on skill matches
      if (taskRequirements.skill_engine_assembly && worker.skill_engine_assembly) {
        score += (worker.skill_engine_assembly / 100) * (taskRequirements.skill_engine_assembly / 100) * 20
        reasoning += `Engine Assembly: ${worker.skill_engine_assembly}% `
      }
      
      if (taskRequirements.skill_painting_finishing && worker.skill_painting_finishing) {
        score += (worker.skill_painting_finishing / 100) * (taskRequirements.skill_painting_finishing / 100) * 20
        reasoning += `Painting: ${worker.skill_painting_finishing}% `
      }
      
      if (taskRequirements.skill_ev_battery_assembly && worker.skill_ev_battery_assembly) {
        score += (worker.skill_ev_battery_assembly / 100) * (taskRequirements.skill_ev_battery_assembly / 100) * 20
        reasoning += `EV Battery: ${worker.skill_ev_battery_assembly}% `
      }
      
      if (taskRequirements.skill_ckd_kitting && worker.skill_ckd_kitting) {
        score += (worker.skill_ckd_kitting / 100) * (taskRequirements.skill_ckd_kitting / 100) * 20
        reasoning += `CKD Kitting: ${worker.skill_ckd_kitting}% `
      }
      
      if (taskRequirements.skill_quality_inspection && worker.skill_quality_inspection) {
        score += (worker.skill_quality_inspection / 100) * (taskRequirements.skill_quality_inspection / 100) * 20
        reasoning += `Quality Inspection: ${worker.skill_quality_inspection}% `
      }

      // Factor in performance score
      if (worker.performance_score) {
        score += (worker.performance_score / 100) * 30
        reasoning += `Performance: ${worker.performance_score}%`
      }

      return {
        workerId: worker.worker_id,
        score,
        reasoning: reasoning.trim()
      }
    })

    // Sort by score and get best worker
    scoredWorkers.sort((a, b) => b.score - a.score)
    const bestWorker = scoredWorkers[0]
    const alternativeWorkers = scoredWorkers.slice(1, 4) // Top 3 alternatives

    return {
      bestWorkerId: bestWorker.workerId,
      confidence: Math.min(bestWorker.score / 100, 1), // Normalize to 0-1
      reasoning: bestWorker.reasoning,
      alternativeWorkers,
      predictedCompletionTime: taskRequirements.duration_hours || 4,
      predictedSuccessRate: Math.min(bestWorker.score / 100, 0.95) // Cap at 95%
    }
  }

  /**
   * Fallback batch suitability scoring when ML service is unavailable
   */
  private static fallbackBatchSuitabilityScores(taskRequirements: any, workers: Worker[]): Array<{
    workerId: string;
    score: number;
    confidence: number;
    reasoning: string;
  }> {
    return workers.map(worker => {
      let score = 0
      let reasoning = ""

      // Score based on skill matches
      if (taskRequirements.skill_engine_assembly && worker.skill_engine_assembly) {
        score += (worker.skill_engine_assembly / 100) * (taskRequirements.skill_engine_assembly / 100) * 20
        reasoning += `Engine Assembly: ${worker.skill_engine_assembly}% `
      }
      
      if (taskRequirements.skill_painting_finishing && worker.skill_painting_finishing) {
        score += (worker.skill_painting_finishing / 100) * (taskRequirements.skill_painting_finishing / 100) * 20
        reasoning += `Painting: ${worker.skill_painting_finishing}% `
      }
      
      if (taskRequirements.skill_ev_battery_assembly && worker.skill_ev_battery_assembly) {
        score += (worker.skill_ev_battery_assembly / 100) * (taskRequirements.skill_ev_battery_assembly / 100) * 20
        reasoning += `EV Battery: ${worker.skill_ev_battery_assembly}% `
      }
      
      if (taskRequirements.skill_ckd_kitting && worker.skill_ckd_kitting) {
        score += (worker.skill_ckd_kitting / 100) * (taskRequirements.skill_ckd_kitting / 100) * 20
        reasoning += `CKD Kitting: ${worker.skill_ckd_kitting}% `
      }
      
      if (taskRequirements.skill_quality_inspection && worker.skill_quality_inspection) {
        score += (worker.skill_quality_inspection / 100) * (taskRequirements.skill_quality_inspection / 100) * 20
        reasoning += `Quality Inspection: ${worker.skill_quality_inspection}% `
      }

      // Factor in performance score
      if (worker.performance_score) {
        score += (worker.performance_score / 100) * 30
        reasoning += `Performance: ${worker.performance_score}%`
      }

      return {
        workerId: worker.worker_id,
        score: Math.min(score / 100, 1), // Normalize to 0-1
        confidence: Math.min(score / 100, 0.95), // Cap at 95%
        reasoning: reasoning.trim() || "Suitable based on available metrics"
      }
    })
  }
}
