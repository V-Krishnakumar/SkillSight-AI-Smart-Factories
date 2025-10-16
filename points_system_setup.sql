-- Points System and Leaderboard Setup for SkillSight AI
-- Run this in your Supabase SQL Editor

-- Create points_transactions table to track all XP point changes
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL REFERENCES workers(worker_id),
  points_change INTEGER NOT NULL, -- Positive for earning, negative for spending
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('task_completion', 'skill_improvement', 'bonus', 'penalty', 'achievement', 'daily_login')),
  task_name TEXT, -- For task completion transactions
  description TEXT, -- Human readable description
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create achievements table for badges and milestones
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL REFERENCES workers(worker_id),
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('first_task', 'task_streak', 'skill_master', 'speed_demon', 'quality_expert', 'team_player')),
  achievement_name TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER DEFAULT 0,
  earned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create daily_stats table for tracking daily performance
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL REFERENCES workers(worker_id),
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  average_task_time DECIMAL,
  quality_rating DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(worker_id, date)
);

-- Disable Row Level Security for easier development
-- ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies (commented out since RLS is disabled)
/*
-- Create RLS policies for points_transactions
CREATE POLICY "Points transactions are viewable by everyone" ON points_transactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert points transactions" ON points_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for achievements
CREATE POLICY "Achievements are viewable by everyone" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert achievements" ON achievements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for daily_stats
CREATE POLICY "Daily stats are viewable by everyone" ON daily_stats
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert daily stats" ON daily_stats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update daily stats" ON daily_stats
  FOR UPDATE USING (auth.role() = 'authenticated');
*/

-- Create function to update worker's total XP points
CREATE OR REPLACE FUNCTION update_worker_xp_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the worker's total xp_points based on all transactions
  UPDATE workers 
  SET xp_points = (
    SELECT COALESCE(SUM(points_change), 0) 
    FROM points_transactions 
    WHERE worker_id = NEW.worker_id
  )
  WHERE worker_id = NEW.worker_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update worker XP when points_transactions change
CREATE TRIGGER update_worker_xp_trigger
  AFTER INSERT OR UPDATE OR DELETE ON points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_worker_xp_points();

-- Create function to award points for task completion
CREATE OR REPLACE FUNCTION award_task_completion_points(
  p_worker_id TEXT,
  p_task_name TEXT,
  p_difficulty TEXT,
  p_quality_rating DECIMAL DEFAULT 4.0
)
RETURNS INTEGER AS $$
DECLARE
  base_points INTEGER;
  quality_multiplier DECIMAL;
  total_points INTEGER;
BEGIN
  -- Calculate base points based on difficulty
  base_points := CASE 
    WHEN p_difficulty = 'Easy' THEN 75
    WHEN p_difficulty = 'Medium' THEN 100
    WHEN p_difficulty = 'Hard' THEN 150
    ELSE 75
  END;
  
  -- Calculate quality multiplier (0.8 to 1.2)
  quality_multiplier := GREATEST(0.8, LEAST(1.2, p_quality_rating / 4.0));
  
  -- Calculate total points
  total_points := ROUND(base_points * quality_multiplier);
  
  -- Insert points transaction
  INSERT INTO points_transactions (worker_id, points_change, transaction_type, task_name, description)
  VALUES (
    p_worker_id, 
    total_points, 
    'task_completion', 
    p_task_name,
    'Completed task: ' || p_task_name || ' (Quality: ' || p_quality_rating || '/5)'
  );
  
  -- Update daily stats
  INSERT INTO daily_stats (worker_id, date, tasks_completed, total_points_earned, quality_rating)
  VALUES (p_worker_id, CURRENT_DATE, 1, total_points, p_quality_rating)
  ON CONFLICT (worker_id, date) 
  DO UPDATE SET 
    tasks_completed = daily_stats.tasks_completed + 1,
    total_points_earned = daily_stats.total_points_earned + total_points,
    quality_rating = (daily_stats.quality_rating * daily_stats.tasks_completed + p_quality_rating) / (daily_stats.tasks_completed + 1),
    updated_at = NOW();
  
  RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Create function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  rank INTEGER,
  worker_id TEXT,
  worker_name TEXT,
  total_points INTEGER,
  tasks_completed_today INTEGER,
  current_task TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY w.xp_points DESC)::INTEGER as rank,
    w.worker_id,
    w.name as worker_name,
    COALESCE(w.xp_points, 0)::INTEGER as total_points,
    COALESCE(ds.tasks_completed, 0)::INTEGER as tasks_completed_today,
    w.assigned_task as current_task
  FROM workers w
  LEFT JOIN daily_stats ds ON w.worker_id = ds.worker_id AND ds.date = CURRENT_DATE
  WHERE w.training_status != 'In Testing' -- Exclude testing workers from leaderboard
  ORDER BY w.xp_points DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample points transactions for existing workers
INSERT INTO points_transactions (worker_id, points_change, transaction_type, task_name, description)
SELECT 
  worker_id,
  COALESCE(xp_points, 0),
  'bonus',
  NULL,
  'Initial XP points from existing data'
FROM workers 
WHERE xp_points > 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_points_transactions_worker_id ON points_transactions(worker_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_achievements_worker_id ON achievements(worker_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_worker_id_date ON daily_stats(worker_id, date);
CREATE INDEX IF NOT EXISTS idx_workers_xp_points ON workers(xp_points DESC);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON points_transactions TO authenticated;
GRANT SELECT, INSERT ON achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_stats TO authenticated;
GRANT EXECUTE ON FUNCTION award_task_completion_points TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;
