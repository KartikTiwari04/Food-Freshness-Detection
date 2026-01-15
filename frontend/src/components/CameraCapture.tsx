import React, { useState, useRef, useEffect } from 'react';
import { Camera, StopCircle, RotateCw, Aperture, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function CameraCapture({ onPrediction, loading, setLoading }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Set video source when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      setDebugInfo('Stream assigned to video element');
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      setDebugInfo('Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false,
      });

      setDebugInfo(`Camera stream obtained. Tracks: ${mediaStream.getTracks().length}`);
      
      // Set stream first
      setStream(mediaStream);
      setIsCameraActive(true);

    } catch (error) {
      console.error('Camera error:', error);
      setError(`Camera Error: ${error.name} - ${error.message}`);
      setDebugInfo(`Error: ${error.name}`);
      
      if (error.name === 'NotAllowedError') {
        alert('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera found on this device.');
      } else if (error.name === 'NotReadableError') {
        alert('Camera is already in use by another application.');
      } else {
        alert(`Cannot access camera: ${error.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setIsCameraActive(false);
      setDebugInfo('Camera stopped');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      setDebugInfo(`Video dimensions: ${video.videoWidth}x${video.videoHeight}, readyState: ${video.readyState}`);
      
      if (video.readyState < 2) {
        alert('Video not ready. Please wait a moment and try again.');
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert('Video dimensions are zero. Camera may not be working properly.');
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(imageDataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setTimeout(() => startCamera(), 100);
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setLoading(true);
    
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'camera-capture.jpg');

      const result = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });
      
      if (!result.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const data = await result.json();
      onPrediction(data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Live Camera Capture
      </h2>

      <div className="space-y-4">
        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-xs">
            Debug: {debugInfo}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {!isCameraActive && !capturedImage && (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Click to start camera
            </p>
            <button
              onClick={startCamera}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Start Camera
            </button>
          </div>
        )}

        {isCameraActive && !capturedImage && (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  setDebugInfo(`Video metadata loaded: ${e.target.videoWidth}x${e.target.videoHeight}`);
                }}
                onPlaying={() => {
                  setDebugInfo('Video is now playing');
                }}
                onError={(e) => {
                  setError(`Video error: ${e.target.error?.message || 'Unknown error'}`);
                }}
                className="w-full h-auto"
                style={{ 
                  minHeight: '400px',
                  maxHeight: '600px',
                  objectFit: 'contain',
                  backgroundColor: '#000'
                }}
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <button
                  onClick={captureImage}
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors shadow-lg"
                  title="Capture"
                >
                  <Aperture className="w-8 h-8" />
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors shadow-lg"
                  title="Stop"
                >
                  <StopCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              If you see a black screen, check browser console (F12) for errors
            </p>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full rounded-lg"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
            <div className="flex space-x-4">
              <button
                onClick={retakePhoto}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Retake Photo
              </button>
              <button
                onClick={analyzeImage}
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {loading ? 'Analyzing...' : 'Analyze Freshness'}
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Camera tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Hold device steady</li>
          <li>• Ensure good lighting</li>
          <li>• Center the food item</li>
          <li>• Avoid shadows</li>
        </ul>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-1 text-sm">Troubleshooting:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Check if camera permission is granted</li>
          <li>• Close other apps using the camera</li>
          <li>• Try refreshing the page</li>
          <li>• Test in Chrome/Firefox if using Safari</li>
        </ul>
      </div>
    </div>
  );
}

export default CameraCapture;