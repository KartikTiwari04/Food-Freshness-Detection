import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import json
import os

class FreshnessPredictionModel:
    """Model for predicting food freshness"""
    
    def __init__(self, model_path):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = self._load_model(model_path)
        self.transform = self._get_transform()
        self.class_mapping = self._load_class_mapping()
        
        # Storage recommendations for different food types
        self.storage_recommendations = {
            'apple': 'Store in refrigerator crisper drawer. Can last 4-6 weeks when refrigerated.',
            'banana': 'Store at room temperature away from direct sunlight. Refrigerate only when ripe to extend shelf life.',
            'mango': 'Store unripe mangoes at room temperature. Once ripe, refrigerate for up to 5 days.',
            'orange': 'Store in refrigerator or cool, dry place. Can last 2-4 weeks when refrigerated.',
            'strawberry': 'Store in refrigerator, unwashed. Wash just before eating. Best consumed within 3-7 days.',
            'bellpepper': 'Store in refrigerator crisper drawer in a plastic bag. Can last 1-2 weeks.',
            'carrot': 'Store in refrigerator in a plastic bag. Remove greens before storing. Can last 3-4 weeks.',
            'cucumber': 'Store in refrigerator crisper drawer. Best consumed within 1 week.',
            'potato': 'Store in cool, dark, dry place. Do not refrigerate. Can last several weeks.',
            'tomato': 'Store ripe tomatoes at room temperature away from sunlight. Refrigerate only if overripe.'
        }
    
    def _load_model(self, model_path):
        """Load the trained model"""
        checkpoint = torch.load(model_path, map_location=self.device)
        
        # Get number of classes
        if 'idx_to_class' in checkpoint:
            num_classes = len(checkpoint['idx_to_class'])
        else:
            # Load from class_mapping.json
            mapping_path = os.path.join(os.path.dirname(model_path), 'class_mapping.json')
            with open(mapping_path, 'r') as f:
                mapping = json.load(f)
                num_classes = len(mapping['idx_to_class'])
        
        # Create model architecture
        model = models.mobilenet_v2(pretrained=False)
        num_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(num_features, num_classes)
        )
        
        # Load weights
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(self.device)
        model.eval()
        
        return model
    
    def _get_transform(self):
        """Get image transformation pipeline"""
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
    
    def _load_class_mapping(self):
        """Load class to index mapping"""
        # Try to load from the model checkpoint first
        model_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(model_dir, '..', 'models')
        mapping_path = os.path.join(model_dir, 'class_mapping.json')
        
        with open(mapping_path, 'r') as f:
            mapping = json.load(f)
        
        return mapping['idx_to_class']
    
    def _extract_food_info(self, class_name):
        """Extract food type and freshness from class name"""
        # Class names are like: FreshApple, RottenBanana, etc.
        if class_name.startswith('Fresh'):
            freshness = 'Fresh'
            food_type = class_name[5:].lower()
        elif class_name.startswith('Rotten'):
            freshness = 'Rotten'
            food_type = class_name[6:].lower()
        else:
            freshness = 'Unknown'
            food_type = class_name.lower()
        
        return food_type, freshness
    
    def _calculate_freshness_percentage(self, freshness_category, confidence):
        """Calculate freshness percentage based on category and confidence"""
        if freshness_category == 'Fresh':
            # Fresh: 70-100% based on confidence
            return 70 + (confidence * 30)
        elif freshness_category == 'Moderately Fresh':
            # Moderately Fresh: 40-70%
            return 40 + (confidence * 30)
        else:  # Rotten
            # Rotten: 0-40% based on confidence
            return (1 - confidence) * 40
    
    def _estimate_days_remaining(self, food_type, freshness_percentage):
        """Estimate days until spoilage based on food type and freshness"""
        # Base days for fresh produce
        base_days = {
            'apple': 30,
            'banana': 5,
            'mango': 7,
            'orange': 14,
            'strawberry': 5,
            'bellpepper': 10,
            'carrot': 21,
            'cucumber': 7,
            'potato': 42,
            'tomato': 7
        }
        
        base = base_days.get(food_type, 7)
        
        # Scale based on freshness percentage
        if freshness_percentage >= 70:
            return int(base * (freshness_percentage / 100))
        elif freshness_percentage >= 40:
            return int(base * 0.3 * (freshness_percentage / 100))
        else:
            return 0
    
    def predict(self, image_bytes):
        """
        Predict freshness from image bytes
        Returns: dict with prediction results
        """
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Transform image
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Get prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted_idx = torch.max(probabilities, 1)
                
                confidence = confidence.item()
                predicted_idx = predicted_idx.item()
            
            # Get class name
            predicted_class = self.class_mapping[str(predicted_idx)]
            
            # Extract food type and freshness
            food_type, freshness = self._extract_food_info(predicted_class)
            
            # Determine freshness category
            if freshness == 'Fresh':
                freshness_category = 'Fresh'
            elif freshness == 'Rotten':
                if confidence > 0.7:
                    freshness_category = 'Spoiled'
                else:
                    freshness_category = 'Moderately Fresh'
            else:
                freshness_category = 'Unknown'
            
            # Calculate freshness percentage
            freshness_percentage = self._calculate_freshness_percentage(
                freshness_category, confidence
            )
            
            # Estimate days remaining
            estimated_days = self._estimate_days_remaining(
                food_type, freshness_percentage
            )
            
            # Get storage recommendation
            storage_recommendation = self.storage_recommendations.get(
                food_type,
                'Store in a cool, dry place away from direct sunlight.'
            )
            
            return {
                'food_type': food_type.capitalize(),
                'freshness_category': freshness_category,
                'freshness_percentage': round(freshness_percentage, 2),
                'confidence': round(confidence * 100, 2),
                'estimated_days_remaining': estimated_days,
                'storage_recommendation': storage_recommendation,
                'predicted_class': predicted_class
            }
        
        except Exception as e:
            raise Exception(f"Prediction failed: {str(e)}")