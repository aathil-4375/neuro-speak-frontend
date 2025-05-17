import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { X, RefreshCw } from 'lucide-react';

// Simple fetch wrapper for API calls
const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  const url = `${baseUrl}${endpoint}`;
  
  // Add auth token to headers if available
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

const SpeechAnalyticsModal = ({ patientData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  
  useEffect(() => {
    if (patientData?.patient?.patient_id) {
      fetchGraphData(patientData.patient.patient_id);
    }
  }, [patientData]);
  
  const fetchGraphData = async (patientId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the backend API endpoint for graph data
      const data = await apiRequest(`/progress/patient/${patientId}/summary/`);
      setGraphData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching graph data:', err);
      setError('Failed to load analytics data');
      setLoading(false);
    }
  };

  // Generate accuracy trend data from sessions
  const generateAccuracyTrendData = () => {
    // Use the data returned from API if available, otherwise use data passed as prop
    const data = graphData || patientData;
    
    if (!data?.recentSessions || data.recentSessions.length < 5) {
      // Return empty array if we don't have enough real data
      return [];
    }

    // Use real session data
    return data.recentSessions
      .slice(0, 10) // Take up to 10 most recent sessions
      .reverse() // Reverse to get chronological order
      .map((session, index) => ({
        name: `Session ${(index + 1) * 4}`,
        accuracy: session.accuracy
      }));
  };

  // Generate data for performance by phoneme
  const getPhonemePerformanceData = () => {
    // Use the data returned from API if available, otherwise use data passed as prop
    const data = graphData || patientData;
    
    if (!data?.phonemeProgress) {
      // Return empty array if we don't have phoneme progress data
      return [];
    }
    
    return data.phonemeProgress
      .filter(p => p.status !== 'not-started')
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 6)
      .map((phoneme) => ({
        id: phoneme.id,
        name: `Chapter ${phoneme.id}`,
        phoneme: phoneme.phoneme,
        accuracy: phoneme.accuracy,
        status: phoneme.status
      }));
  };

  // Data for pie chart showing mastery status
  const getMasteryPieData = () => {
    // Use the data returned from API if available, otherwise use data passed as prop
    const data = graphData || patientData;
    
    if (!data?.statistics) {
      // Return data with zeros if no statistics are available
      return [
        { name: 'Mastered', value: 0, color: '#4386F6' }, // blue
        { name: 'In Progress', value: 0, color: '#4386F6' }, // blue
        { name: 'Not Started', value: 0, color: '#E8E8E8' } // light gray
      ];
    }
    
    const completed = data.statistics.completed_phonemes || 0;
    const inProgress = data.statistics.in_progress_phonemes || 0;
    const notStarted = data.statistics.not_started_phonemes || 0;
    
    return [
      { name: 'Mastered', value: completed, color: '#4386F6' }, // blue
      { name: 'In Progress', value: inProgress, color: '#4386F6' }, // blue 
      { name: 'Not Started', value: notStarted, color: '#E8E8E8' }, // light gray
    ];
  };

  const accuracyTrendData = generateAccuracyTrendData();
  const phonemePerformanceData = getPhonemePerformanceData();
  const masteryPieData = getMasteryPieData();
  
  // Calculate mastery percentage
  const totalPhonemes = masteryPieData.reduce((sum, item) => sum + item.value, 0);
  const masteryPercentage = totalPhonemes > 0 
    ? Math.round((masteryPieData[0].value / totalPhonemes) * 100) 
    : 0;

  // Handle retry when there's an error
  const handleRetry = () => {
    if (patientData?.patient?.patient_id) {
      fetchGraphData(patientData.patient.patient_id);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg relative text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-custom-blue border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Analytics</h2>
            <p className="text-gray-600">Fetching patient speech data...</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg relative text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Analytics</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-custom-blue text-white rounded-lg flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md max-w-4xl w-full mx-4 relative max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Speech Analytics</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Phoneme Mastery */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 hidden md:block">Phoneme Mastery</h3>
              <div className="relative aspect-square flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={masteryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="85%"
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      {masteryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-gray-900">{masteryPercentage}%</div>
                  <div className="text-sm text-gray-600">Mastered</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                {masteryPieData.map((entry, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-gray-600">{entry.name}</div>
                    <div className="text-lg font-bold text-gray-900">{entry.value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Accuracy Trend */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 hidden md:block">Accuracy Trend</h3>
              <div className="h-64">
                {accuracyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={accuracyTrendData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#4F0EBA" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#4F0EBA", strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#4F0EBA", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No session data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Performance by Phoneme */}
          <div className="p-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Phoneme</h3>
            <div className="h-64">
              {phonemePerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={phonemePerformanceData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="accuracy" 
                      fill="#4386F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No phoneme progress data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechAnalyticsModal;