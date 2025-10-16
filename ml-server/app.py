from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
from typing import Dict, List, Any

app = Flask(__name__)
CORS(app)

# Global variable to store the loaded model
model = None

def load_model():
    """Load the trained model from the pkl file"""
    global model
    try:
        # Look for the pkl file in the current directory
        pkl_files = [f for f in os.listdir('.') if f.endswith('.pkl')]
        
        if not pkl_files:
            print("No .pkl files found in the directory")
            return False
            
        # Use the first pkl file found (or you can specify the exact filename)
        model_path = pkl_files[0]
        print(f"Loading model from: {model_path}")
        
        model = joblib.load(model_path)
        print("Model loaded successfully!")
        return True
        
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def prepare_features(worker: Dict, task_requirements: Dict) -> List[float]:
    """
    Prepare features for the ML model based on worker and task data
    You may need to adjust this based on your model's input features
    """
    features = []
    
    # Worker features
    features.append(worker.get('performance_score', 0) or 0)
    features.append(worker.get('skill_engine_assembly', 0) or 0)
    features.append(worker.get('skill_painting_finishing', 0) or 0)
    features.append(worker.get('skill_ev_battery_assembly', 0) or 0)
    features.append(worker.get('skill_ckd_kitting', 0) or 0)
    features.append(worker.get('skill_quality_inspection', 0) or 0)
    features.append(worker.get('years_experience', 0) or 0)
    features.append(worker.get('recent_accuracy_avg', 0) or 0)
    features.append(worker.get('task_completion_time_avg', 0) or 0)
    features.append(worker.get('rating_by_manager', 0) or 0)
    features.append(worker.get('learning_agility', 0) or 0)
    features.append(worker.get('suitability_score', 0) or 0)
    
    # Task requirements
    features.append(task_requirements.get('skill_engine_assembly', 0) or 0)
    features.append(task_requirements.get('skill_painting_finishing', 0) or 0)
    features.append(task_requirements.get('skill_ev_battery_assembly', 0) or 0)
    features.append(task_requirements.get('skill_ckd_kitting', 0) or 0)
    features.append(task_requirements.get('skill_quality_inspection', 0) or 0)
    features.append(task_requirements.get('task_complexity', 0) or 0)
    features.append(task_requirements.get('duration_hours', 0) or 0)
    
    # Add more features as needed based on your model
    return features

def generate_reasoning(worker: Dict, score: float, task_requirements: Dict) -> str:
    """Generate human-readable reasoning for the prediction"""
    reasons = []
    
    # Performance-based reasoning
    if worker.get('performance_score', 0) > 90:
        reasons.append(f"High performance score ({worker['performance_score']:.1f}%)")
    elif worker.get('performance_score', 0) > 80:
        reasons.append(f"Good performance score ({worker['performance_score']:.1f}%)")
    
    # Accuracy-based reasoning
    if worker.get('recent_accuracy_avg', 0) > 0.95:
        reasons.append(f"Excellent accuracy ({worker['recent_accuracy_avg']*100:.1f}%)")
    elif worker.get('recent_accuracy_avg', 0) > 0.90:
        reasons.append(f"High accuracy ({worker['recent_accuracy_avg']*100:.1f}%)")
    
    # Experience-based reasoning
    if worker.get('years_experience', 0) > 5:
        reasons.append(f"Experienced worker ({worker['years_experience']} years)")
    
    # Skill match reasoning
    skill_matches = []
    if task_requirements.get('skill_engine_assembly', 0) > 0 and worker.get('skill_engine_assembly', 0) > 0.8:
        skill_matches.append(f"Engine Assembly ({worker['skill_engine_assembly']*100:.0f}%)")
    if task_requirements.get('skill_painting_finishing', 0) > 0 and worker.get('skill_painting_finishing', 0) > 0.8:
        skill_matches.append(f"Painting ({worker['skill_painting_finishing']*100:.0f}%)")
    if task_requirements.get('skill_ev_battery_assembly', 0) > 0 and worker.get('skill_ev_battery_assembly', 0) > 0.8:
        skill_matches.append(f"EV Battery ({worker['skill_ev_battery_assembly']*100:.0f}%)")
    if task_requirements.get('skill_ckd_kitting', 0) > 0 and worker.get('skill_ckd_kitting', 0) > 0.8:
        skill_matches.append(f"CKD Kitting ({worker['skill_ckd_kitting']*100:.0f}%)")
    if task_requirements.get('skill_quality_inspection', 0) > 0 and worker.get('skill_quality_inspection', 0) > 0.8:
        skill_matches.append(f"Quality Inspection ({worker['skill_quality_inspection']*100:.0f}%)")
    
    if skill_matches:
        reasons.append(f"Strong skills in: {', '.join(skill_matches)}")
    
    # Rating-based reasoning
    if worker.get('rating_by_manager', 0) > 4.5:
        reasons.append(f"High manager rating ({worker['rating_by_manager']:.1f}/5)")
    
    if not reasons:
        reasons.append("Suitable based on available metrics")
    
    return ". ".join(reasons) + "."

