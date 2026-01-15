import React, { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

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

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-center text-gray-500">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Statistics Overview</h2>
          <button
            onClick={fetchStatistics}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total Predictions Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">Total Analyses</p>
            <p className="text-4xl font-bold">{stats.total_predictions}</p>
          </div>
          <TrendingUp className="w-12 h-12 text-green-200" />
        </div>
      </div>

      {/* Average Freshness Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Average Freshness</h3>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-blue-600">
            {stats.average_freshness}%
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                stats.average_freshness >= 70
                  ? 'bg-green-500'
                  : stats.average_freshness >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${stats.average_freshness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <PieChart className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Freshness Distribution
          </h3>
        </div>
        <div className="space-y-4">
          {Object.entries(stats.category_counts).map(([category, count]) => {
            const percentage = stats.total_predictions > 0 
              ? ((count / stats.total_predictions) * 100).toFixed(1)
              : 0;
            const color = category === 'Fresh' 
              ? 'bg-green-500' 
              : category === 'Moderately Fresh'
              ? 'bg-yellow-500'
              : 'bg-red-500';

            return (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {category}
                  </span>
                  <span className="text-sm text-gray-600">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Analyzed Foods */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Most Analyzed Foods
        </h3>
        {stats.top_analyzed_foods.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No data available</p>
        ) : (
          <div className="space-y-3">
            {stats.top_analyzed_foods.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{item.food}</span>
                </div>
                <span className="text-gray-600 font-semibold">
                  {item.count} {item.count === 1 ? 'time' : 'times'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 Insights
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {stats.total_predictions === 0 ? (
            <li>Start analyzing food to see insights here!</li>
          ) : (
            <>
              <li>
                • You've analyzed {stats.total_predictions} food items so far
              </li>
              {stats.average_freshness >= 70 && (
                <li>• Great job! Most of your food items are fresh</li>
              )}
              {stats.average_freshness < 50 && (
                <li>• Consider checking food more frequently to reduce waste</li>
              )}
              {stats.top_analyzed_foods[0] && (
                <li>
                  • {stats.top_analyzed_foods[0].food} is your most analyzed item
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Statistics;