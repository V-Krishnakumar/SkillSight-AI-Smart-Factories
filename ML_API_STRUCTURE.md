# ML Model API Integration Guide

This guide shows your friend how to structure the ML API server to integrate with your SkillSight AI frontend.

## API Endpoints Structure

### 1. Best Worker Prediction
```
POST /api/predict/best-worker
```

**Request Body:**
```json
{
  "taskId": "task1",
  "taskRequirements": {
    "skill_engine_assembly": 0.8,
    "skill_painting_finishing": 0.6,
    "skill_ev_battery_assembly": 0.9,
    "skill_ckd_kitting": 0.5,
    "skill_quality_inspection": 0.8,
    "task_complexity": 0.7,
    "urgency": 0.8,
    "duration_hours": 6
  },
  "availableWorkers": [
    {
      "worker_id": "w1",
      "name": "Rajesh Kumar",
      "performance_score": 92,
      "skill_engine_assembly": 0.95,
      "skill_painting_finishing": 0.88,
      "skill_ev_battery_assembly": 0.92,
      "skill_ckd_kitting": 0.85,
      "skill_quality_inspection": 0.98,
      "years_experience": 8,
      "recent_accuracy_avg": 0.98,
      "task_completion_time_avg": 0.85,
      "rating_by_manager": 4.8,
      "training_status": "Completed",
      "availability": "available"
    }
    // ... more workers
  ]
}
```

**Response:**
```json
{
  "bestWorkerId": "w1",
  "confidence": 0.92,
  "reasoning": "Excellent match for engine assembly with 95% skill level, high performance score (92%), and proven accuracy (98%). Previous similar tasks completed with 4.8/5 rating.",
  "alternativeWorkers": [
    {
      "workerId": "w3",
      "score": 88.5,
      "reasoning": "Strong technical skills (92% EV battery assembly) and good performance (94%), but slightly lower experience."
    },
    {
      "workerId": "w2",
      "score": 85.2,
      "reasoning": "Good quality control skills (95%) and painting expertise (88%), suitable for finishing tasks."
    }
  ],
  "predictedCompletionTime": 5.2,
  "predictedSuccessRate": 0.94
}
```

### 2. Skill Gap Analysis
```
POST /api/analyze/skill-gap
```

**Request Body:**
```json
{
  "workerId": "w1",
  "targetSkills": {
    "skill_engine_assembly": 0.9,
    "skill_ev_battery_assembly": 0.8,
    "skill_quality_inspection": 0.95
  }
}
```

**Response:**
```json
{
  "gaps": [
    {
      "skill": "skill_ev_battery_assembly",
      "currentLevel": 0.75,
      "requiredLevel": 0.8,
      "gap": 0.05
    }
  ],
  "recommendedTraining": [
    {
      "skill": "Advanced Electrical Systems",
      "priority": "Medium",
      "estimatedHours": 8
    }
  ]
}
```

### 3. Performance Prediction
```
POST /api/predict/performance
```

**Request Body:**
```json
{
  "workerId": "w1",
  "taskId": "task1",
  "taskRequirements": {
    "skill_engine_assembly": 0.8,
    "task_complexity": 0.7,
    "duration_hours": 6
  }
}
```

**Response:**
```json
{
  "predictedScore": 0.92,
  "confidence": 0.88,
  "riskFactors": [
    "Worker has limited experience with this specific task variant",
    "High complexity task may require additional support"
  ]
}
```

## Python Flask/FastAPI Server Example

### Flask Implementation
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load your trained model
model = joblib.load('worker_prediction_model.pkl')

@app.route('/api/predict/best-worker', methods=['POST'])
def predict_best_worker():
    data = request.json
    
    # Extract features from request
    task_requirements = data['taskRequirements']
    workers = data['availableWorkers']
    
    best_worker = None
    best_score = -1
    alternatives = []
    
    for worker in workers:
        # Prepare features for your model
        features = prepare_features(worker, task_requirements)
        
        # Get prediction from your model
        prediction = model.predict([features])[0]
        confidence = model.predict_proba([features])[0].max()
        
        if prediction > best_score:
            if best_worker:
                alternatives.append({
                    "workerId": best_worker['worker_id'],
                    "score": best_score,
                    "reasoning": generate_reasoning(best_worker, best_score)
                })
            best_worker = worker
            best_score = prediction
        else:
            alternatives.append({
                "workerId": worker['worker_id'],
                "score": prediction,
                "reasoning": generate_reasoning(worker, prediction)
            })
    
    return jsonify({
        "bestWorkerId": best_worker['worker_id'],
        "confidence": confidence,
        "reasoning": generate_reasoning(best_worker, best_score),
        "alternativeWorkers": alternatives[:3],  # Top 3 alternatives
        "predictedCompletionTime": predict_completion_time(best_worker, task_requirements),
        "predictedSuccessRate": best_score
    })

def prepare_features(worker, task_requirements):
    """Prepare features for your ML model"""
    return [
        worker.get('performance_score', 0),
        worker.get('skill_engine_assembly', 0),
        worker.get('skill_painting_finishing', 0),
        worker.get('skill_ev_battery_assembly', 0),
        worker.get('skill_ckd_kitting', 0),
        worker.get('skill_quality_inspection', 0),
        worker.get('years_experience', 0),
        worker.get('recent_accuracy_avg', 0),
        task_requirements.get('task_complexity', 0),
        task_requirements.get('duration_hours', 0),
        # Add more features as needed
    ]

def generate_reasoning(worker, score):
    """Generate human-readable reasoning for the prediction"""
    reasons = []
    
    if worker.get('performance_score', 0) > 90:
        reasons.append(f"High performance score ({worker['performance_score']}%)")
    
    if worker.get('recent_accuracy_avg', 0) > 0.95:
        reasons.append(f"Excellent accuracy ({worker['recent_accuracy_avg']*100:.1f}%)")
    
    # Add more reasoning logic based on your model's features
    
    return ". ".join(reasons) + "."

if __name__ == '__main__':
    app.run(debug=True, port=8000)
```

## Environment Variables for Frontend

Add to your `.env.local`:
```env
VITE_ML_API_URL=http://localhost:8000
```

## Integration Steps

1. **Start ML Server**: Your friend runs the ML API server on port 8000
2. **Update Frontend**: Add the ML API URL to environment variables
3. **Test Integration**: Use the AI recommendations in the dashboard
4. **Deploy**: Deploy both frontend and ML API to production

## Docker Setup (Optional)

### ML API Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "app.py"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  ml-api:
    build: ./ml-api
    ports:
      - "8000:8000"
    environment:
      - FLASK_ENV=production
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_ML_API_URL=http://ml-api:8000
    depends_on:
      - ml-api
```

## Testing the Integration

1. Start your ML server: `python app.py`
2. Update `.env.local` with ML API URL
3. Restart your frontend: `npm run dev`
4. Go to Manager Dashboard and click "Get AI Recommendations"

The system will now use your friend's ML model to make intelligent worker recommendations! 🚀
