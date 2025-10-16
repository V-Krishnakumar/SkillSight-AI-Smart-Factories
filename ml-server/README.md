# SkillSight AI ML Prediction Server

This is the ML prediction server that integrates your trained model from Google Colab with the SkillSight AI frontend.

## Quick Setup

### 1. Copy Your Model Files
Copy your `.pkl` file from Google Colab to this directory:
```bash
# Copy your trained model file here
# Example: cp /path/to/your/model.pkl ./
```

### 2. Install Dependencies
```bash
python setup.py
```

### 3. Start the Server
```bash
python app.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and model loading status.

### Best Worker Prediction
```
POST /api/predict/best-worker
```
Predicts the best worker for a given task.

**Request Body:**
```json
{
  "taskId": "task1",
  "taskRequirements": {
    "skill_engine_assembly": 0.8,
    "skill_painting_finishing": 0.6,
    "task_complexity": 0.7,
    "duration_hours": 6
  },
  "availableWorkers": [
    {
      "worker_id": "w1",
      "name": "John Doe",
      "performance_score": 92,
      "skill_engine_assembly": 0.95,
      "years_experience": 8,
      "recent_accuracy_avg": 0.98,
      "rating_by_manager": 4.8
    }
  ]
}
```

**Response:**
```json
{
  "bestWorkerId": "w1",
  "confidence": 0.92,
  "reasoning": "High performance score (92.0%). Excellent accuracy (98.0%). Experienced worker (8 years). Strong skills in: Engine Assembly (95%). High manager rating (4.8/5).",
  "alternativeWorkers": [
    {
      "workerId": "w2",
      "score": 0.85,
      "reasoning": "Good performance score (85.0%). High accuracy (92.0%)."
    }
  ],
  "predictedCompletionTime": 5.2,
  "predictedSuccessRate": 0.92
}
```

## Customizing the Model Integration

### Feature Preparation
The `prepare_features()` function in `app.py` converts your data into the format expected by your model. You may need to modify this based on your model's input requirements:

```python
def prepare_features(worker: Dict, task_requirements: Dict) -> List[float]:
    features = []
    
    # Add worker features
    features.append(worker.get('performance_score', 0) or 0)
    features.append(worker.get('skill_engine_assembly', 0) or 0)
    # ... add more features as needed
    
    # Add task requirements
    features.append(task_requirements.get('task_complexity', 0) or 0)
    # ... add more task features
    
    return features
```

### Model Type Support
The server automatically detects whether your model is:
- **Classification**: Uses `predict_proba()` for confidence scores
- **Regression**: Uses `predict()` and normalizes scores

## Testing the Integration

### 1. Test the Server
```bash
curl http://localhost:8000/health
```

### 2. Test Worker Prediction
```bash
curl -X POST http://localhost:8000/api/predict/best-worker \
  -H "Content-Type: application/json" \
  -d '{
    "taskRequirements": {
      "skill_engine_assembly": 0.8,
      "task_complexity": 0.7
    },
    "availableWorkers": [
      {
        "worker_id": "w1",
        "performance_score": 92,
        "skill_engine_assembly": 0.95,
        "years_experience": 8,
        "recent_accuracy_avg": 0.98,
        "rating_by_manager": 4.8
      }
    ]
  }'
```

### 3. Test Frontend Integration
1. Update your `.env.local` file:
   ```env
   VITE_ML_API_URL=http://localhost:8000
   ```

2. Start your frontend:
   ```bash
   npm run dev
   ```

3. Go to Manager Dashboard → "🤖 AI Recommendations" tab
4. Click "Get AI Recommendations" on any task

## Troubleshooting

### Model Not Loading
- Make sure your `.pkl` file is in the `ml-server` directory
- Check that the file is not corrupted
- Verify the model was saved with `joblib.dump()`

### Prediction Errors
- Check the feature preparation function matches your model's input
- Ensure all required features are present in the worker data
- Look at the server logs for detailed error messages

### CORS Issues
- The server includes CORS headers for frontend integration
- If you still have issues, check your browser's network tab

## Production Deployment

For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify your model file is compatible with the feature preparation
3. Test with the provided curl commands
4. Ensure all dependencies are installed correctly
