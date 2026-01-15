import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import os

class Database:
    """SQLite database for storing prediction history"""
    
    def __init__(self, db_path=None):
        if db_path is None:
            # Create database in backend/database/ directory
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_path = os.path.join(backend_dir, 'database', 'predictions.db')
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def initialize(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                food_type TEXT NOT NULL,
                freshness_category TEXT NOT NULL,
                freshness_percentage REAL NOT NULL,
                confidence REAL NOT NULL,
                estimated_days_remaining INTEGER NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_prediction(self, food_type: str, freshness_category: str, 
                      freshness_percentage: float, confidence: float,
                      estimated_days_remaining: int) -> int:
        """Add a new prediction to the database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO predictions 
            (food_type, freshness_category, freshness_percentage, 
             confidence, estimated_days_remaining)
            VALUES (?, ?, ?, ?, ?)
        ''', (food_type, freshness_category, freshness_percentage, 
              confidence, estimated_days_remaining))
        
        prediction_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return prediction_id
    
    def get_history(self, limit: int = 20) -> List[Dict]:
        """Get prediction history"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM predictions 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def get_prediction(self, prediction_id: int) -> Optional[Dict]:
        """Get a specific prediction by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM predictions WHERE id = ?
        ''', (prediction_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        return dict(row) if row else None
    
    def delete_prediction(self, prediction_id: int):
        """Delete a specific prediction"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            DELETE FROM predictions WHERE id = ?
        ''', (prediction_id,))
        
        conn.commit()
        conn.close()
    
    def clear_history(self):
        """Clear all prediction history"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM predictions')
        
        conn.commit()
        conn.close()
    
    def get_statistics(self) -> Dict:
        """Get overall statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Total predictions
        cursor.execute('SELECT COUNT(*) as total FROM predictions')
        total = cursor.fetchone()['total']
        
        # Fresh vs Spoiled count
        cursor.execute('''
            SELECT freshness_category, COUNT(*) as count 
            FROM predictions 
            GROUP BY freshness_category
        ''')
        category_counts = {row['freshness_category']: row['count'] 
                          for row in cursor.fetchall()}
        
        # Most analyzed foods
        cursor.execute('''
            SELECT food_type, COUNT(*) as count 
            FROM predictions 
            GROUP BY food_type 
            ORDER BY count DESC 
            LIMIT 5
        ''')
        top_foods = [{'food': row['food_type'], 'count': row['count']} 
                    for row in cursor.fetchall()]
        
        # Average freshness
        cursor.execute('''
            SELECT AVG(freshness_percentage) as avg_freshness 
            FROM predictions
        ''')
        avg_freshness = cursor.fetchone()['avg_freshness'] or 0
        
        conn.close()
        
        return {
            'total_predictions': total,
            'category_counts': category_counts,
            'top_analyzed_foods': top_foods,
            'average_freshness': round(avg_freshness, 2)
        }