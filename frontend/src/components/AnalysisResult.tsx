import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Calendar, Info, RefreshCw } from 'lucide-react';

function AnalysisResult({ result, loading, onNewAnalysis }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="animate-spin h-12 w-12 text-green-500 mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">Analyzing image...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <Info className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            Upload or capture an image to see analysis results
          </p>
        </div>
      </div>
    );
  }

  const getFreshnessColor = (category) => {
    switch (category) {
      case 'Fresh':
        return 'text-green-600';
      case 'Moderately Fresh':
        return 'text-yellow-600';
      case 'Spoiled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFreshnessIcon = (category) => {
    switch (category) {
      case 'Fresh':
        return <CheckCircle className="w-8 h-8" />;
      case 'Moderately Fresh':
        return <AlertCircle className="w-8 h-8" />;
      case 'Spoiled':
        return <XCircle className="w-8 h-8" />;
      default:
        return <Info className="w-8 h-8" />;
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
        <button
          onClick={onNewAnalysis}
          className="text-green-600 hover:text-green-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Food Type */}
      <div className="text-center pb-4 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800">{result.food_type}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(result.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Freshness Status */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center ${getFreshnessColor(result.freshness_category)} mb-2`}>
          {getFreshnessIcon(result.freshness_category)}
        </div>
        <h4 className={`text-xl font-semibold ${getFreshnessColor(result.freshness_category)}`}>
          {result.freshness_category}
        </h4>
      </div>

      {/* Freshness Percentage */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Freshness Score
          </span>
          <span className="text-sm font-bold text-gray-900">
            {result.freshness_percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getProgressBarColor(
              result.freshness_percentage
            )}`}
            style={{ width: `${result.freshness_percentage}%` }}
          />
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Confidence</span>
          <span className="text-lg font-semibold text-gray-900">
            {result.confidence}%
          </span>
        </div>
      </div>

      {/* Estimated Days */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Estimated Days Remaining
            </p>
            <p className="text-2xl font-bold text-blue-900">
              {result.estimated_days_remaining} {result.estimated_days_remaining === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      </div>

      {/* Storage Recommendation */}
      <div className="bg-green-50 rounded-lg p-4">
        <h5 className="text-sm font-medium text-green-900 mb-2">
          Storage Recommendation
        </h5>
        <p className="text-sm text-green-800">
          {result.storage_recommendation}
        </p>
      </div>

      {/* Action based on freshness */}
      {result.freshness_category === 'Spoiled' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ This item appears to be spoiled. Consider discarding it to avoid health risks.
          </p>
        </div>
      )}

      {result.freshness_category === 'Moderately Fresh' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">
            ⚡ This item should be consumed soon or consider cooking it to extend its usability.
          </p>
        </div>
      )}

      {result.freshness_category === 'Fresh' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">
            ✓ This item is fresh and safe to consume!
          </p>
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;