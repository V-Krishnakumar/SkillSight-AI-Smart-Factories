-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create workers table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS workers (
  worker_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  years_experience INTEGER,
  preferred_shift TEXT,
  task_completion_time_avg DECIMAL,
  learning_agility DECIMAL,
  recent_accuracy_avg DECIMAL,
  certifications TEXT,
  training_status TEXT,
  skill_engine_assembly DECIMAL,
  skill_painting_finishing DECIMAL,
  skill_ev_battery_assembly DECIMAL,
  skill_ckd_kitting DECIMAL,
  skill_quality_inspection DECIMAL,
  task_complexity DECIMAL,
  performance_score DECIMAL,
  suitability_score DECIMAL,
  assigned_task TEXT,
  current_assignment_status TEXT,
  rating_by_manager DECIMAL,
  "Skill_Match_%" DECIMAL,
  "Absence_Rate_%" DECIMAL,
  last_training_date DATE,
  xp_points INTEGER,
  skill_match_percent DECIMAL,
  absence_rate_percent DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT REFERENCES workers(worker_id),
  task_name TEXT NOT NULL,
  skill_match_pct INTEGER,
  assigned_date DATE,
  status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  ml_confidence_score DECIMAL,
  ml_reasoning TEXT,
  completion_time DECIMAL,
  quality_rating DECIMAL,
  manager_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sample workers removed - use CSV data instead

-- Enable Row Level Security (RLS)
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
CREATE POLICY "Enable read access for all users" ON workers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON workers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON workers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON assignments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON assignments FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workers_assignment_status ON workers(current_assignment_status);
CREATE INDEX IF NOT EXISTS idx_workers_training_status ON workers(training_status);
CREATE INDEX IF NOT EXISTS idx_assignments_worker_id ON assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_assignments_task_name ON assignments(task_name);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
