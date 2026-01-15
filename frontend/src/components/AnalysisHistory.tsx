import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function AnalysisHistory({ historyUpdate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/history?limit=50`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [historyUpdate]);

  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`${API_URL}/history/${id}`);
      fetchHistory();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;

    try {
      await axios.delete(`${API_URL}/history`);
      fetchHistory();
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear history');
    }
  };

  const getFreshnessColor = (category) => {
    switch (category) {
      case 'Fresh':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderately Fresh':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Spoiled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-green-500"
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Analysis History ({history.length})
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchHistory}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {history.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No analysis history yet.</p>
          <p className="text-sm mt-2">Start analyzing food to build your history!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.food_type}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getFreshnessColor(
                        item.freshness_category
                      )}`}
                    >
                      {item.freshness_category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    <div>
                      <span className="text-gray-600">Freshness: </span>
                      <span className="font-semibold text-gray-900">
                        {item.freshness_percentage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence: </span>
                      <span className="font-semibold text-gray-900">
                        {item.confidence}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Days Remaining: </span>
                      <span className="font-semibold text-gray-900">
                        {item.estimated_days_remaining}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date: </span>
                      <span className="font-semibold text-gray-900">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.freshness_percentage >= 70
                        ? 'bg-green-500'
                        : item.freshness_percentage >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${item.freshness_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnalysisHistory;