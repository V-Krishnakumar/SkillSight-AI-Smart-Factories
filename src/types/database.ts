export interface Worker {
  worker_id: string;
  name: string;
  years_experience: number | null;
  preferred_shift: string | null;
  task_completion_time_avg: number | null;
  learning_agility: number | null;
  recent_accuracy_avg: number | null;
  certifications: string | null;
  training_status: string | null;
  skill_engine_assembly: number | null;
  skill_painting_finishing: number | null;
  skill_ev_battery_assembly: number | null;
  skill_ckd_kitting: number | null;
  skill_quality_inspection: number | null;
  task_complexity: number | null;
  performance_score: number | null;
  suitability_score: number | null;
  assigned_task: string | null;
  current_assignment_status: string | null;
  rating_by_manager: number | null;
  "Skill_Match_%": number | null;
  "Absence_Rate_%": number | null;
  last_training_date: string | null;
  xp_points: number | null;
  skill_match_percent: number | null;
  absence_rate_percent: number | null;
}

export interface WorkerInsert {
  worker_id: string;
  name: string;
  years_experience?: number;
  preferred_shift?: string;
  task_completion_time_avg?: number;
  learning_agility?: number;
  recent_accuracy_avg?: number;
  certifications?: string;
  training_status?: string;
  skill_engine_assembly?: number;
  skill_painting_finishing?: number;
  skill_ev_battery_assembly?: number;
  skill_ckd_kitting?: number;
  skill_quality_inspection?: number;
  task_complexity?: number;
  performance_score?: number;
  suitability_score?: number;
  assigned_task?: string;
  current_assignment_status?: string;
  rating_by_manager?: number;
  "Skill_Match_%": number;
  "Absence_Rate_%": number;
  last_training_date?: string;
  xp_points?: number;
  skill_match_percent?: number;
  absence_rate_percent?: number;
}

export interface WorkerUpdate {
  name?: string;
  years_experience?: number;
  preferred_shift?: string;
  task_completion_time_avg?: number;
  learning_agility?: number;
  recent_accuracy_avg?: number;
  certifications?: string;
  training_status?: string;
  skill_engine_assembly?: number;
  skill_painting_finishing?: number;
  skill_ev_battery_assembly?: number;
  skill_ckd_kitting?: number;
  skill_quality_inspection?: number;
  task_complexity?: number;
  performance_score?: number;
  suitability_score?: number;
  assigned_task?: string;
  current_assignment_status?: string;
  rating_by_manager?: number;
  "Skill_Match_%": number;
  "Absence_Rate_%": number;
  last_training_date?: string;
  xp_points?: number;
  skill_match_percent?: number;
  absence_rate_percent?: number;
}

// Task definitions for the 5 main tasks
export interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  toolsRequired: string[];
  precautions: string[];
  requiredSkills: string[];
  videoUrl: string;
  skillRequirements: {
    skill_engine_assembly?: number;
    skill_painting_finishing?: number;
    skill_ev_battery_assembly?: number;
    skill_ckd_kitting?: number;
    skill_quality_inspection?: number;
    task_complexity?: number;
    duration_hours?: number;
  };
}

// Assignment tracking
export interface Assignment {
  id: string;
  worker_id: string;
  task_name: string;
  skill_match_pct: number;
  assigned_date: string;
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  ml_confidence_score: number;
  ml_reasoning: string;
  completion_time?: number;
  quality_rating?: number;
  manager_feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentInsert {
  worker_id: string;
  task_name: string;
  skill_match_pct: number;
  assigned_date: string;
  status: "assigned" | "in_progress" | "completed" | "cancelled";
  ml_confidence_score: number;
  ml_reasoning: string;
  completion_time?: number;
  quality_rating?: number;
  manager_feedback?: string;
}

export interface AssignmentUpdate {
  status?: "assigned" | "in_progress" | "completed" | "cancelled";
  completion_time?: number;
  quality_rating?: number;
  manager_feedback?: string;
}