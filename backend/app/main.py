from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import os
import sys

# Get the directory where this file is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Import from the same directory
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import model as model_module
import database as database_module

app = FastAPI(title="Food Freshness Detection API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model and database with proper paths
model_path = os.path.join(os.path.dirname(current_dir), 'models', 'best_model.pth')
model_instance = model_module.FreshnessPredictionModel(model_path)

db_path = os.path.join(os.path.dirname(current_dir), 'database', 'predictions.db')
db = database_module.Database(db_path)

class PredictionResponse(BaseModel):
    food_type: str
    freshness_category: str
    freshness_percentage: float
    confidence: float
    estimated_days_remaining: int
    storage_recommendation: str
    timestamp: str

class HistoryItem(BaseModel):
    id: int
    food_type: str
    freshness_category: str
    freshness_percentage: float
    confidence: float
    estimated_days_remaining: int
    timestamp: str

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    db.initialize()
    print("✓ Database initialized")
    print("✓ Model loaded")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "active",
        "message": "Food Freshness Detection API",
        "version": "1.0.0"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_freshness(file: UploadFile = File(...)):
    """
    Predict food freshness from uploaded image
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        contents = await file.read()
        
        # Get prediction
        prediction = model_instance.predict(contents)
        
        # Save to database
        db.add_prediction(
            food_type=prediction['food_type'],
            freshness_category=prediction['freshness_category'],
            freshness_percentage=prediction['freshness_percentage'],
            confidence=prediction['confidence'],
            estimated_days_remaining=prediction['estimated_days_remaining']
        )
        
        return PredictionResponse(
            food_type=prediction['food_type'],
            freshness_category=prediction['freshness_category'],
            freshness_percentage=prediction['freshness_percentage'],
            confidence=prediction['confidence'],
            estimated_days_remaining=prediction['estimated_days_remaining'],
            storage_recommendation=prediction['storage_recommendation'],
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/history", response_model=List[HistoryItem])
async def get_history(limit: int = 20):
    """
    Get prediction history
    """
    try:
        history = db.get_history(limit=limit)
        return [
            HistoryItem(
                id=item['id'],
                food_type=item['food_type'],
                freshness_category=item['freshness_category'],
                freshness_percentage=item['freshness_percentage'],
                confidence=item['confidence'],
                estimated_days_remaining=item['estimated_days_remaining'],
                timestamp=item['timestamp']
            )
            for item in history
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/history/{prediction_id}")
async def delete_history_item(prediction_id: int):
    """
    Delete a specific history item
    """
    try:
        db.delete_prediction(prediction_id)
        return {"message": "History item deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/history")
async def clear_history():
    """
    Clear all history
    """
    try:
        db.clear_history()
        return {"message": "History cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stats")
async def get_statistics():
    """
    Get overall statistics
    """
    try:
        stats = db.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)