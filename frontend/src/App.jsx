import React, { useState } from 'react';
import { Upload, Camera, History, TrendingUp } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import CameraCapture from './components/CameraCapture';
import AnalysisResult from './components/AnalysisResult';
import AnalysisHistory from './components/AnalysisHistory';
import Statistics from './components/Statistics';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyUpdate, setHistoryUpdate] = useState(0);

  const handlePrediction = (predictionResult) => {
    setResult(predictionResult);
    setHistoryUpdate(prev => prev + 1);
  };

  const handleNewAnalysis = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Food Freshness Detector
                </h1>
                <p className="text-sm text-gray-500">
                  AI-powered freshness analysis system
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-5 h-5 mx-auto mb-1" />
              Upload Image
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'camera'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera className="w-5 h-5 mx-auto mb-1" />
              Live Camera
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-5 h-5 mx-auto mb-1" />
              History
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-5 h-5 mx-auto mb-1" />
              Statistics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input */}
          <div className="lg:col-span-2">
            {activeTab === 'upload' && (
              <ImageUpload
                onPrediction={handlePrediction}
                loading={loading}
                setLoading={setLoading}
              />
            )}
            {activeTab === 'camera' && (
              <CameraCapture
                onPrediction={handlePrediction}
                loading={loading}
                setLoading={setLoading}
              />
            )}
            {activeTab === 'history' && (
              <AnalysisHistory historyUpdate={historyUpdate} />
            )}
            {activeTab === 'stats' && (
              <Statistics />
            )}
          </div>

          {/* Right Panel - Results */}
          {(activeTab === 'upload' || activeTab === 'camera') && (
            <div className="lg:col-span-1">
              <AnalysisResult
                result={result}
                loading={loading}
                onNewAnalysis={handleNewAnalysis}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Food Freshness Detection System - Powered by AI & Machine Learning
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;