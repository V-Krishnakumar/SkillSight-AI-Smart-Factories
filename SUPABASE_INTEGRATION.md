# Supabase Integration Guide

This guide will help you integrate your SkillSight AI application with Supabase to use real data instead of hardcoded values.

## Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized

### 2. Set up Database Schema
Run the following SQL in your Supabase SQL editor:

```sql
CREATE TABLE public.workers (
  worker_id text NOT NULL,
  name text NOT NULL,
  years_experience double precision,
  preferred_shift text,
  task_completion_time_avg double precision,
  learning_agility double precision,
  recent_accuracy_avg double precision,
  certifications text,
  training_status text,
  skill_engine_assembly double precision,
  skill_painting_finishing double precision,
  skill_ev_battery_assembly double precision,
  skill_ckd_kitting double precision,
  skill_quality_inspection double precision,
  task_complexity double precision,
  performance_score double precision,
  suitability_score double precision,
  assigned_task text,
  current_assignment_status text,
  rating_by_manager double precision,
  "Skill_Match_%" double precision,
  "Absence_Rate_%" double precision,
  last_training_date date,
  xp_points integer,
  skill_match_percent numeric,
  absence_rate_percent numeric,
  CONSTRAINT workers_pkey PRIMARY KEY (worker_id)
);
```

### 3. Configure Environment Variables
Create a `.env.local` file in your project root with:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

To find these values:
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" for `VITE_SUPABASE_URL`
4. Copy the "anon public" key for `VITE_SUPABASE_ANON_KEY`

### 4. Insert Sample Data
You can insert sample data using the Supabase dashboard or by importing from your CSV file.

### 5. Set Row Level Security (RLS)
For security, enable RLS on your workers table:

```sql
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust based on your needs)
CREATE POLICY "Allow public read access" ON public.workers
FOR SELECT USING (true);

-- Allow public insert/update/delete (adjust based on your needs)
CREATE POLICY "Allow public insert" ON public.workers
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.workers
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.workers
FOR DELETE USING (true);
```

## Features Integrated

### Analytics Dashboard
- **Real-time data**: Charts now display actual worker data from Supabase
- **Performance metrics**: Average performance scores calculated from real data
- **Training status**: Distribution of training statuses from database
- **Skill averages**: Real skill averages across all workers

### Data Management
- **CRUD operations**: Full create, read, update, delete functionality
- **React Query**: Efficient data fetching with caching and background updates
- **Error handling**: Proper error states and loading indicators
- **TypeScript**: Fully typed database interactions

### Available Hooks
- `useWorkers()` - Get all workers
- `useWorker(id)` - Get specific worker
- `useAnalyticsData()` - Get dashboard analytics
- `useTopPerformers(limit)` - Get top performing workers
- `useWorkersBySkill(skill, minScore)` - Get workers by skill level
- `useWorkersByShift(shift)` - Get workers by shift preference
- `useWorkersNeedingTraining()` - Get workers who need training

## Usage Examples

### Fetching Workers
```typescript
import { useWorkers } from '@/hooks/useWorkers'

function WorkersList() {
  const { data: workers, isLoading, error } = useWorkers()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {workers?.map(worker => (
        <div key={worker.worker_id}>{worker.name}</div>
      ))}
    </div>
  )
}
```

### Creating a Worker
```typescript
import { useCreateWorker } from '@/hooks/useWorkers'

function CreateWorkerForm() {
  const createWorker = useCreateWorker()
  
  const handleSubmit = (workerData) => {
    createWorker.mutate(workerData, {
      onSuccess: () => {
        console.log('Worker created successfully!')
      }
    })
  }
  
  // ... rest of component
}
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Make sure `.env.local` is in the project root
   - Restart your development server after adding environment variables

2. **CORS errors**
   - Check that your Supabase URL is correct
   - Ensure your domain is allowed in Supabase settings

3. **Authentication errors**
   - Verify your anon key is correct
   - Check RLS policies if you're getting permission errors

4. **Data not loading**
   - Check browser console for errors
   - Verify your table structure matches the TypeScript types
   - Ensure you have data in your Supabase table

## Next Steps

1. **Authentication**: Implement user authentication with Supabase Auth
2. **Real-time subscriptions**: Add real-time updates for live data
3. **File uploads**: Add profile pictures or document uploads
4. **Advanced queries**: Implement complex filtering and search
5. **Data validation**: Add form validation using Zod schemas
