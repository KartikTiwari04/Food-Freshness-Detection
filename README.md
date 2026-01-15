# 🥗 Food Freshness Detector

An AI-powered web application that analyzes fruits and vegetables to determine their freshness level, helping reduce food waste and ensure food quality.

![Food Freshness Detector](https://img.shields.io/badge/AI-Powered-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-teal)
![PyTorch](https://img.shields.io/badge/PyTorch-2.1.0-orange)

## 🎯 About

Food Freshness Detector uses deep learning to analyze food images and provide real-time freshness analysis. Built with React and FastAPI, it features an intuitive interface for uploading images or capturing photos directly from your camera.

## ⚡ Technologies

**Frontend:**
- React.js
- Tailwind CSS
- Axios
- Lucide React Icons
- Vite

**Backend:**
- FastAPI
- PyTorch
- MobileNetV2 (Transfer Learning)
- SQLite
- Pillow

## 🚀 Features

Here's what you can do with Food Freshness Detector:

- **Upload Images:** Drag and drop or select food images for instant analysis
- **Live Camera:** Capture real-time photos of food items using your device camera
- **AI Analysis:** Get freshness percentage (0-100%), confidence score, and category classification
- **Smart Predictions:** Estimates remaining shelf life in days
- **Storage Tips:** Receive personalized storage recommendations for each food type
- **History Tracking:** View past analyses with detailed metrics and timestamps
- **Statistics Dashboard:** Monitor overall freshness trends and most analyzed items

## 📸 Screenshots
<img width="1470" height="956" alt="Screenshot 2026-01-15 at 8 52 03 PM" src="https://github.com/user-attachments/assets/659d41e1-90c6-4c9b-bd2b-41721edb0d9d" />

## 📊 The Process

I started by collecting a dataset of fresh and rotten fruits/vegetables. Then, I focused on building a robust machine learning pipeline using transfer learning with MobileNetV2.

Next, I created a FastAPI backend to handle image processing and predictions. This was important for real-time analysis.

I implemented a React frontend with features like image upload, camera capture, and results visualization. The interface needed to be clean and intuitive.

To ensure accuracy, I fine-tuned the model on the custom dataset with data augmentation techniques. I also added SQLite for storing analysis history.

Finally, I integrated all components and tested with various food items to ensure reliable predictions across different lighting conditions and angles.

## 💡 What I Learned

During this project, I've developed important skills and gained a deeper understanding of full-stack ML development:

**🧠 Machine Learning:**
- **Transfer Learning:** Using pre-trained MobileNetV2 taught me how to leverage existing models for custom tasks
- **Model Optimization:** I learned to balance accuracy and inference speed for real-time applications
- **Data Augmentation:** Understanding how to improve model robustness with limited training data

**🔧 Backend Development:**
- **FastAPI:** Building efficient RESTful APIs with automatic documentation and async support
- **Image Processing:** Working with PIL and PyTorch for preprocessing and transformations

**⚛️ Frontend Development:**
- **React Hooks:** Managing state and side effects in functional components
- **Camera API:** Implementing browser media access for real-time image capture
- **Responsive Design:** Creating mobile-friendly interfaces with Tailwind CSS

**📊 Full Stack Integration:**
- **API Communication:** Connecting frontend and backend with proper error handling
- **Database Design:** Storing and retrieving historical data efficiently
- **User Experience:** Each part of this project helped me understand how to build production-ready ML applications with focus on user experience and performance

## 🎨 How can it be improved?

- Add support for more food categories (meat, dairy, grains)
- Implement batch processing for multiple items
- Add multilingual support for global accessibility
- Include nutritional information alongside freshness data
- Create mobile apps (iOS & Android) using React Native
- Add user accounts and cloud sync for history
- Implement push notifications for expiring items
- Add barcode scanning for packaged foods

## 🏃 Running the Project

To run the project in your local environment, follow these steps:

1. Clone the repository to your local machine
2. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Train the model (or use pre-trained):
   ```bash
   python train_model_fast.py
   ```
4. Start the backend server:
   ```bash
   cd app
   python3 main.py
   ```
5. In a new terminal, navigate to frontend and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
7. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app

## 📹 Video

https://github.com/user-attachments/assets/2f9a565e-d898-4dc5-921b-f0809fd0e212

---


Built with ❤️ using AI & Machine Learning
