import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms, models
from PIL import Image
import os
from pathlib import Path
import json
from tqdm import tqdm
import numpy as np
from sklearn.model_selection import train_test_split

class FoodFreshnessDataset(Dataset):
    """Custom Dataset for Food Freshness Detection"""
    
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert('RGB')
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
        
        return image, label

def load_dataset(dataset_path):
    """
    Load dataset from the Fruits_Vegetables_Dataset structure
    Returns: image_paths, labels, class_to_idx, idx_to_class
    """
    image_paths = []
    labels = []
    class_names = []
    
    dataset_path = Path(dataset_path)
    
    # Iterate through Fruits and Vegetables folders
    for category in ['Fruits', 'Vegetables']:
        category_path = dataset_path / category
        if not category_path.exists():
            continue
        
        # Get all subdirectories (e.g., FreshApple, RottenApple)
        for class_folder in sorted(category_path.iterdir()):
            if class_folder.is_dir():
                class_name = class_folder.name
                if class_name not in class_names:
                    class_names.append(class_name)
                
                # Get all images in this class folder
                for img_file in class_folder.glob('*'):
                    if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                        image_paths.append(str(img_file))
                        labels.append(class_names.index(class_name))
    
    # Create mappings
    class_to_idx = {name: idx for idx, name in enumerate(class_names)}
    idx_to_class = {idx: name for name, idx in class_to_idx.items()}
    
    print(f"Found {len(class_names)} classes: {class_names}")
    print(f"Total images: {len(image_paths)}")
    
    return image_paths, labels, class_to_idx, idx_to_class

def get_transforms():
    """Define data augmentation and normalization"""
    
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

def create_model(num_classes):
    """Create MobileNetV2 model with custom classifier"""
    
    # Load pre-trained MobileNetV2
    model = models.mobilenet_v2(pretrained=True)
    
    # Freeze early layers
    for param in model.features[:10].parameters():
        param.requires_grad = False
    
    # Replace classifier
    num_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(num_features, num_classes)
    )
    
    return model

def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    pbar = tqdm(dataloader, desc='Training')
    for images, labels in pbar:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
        
        pbar.set_postfix({'loss': running_loss/len(dataloader), 
                         'acc': 100.*correct/total})
    
    return running_loss/len(dataloader), 100.*correct/total

def validate(model, dataloader, criterion, device):
    """Validate the model"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in tqdm(dataloader, desc='Validation'):
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    
    return running_loss/len(dataloader), 100.*correct/total

def main():
    # Configuration
    DATASET_PATH = "/Users/kartiktiwari/Desktop/Project/FreshnessDetector/Fruits_Vegetables_Dataset"
    MODEL_SAVE_PATH = 'backend/models'
    BATCH_SIZE = 64  # Increased for faster training
    EPOCHS = 10  # Reduced from 20 to 10
    LEARNING_RATE = 0.001
    EARLY_STOPPING_PATIENCE = 3  # Stop if no improvement for 3 epochs
    
    # Create model directory
    os.makedirs(MODEL_SAVE_PATH, exist_ok=True)
    
    # Set device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load dataset
    print("Loading dataset...")
    image_paths, labels, class_to_idx, idx_to_class = load_dataset(DATASET_PATH)
    
    # Split dataset
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        image_paths, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    print(f"Training samples: {len(train_paths)}")
    print(f"Validation samples: {len(val_paths)}")
    
    # Get transforms
    train_transform, val_transform = get_transforms()
    
    # Create datasets
    train_dataset = FoodFreshnessDataset(train_paths, train_labels, train_transform)
    val_dataset = FoodFreshnessDataset(val_paths, val_labels, val_transform)
    
    # Create dataloaders
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, 
                            shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, 
                          shuffle=False, num_workers=4)
    
    # Create model
    num_classes = len(class_to_idx)
    model = create_model(num_classes).to(device)
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', 
                                                     factor=0.5, patience=3)
    
    # Training loop
    best_val_acc = 0.0
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
    
    print("\nStarting training...")
    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch+1}/{EPOCHS}")
        
        train_loss, train_acc = train_epoch(model, train_loader, criterion, 
                                          optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        # Update learning rate
        scheduler.step(val_loss)
        
        # Save history
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'class_to_idx': class_to_idx,
                'idx_to_class': idx_to_class
            }, os.path.join(MODEL_SAVE_PATH, 'best_model.pth'))
            print(f"✓ Saved best model with accuracy: {val_acc:.2f}%")
    
    # Save final model
    torch.save({
        'model_state_dict': model.state_dict(),
        'class_to_idx': class_to_idx,
        'idx_to_class': idx_to_class
    }, os.path.join(MODEL_SAVE_PATH, 'final_model.pth'))
    
    # Save class mappings
    with open(os.path.join(MODEL_SAVE_PATH, 'class_mapping.json'), 'w') as f:
        json.dump({
            'class_to_idx': class_to_idx,
            'idx_to_class': idx_to_class
        }, f, indent=2)
    
    # Save training history
    with open(os.path.join(MODEL_SAVE_PATH, 'training_history.json'), 'w') as f:
        json.dump(history, f, indent=2)
    
    print(f"\n✓ Training completed!")
    print(f"Best validation accuracy: {best_val_acc:.2f}%")
    print(f"Models saved to: {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    main()