def predict_completion_time(worker: Dict, task_requirements: Dict) -> float:
    """Predict task completion time based on worker skills and task complexity"""
    base_time = task_requirements.get('duration_hours', 4)
    complexity = task_requirements.get('task_complexity', 0.5)
    worker_speed = 1 - (worker.get('task_completion_time_avg', 0.5) or 0.5)
    
    # Adjust time based on worker performance and task complexity
    time_multiplier = 1 + (complexity * 0.5) - (worker_speed * 0.3)
    
    return max(base_time * time_multiplier, base_time * 0.7)  # Don't go below 70% of base time

@app.route('/api/predict/best-worker', methods=['POST'])
def predict_best_worker():
    """API endpoint to predict the best worker for a task"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
            
        data = request.json
        task_requirements = data.get('taskRequirements', {})
        workers = data.get('availableWorkers', [])
        
        if not workers:
            return jsonify({"error": "No workers provided"}), 400
        
        best_worker = None
        best_score = -1
        alternatives = []
        confidence = 0
        
        for worker in workers:
            try:
                # Prepare features for your model
                features = prepare_features(worker, task_requirements)
                
                # Make prediction
                if hasattr(model, 'predict_proba'):
                    # For classification models
                    prediction = model.predict([features])[0]
                    confidence_scores = model.predict_proba([features])[0]
                    confidence = float(max(confidence_scores))
                    score = confidence
                else:
                    # For regression models
                    prediction = model.predict([features])[0]
                    score = float(prediction)
                    confidence = min(score, 1.0)  # Normalize to 0-1
                
                if score > best_score:
                    if best_worker:
                        alternatives.append({
                            "workerId": best_worker['worker_id'],
                            "score": best_score,
                            "reasoning": generate_reasoning(best_worker, best_score, task_requirements)
                        })
                    best_worker = worker
                    best_score = score
                else:
                    alternatives.append({
                        "workerId": worker['worker_id'],
                        "score": score,
                        "reasoning": generate_reasoning(worker, score, task_requirements)
                    })
                    
            except Exception as e:
                print(f"Error processing worker {worker.get('worker_id', 'unknown')}: {e}")
                continue
        
        if best_worker is None:
            return jsonify({"error": "No suitable worker found"}), 400
        
        # Sort alternatives by score (descending)
        alternatives.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            "bestWorkerId": best_worker['worker_id'],
            "confidence": confidence,
            "reasoning": generate_reasoning(best_worker, best_score, task_requirements),
            "alternativeWorkers": alternatives[:3],  # Top 3 alternatives
            "predictedCompletionTime": predict_completion_time(best_worker, task_requirements),
            "predictedSuccessRate": min(best_score, 0.95)  # Cap at 95%
        })
        
    except Exception as e:
        print(f"Error in predict_best_worker: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict/performance', methods=['POST'])
def predict_performance():
    """API endpoint to predict performance for a specific worker-task combination"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
            
        data = request.json
        worker_id = data.get('workerId')
        task_requirements = data.get('taskRequirements', {})
        
        # Find the worker (you might want to pass worker data directly)
        # For now, we'll return a mock response
        return jsonify({
            "predictedScore": 0.85,
            "confidence": 0.78,
            "riskFactors": [
                "Task complexity is high",
                "Worker has limited experience with this task type"
            ]
        })
        
    except Exception as e:
        print(f"Error in predict_performance: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict/batch-suitability', methods=['POST'])
def predict_batch_suitability():
    """API endpoint to predict suitability scores for multiple workers for a task"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
            
        data = request.json
        task_requirements = data.get('taskRequirements', {})
        workers = data.get('workers', [])
        
        if not workers:
            return jsonify({"error": "No workers provided"}), 400
        
        results = []
        
        for worker in workers:
            try:
                # Prepare features for your model
                features = prepare_features(worker, task_requirements)
                
                # Make prediction
                if hasattr(model, 'predict_proba'):
                    # For classification models
                    prediction = model.predict([features])[0]
                    confidence_scores = model.predict_proba([features])[0]
                    confidence = float(max(confidence_scores))
                    score = confidence
                else:
                    # For regression models
                    prediction = model.predict([features])[0]
                    score = float(prediction)
                    confidence = min(score, 1.0)  # Normalize to 0-1
                
                results.append({
                    "workerId": worker['worker_id'],
                    "score": score,
                    "confidence": confidence,
                    "reasoning": generate_reasoning(worker, score, task_requirements)
                })
                    
            except Exception as e:
                print(f"Error processing worker {worker.get('worker_id', 'unknown')}: {e}")
                # Add fallback result
                results.append({
                    "workerId": worker['worker_id'],
                    "score": 0.5,  # Default score
                    "confidence": 0.3,  # Low confidence
                    "reasoning": "Fallback scoring due to prediction error"
                })
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Error in predict_batch_suitability: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze/skill-gap', methods=['POST'])
def analyze_skill_gap():
    """API endpoint to analyze skill gaps for a worker"""
    try:
        data = request.json
        worker_id = data.get('workerId')
        target_skills = data.get('targetSkills', {})
        
        # Mock implementation - you can enhance this based on your model
        gaps = []
        for skill, required_level in target_skills.items():
            # This would need actual worker data to calculate gaps
            gaps.append({
                "skill": skill,
                "currentLevel": 0.7,  # Mock data
                "requiredLevel": required_level,
                "gap": required_level - 0.7
            })
        
        return jsonify({
            "gaps": gaps,
            "recommendedTraining": [
                {
                    "skill": "Advanced Technical Skills",
                    "priority": "High",
                    "estimatedHours": 12
                }
            ]
        })
        
    except Exception as e:
        print(f"Error in analyze_skill_gap: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "message": "ML API server is running"
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API information"""
    return jsonify({
        "message": "SkillSight AI ML Prediction Server",
        "version": "1.0.0",
        "endpoints": {
            "best_worker": "/api/predict/best-worker",
            "performance": "/api/predict/performance",
            "skill_gap": "/api/analyze/skill-gap",
            "health": "/health"
        },
        "model_status": "loaded" if model is not None else "not loaded"
    })

if __name__ == '__main__':
    print("Starting SkillSight AI ML Prediction Server...")
    
    # Load the model on startup
    if load_model():
        print("Server starting on http://localhost:8000")
        app.run(debug=True, host='0.0.0.0', port=8000)
    else:
        print("Failed to load model. Please check your .pkl file.")
        print("Make sure to place your .pkl file in the ml-server directory.")
