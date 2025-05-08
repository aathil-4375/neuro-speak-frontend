import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PatientLastSessionChart = ({ sessionData }) => {
  const { session, phonemeData } = sessionData;
  
  if (!phonemeData || phonemeData.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600">No phoneme data available for the last session</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Last Session Performance</h3>
      <p className="text-gray-600 mb-6">
        Session Date: {session.date} • Duration: {session.duration} • Words Practiced: {session.total_words}
      </p>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={phonemeData}
            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="phoneme" 
              tick={{ fill: '#4B5563' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fill: '#4B5563' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Accuracy']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="accuracy" 
              fill="#312E81" 
              radius={[4, 4, 0, 0]}
              name="Accuracy"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center mt-6 gap-8">
        <div className="text-center">
          <p className="text-4xl font-bold text-indigo-900">{session.average_accuracy}%</p>
          <p className="text-sm text-gray-500">Average Accuracy</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-green-600">{session.total_words}</p>
          <p className="text-sm text-gray-500">Words Practiced</p>
        </div>
      </div>
    </div>
  );
};

export default PatientLastSessionChart;