# SkillSight AI - Automated Worker Assignment System

## 🎯 Overview

This system automatically assigns 100 workers to 5 main tasks using ML predictions and Supabase integration. The system ensures optimal task-worker matching based on skills, performance, and availability.

## 🏗️ Architecture

### Backend Components

1. **ML Server** (`ml-server/app.py`)
   - Flask-based API server
   - Loads trained Random Forest model from `.pkl` file
   - Provides batch prediction endpoints
   - Fallback rule-based scoring when ML fails

2. **Supabase Database**
   - `workers` table: Worker profiles and skills
   - `assignments` table: Task assignments and ML predictions
   - Real-time updates and data persistence

3. **Assignment Services**
   - `AutomatedAssignmentService`: Main assignment algorithm
   - `AssignmentService`: CRUD operations for assignments
   - `MLService`: ML prediction integration

### Frontend Components

1. **Worker Dashboard** (`src/pages/WorkerDashboard.tsx`)
   - Displays assigned tasks from Supabase
   - Task completion functionality
   - Real-time assignment updates

2. **Manager Dashboard** (`src/pages/ManagerDashboard.tsx`)
   - Assignment overview and analytics
   - Testing pool management
   - ML explainability modals

## 🚀 Key Features

### Automated Assignment Algorithm

- **ML-Powered**: Uses trained Random Forest model for suitability scoring
- **Batch Processing**: Efficient batch predictions for all workers
- **Fallback System**: Rule-based scoring when ML service unavailable
- **Unique Assignment**: Ensures one worker per task (no double assignments)

### Task Definitions

The system assigns workers to these 5 main tasks:

1. **Engine Assembly** (Hard, 6-8 hours)
   - Requires: Engine Assembly skills (90%), Quality Inspection (80%)
   - Tools: Torque Wrench, Assembly Stand, Measuring Tools

2. **Painting & Finishing** (Medium, 4-6 hours)
   - Requires: Painting skills (90%), Quality Inspection (70%)
   - Tools: Paint Gun, Sandpaper, Masking Tape

3. **EV Battery Pack Assembly** (Hard, 8-10 hours)
   - Requires: EV Battery Assembly (95%), Quality Inspection (90%)
   - Tools: Multimeter, Insulation Tools, Safety Equipment

4. **CKD Kit Packing / Kitting** (Easy, 3-5 hours)
   - Requires: CKD Kitting (80%), Quality Inspection (60%)
   - Tools: Packaging Materials, Inventory Scanner

5. **Quality Inspection** (Medium, 2-4 hours)
   - Requires: Quality Inspection (90%)
   - Tools: Measuring Instruments, Test Equipment

### Testing Pool Management

- Workers with `status = "In Testing"` are excluded from main assignments
- Separate testing pool dashboard for evaluation
- Ability to move workers from testing to active workforce

## 🔧 Setup Instructions

### 1. Environment Setup

```bash
# Install dependencies
npm install

# Set up Supabase credentials
cp .env.example .env.local
# Add your Supabase URL and API key
```

### 2. ML Server Setup

```bash
cd ml-server
pip install -r requirements.txt
python app.py
```

### 3. Database Schema

Ensure your Supabase database has these tables:

```sql
-- Workers table
CREATE TABLE workers (
  worker_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  years_experience INTEGER,
  performance_score DECIMAL,
  skill_engine_assembly DECIMAL,
  skill_painting_finishing DECIMAL,
  skill_ev_battery_assembly DECIMAL,
  skill_ckd_kitting DECIMAL,
  skill_quality_inspection DECIMAL,
  current_assignment_status TEXT,
  training_status TEXT,
  -- ... other fields
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT REFERENCES workers(worker_id),
  task_name TEXT NOT NULL,
  skill_match_pct INTEGER,
  assigned_date DATE,
  status TEXT,
  ml_confidence_score DECIMAL,
  ml_reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎮 Usage

### Manager Dashboard

1. **Generate New Day**: Click "Generate New Day" to run automated assignment
2. **View Assignments**: See all current assignments in the Task Assignment tab
3. **Explain Decisions**: Click "Explain" to see ML reasoning for each assignment
4. **Testing Pool**: Manage workers in testing phase
5. **Test Assignment**: Use the Test Assignment tab to verify the system

### Worker Dashboard

1. **View Assigned Task**: See your current task assignment
2. **Complete Task**: Mark tasks as completed to earn XP
3. **Ask Questions**: Use the AI chatbot for task guidance
4. **View Progress**: Track performance and skill development

## 🔍 ML Model Integration

### Prediction Flow

1. **Feature Preparation**: Extract worker skills and task requirements
2. **ML Prediction**: Send to ML server for suitability scoring
3. **Batch Processing**: Process multiple workers efficiently
4. **Fallback Scoring**: Use rule-based scoring if ML fails
5. **Assignment Creation**: Create assignment records in Supabase

### Model Features

The ML model uses these features:
- Worker performance score
- Individual skill levels (5 main skills)
- Years of experience
- Recent accuracy average
- Task completion time average
- Manager rating
- Learning agility

## 📊 Analytics & Monitoring

### Assignment Statistics

- Total assignments created
- Average skill match percentage
- Assignment status distribution
- Task distribution across workers

### Performance Metrics

- ML confidence scores
- Assignment success rates
- Worker utilization rates
- Task completion times

## 🧪 Testing

### Test Component

Use the `AssignmentTestComponent` to verify the system:

1. Navigate to Manager Dashboard → Test Assignment tab
2. Click "Test Automated Assignment"
3. Monitor the assignment process
4. Review assignment results and statistics

### Manual Testing

1. **Worker Assignment**: Verify workers are assigned to appropriate tasks
2. **Skill Matching**: Check that skill match percentages are reasonable
3. **ML Reasoning**: Review explanation modals for assignment decisions
4. **Task Completion**: Test task completion flow in Worker Dashboard

## 🔄 Real-time Updates

The system uses Supabase real-time subscriptions to:
- Update assignment statuses
- Sync worker data changes
- Refresh dashboard views
- Notify of new assignments

## 🚨 Error Handling

### ML Service Failures

- Automatic fallback to rule-based scoring
- Graceful degradation of assignment quality
- Error logging and monitoring

### Database Errors

- Retry mechanisms for failed operations
- User-friendly error messages
- Data consistency checks

## 📈 Future Enhancements

1. **Advanced ML Models**: Implement more sophisticated ML algorithms
2. **Dynamic Reassignment**: Real-time reassignment based on performance
3. **Skill Development**: Track and predict skill growth
4. **Predictive Analytics**: Forecast workforce needs
5. **Mobile Support**: Mobile app for workers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
