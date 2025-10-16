import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Brain, Target, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useBestWorkerForTask, useAITaskAssignment } from "@/hooks/useML"
import { MLPredictionRequest } from "@/services/mlService"
import { Worker } from "@/types/database"

interface AIWorkerRecommendationsProps {
  task: {
    id: string
    name: string
    description: string
    requiredSkills: string[]
    difficulty: string
    duration: string
  }
  workers: Worker[]
  onWorkerSelected?: (workerId: string, prediction: any) => void
}

export default function AIWorkerRecommendations({ task, workers, onWorkerSelected }: AIWorkerRecommendationsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<any>(null)
  
  const bestWorkerMutation = useBestWorkerForTask()
  const taskAssignmentMutation = useAITaskAssignment()

  const analyzeTask = async () => {
    setIsAnalyzing(true)
    
    try {
      const request: MLPredictionRequest = {
        taskId: task.id,
        taskRequirements: {
          skill_engine_assembly: task.requiredSkills.includes('Mechanical Assembly') ? 0.8 : 0,
          skill_painting_finishing: task.requiredSkills.includes('Spray Painting') ? 0.8 : 0,
          skill_ev_battery_assembly: task.requiredSkills.includes('Electrical Systems') ? 0.9 : 0,
          skill_ckd_kitting: task.requiredSkills.includes('Inventory Management') ? 0.7 : 0,
          skill_quality_inspection: task.requiredSkills.includes('Quality Control') ? 0.8 : 0,
          task_complexity: task.difficulty === 'Hard' ? 0.9 : task.difficulty === 'Medium' ? 0.6 : 0.3,
          duration_hours: parseDuration(task.duration)
        },
        availableWorkers: workers
      }

      const result = await bestWorkerMutation.mutateAsync(request)
      setRecommendations(result)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const assignTask = async (workerId: string) => {
    if (!recommendations) return

    try {
      const request: MLPredictionRequest = {
        taskId: task.id,
        taskRequirements: {
          skill_engine_assembly: task.requiredSkills.includes('Mechanical Assembly') ? 0.8 : 0,
          skill_painting_finishing: task.requiredSkills.includes('Spray Painting') ? 0.8 : 0,
          skill_ev_battery_assembly: task.requiredSkills.includes('Electrical Systems') ? 0.9 : 0,
          skill_ckd_kitting: task.requiredSkills.includes('Inventory Management') ? 0.7 : 0,
          skill_quality_inspection: task.requiredSkills.includes('Quality Control') ? 0.8 : 0,
          task_complexity: task.difficulty === 'Hard' ? 0.9 : task.difficulty === 'Medium' ? 0.6 : 0.3,
          duration_hours: parseDuration(task.duration)
        },
        availableWorkers: workers
      }

      await taskAssignmentMutation.mutateAsync(request)
      onWorkerSelected?.(workerId, recommendations)
    } catch (error) {
      console.error('Task assignment failed:', error)
    }
  }

  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)-(\d+)/)
    if (match) {
      return (parseInt(match[1]) + parseInt(match[2])) / 2
    }
    return 4
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500'
    if (confidence >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Worker Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task Info */}
        <div className="p-4 bg-card/50 rounded-lg">
          <h3 className="font-semibold mb-2">{task.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className={`${getDifficultyColor(task.difficulty)} text-white`}>
              {task.difficulty}
            </Badge>
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {task.duration}
            </Badge>
          </div>
          
          <div className="text-sm">
            <strong>Required Skills:</strong> {task.requiredSkills.join(', ')}
          </div>
        </div>

        {/* Analysis Button */}
        <Button 
          onClick={analyzeTask} 
          disabled={isAnalyzing || workers.length === 0}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Get AI Recommendations
            </>
          )}
        </Button>

        {/* Recommendations */}
        {recommendations && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              Analysis complete
            </div>

            {/* Best Worker Recommendation */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">🎯 Best Match</h4>
                  <Badge className={getConfidenceColor(recommendations.confidence)}>
                    {Math.round(recommendations.confidence * 100)}% confidence
                  </Badge>
                </div>
                
                {(() => {
                  const bestWorker = workers.find(w => w.worker_id === recommendations.bestWorkerId)
                  return bestWorker ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{bestWorker.name}</span>
                        <Button 
                          size="sm" 
                          onClick={() => assignTask(recommendations.bestWorkerId)}
                          disabled={taskAssignmentMutation.isPending}
                        >
                          {taskAssignmentMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Assign Task'
                          )}
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {recommendations.reasoning}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span>{Math.round(recommendations.predictedSuccessRate * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. Time:</span>
                          <span>{recommendations.predictedCompletionTime}h</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Worker not found</p>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Alternative Workers */}
            {recommendations.alternativeWorkers && recommendations.alternativeWorkers.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">🔄 Alternative Options</h4>
                <div className="space-y-2">
                  {recommendations.alternativeWorkers.map((alt: any, index: number) => {
                    const worker = workers.find(w => w.worker_id === alt.workerId)
                    return worker ? (
                      <div key={alt.workerId} className="p-3 bg-card/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{worker.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              #{index + 2} choice
                            </span>
                          </div>
                          <Badge variant="outline">
                            {Math.round(alt.score)} pts
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alt.reasoning}
                        </p>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {workers.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No workers available for analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
