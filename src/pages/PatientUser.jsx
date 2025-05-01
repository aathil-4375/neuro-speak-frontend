// frontend/src/pages/PatientUser.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { 
  User, 
  BookOpen, 
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  Star,
  X,
  FileText,
  Download
} from 'lucide-react';
import api from '../services/api';

const PatientUser = () => {
  const [showGraph, setShowGraph] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;

  // Fetch patient data from backend
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patient?.patient_id) {
        setError('No patient information provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/progress/patient/${patient.patient_id}/summary/`);
        setPatientData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data');
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patient?.patient_id]);

  // Navigation function for phoneme click
  const handlePhonemeClick = (phonemeId) => {
    navigate(`/home/patient/chapter-${phonemeId}`, { state: { patient } });
  };

  // Generate Progress Report function
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowReport(true);
    }, 1500);
  };

  // Download report function
  const handleDownloadReport = () => {
    if (!patientData) return;
    
    // Create a new window for the printable report
    const printWindow = window.open('', '_blank');
    
    // Generate HTML content for the report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Progress Report - ${patientData.patient.full_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #26046B;
            }
            .report-title {
              font-size: 20px;
              margin-top: 10px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #26046B;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .summary-card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .summary-value {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .summary-label {
              font-size: 14px;
              color: #666;
            }
            .phoneme-row {
              display: flex;
              justify-content: space-between;
              padding: 10px;
              border-bottom: 1px solid #eee;
            }
            .phoneme-info {
              flex: 1;
            }
            .phoneme-status {
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 12px;
              margin-left: 10px;
            }
            .status-completed {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-in-progress {
              background-color: #dbeafe;
              color: #1e40af;
            }
            .status-not-started {
              background-color: #f3f4f6;
              color: #374151;
            }
            .session-row {
              display: flex;
              justify-content: space-between;
              padding: 10px;
              border-bottom: 1px solid #eee;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Speech Therapy Clinic</div>
            <div class="report-title">Patient Progress Report</div>
            <div>Generated on: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name:</span> ${patientData.patient.full_name}
              </div>
              <div class="info-item">
                <span class="info-label">Patient ID:</span> ${patientData.patient.patient_id}
              </div>
              <div class="info-item">
                <span class="info-label">Gender:</span> ${patientData.patient.gender}
              </div>
              <div class="info-item">
                <span class="info-label">First Visit:</span> ${patientData.patient.first_clinic_date}
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Summary Statistics</div>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-label">Mastered Phonemes</div>
                <div class="summary-value" style="color: #059669;">
                  ${patientData.statistics.completed_phonemes}
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-label">In Progress</div>
                <div class="summary-value" style="color: #2563eb;">
                  ${patientData.statistics.in_progress_phonemes}
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Average Accuracy</div>
                <div class="summary-value" style="color: #d97706;">
                  ${patientData.statistics.average_accuracy}%
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Phoneme Progress Details</div>
            ${patientData.phonemeProgress.map(phoneme => `
              <div class="phoneme-row">
                <div class="phoneme-info">
                  <strong>${phoneme.phoneme}</strong>
                  <span style="color: #666; margin-left: 10px;">
                    Examples: ${phoneme.exampleWords.join(', ')}
                  </span>
                </div>
                <div>
                  <span class="phoneme-status status-${phoneme.status}">
                    ${phoneme.status.replace('-', ' ')}
                  </span>
                  <span style="margin-left: 10px; font-weight: bold;">
                    ${phoneme.accuracy}%
                  </span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="section-title">Recent Practice Sessions</div>
            ${patientData.recentSessions.map(session => `
              <div class="session-row">
                <div>
                  <strong>${session.date}</strong>
                  <span style="color: #666; margin-left: 10px;">
                    ${session.duration} - ${session.phonemesPracticed.join(', ')}
                  </span>
                </div>
                <div>
                  <span style="color: #666; margin-right: 10px;">
                    ${session.wordsAttempted} words
                  </span>
                  <span style="font-weight: bold;">${session.accuracy}%</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>This report is confidential and intended only for medical purposes.</p>
            <p>© ${new Date().getFullYear()} Speech Therapy Clinic. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    // Write the HTML to the new window
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-lg text-gray-600">Loading patient data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Patient Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-custom-blue rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{patientData.patient.full_name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    ID: {patientData.patient.patient_id}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className={`px-6 py-3 bg-custom-blue text-white rounded-lg font-medium transition flex items-center space-x-2 ${
                isGenerating ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              <FileText className={`w-5 h-5 ${isGenerating ? 'animate-pulse' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Progress Report'}</span>
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Phoneme Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Phoneme Progress */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Phoneme Progress</h2>
                <span className="text-sm font-medium text-gray-500">
                  {patientData.phonemeProgress.filter(p => p.status === 'completed').length} of {patientData.phonemeProgress.length} mastered
                </span>
              </div>
              
              <div className="space-y-4">
                {patientData.phonemeProgress.map(phoneme => (
                  <div 
                    key={phoneme.id} 
                    onClick={() => handlePhonemeClick(phoneme.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      phoneme.status === 'completed' ? 'border-green-200 bg-green-50 hover:bg-green-100' :
                      phoneme.status === 'in-progress' ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' :
                      'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                          phoneme.status === 'completed' ? 'bg-green-200' :
                          phoneme.status === 'in-progress' ? 'bg-blue-200' :
                          'bg-gray-200'
                        }`}>
                          <span className="text-2xl font-bold text-gray-900">{phoneme.phoneme}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Phoneme Chapter {phoneme.id}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {phoneme.exampleWords.map((word, index) => (
                              <span key={index} className="px-2 py-1 bg-white rounded-md text-sm text-gray-600 border border-gray-200">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Accuracy</p>
                          <p className="text-lg font-semibold text-gray-900">{phoneme.accuracy}%</p>
                        </div>
                        <div className="w-32">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                phoneme.status === 'completed' ? 'bg-green-500' :
                                phoneme.status === 'in-progress' ? 'bg-blue-500' :
                                'bg-gray-300'
                              }`}
                              style={{ width: `${phoneme.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">{phoneme.progress}% complete</p>
                        </div>
                      </div>
                    </div>
                    {phoneme.lastPracticed && (
                      <div className="mt-2 text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Last practiced: {phoneme.lastPracticed}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Sessions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Practice Sessions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                      <th className="pb-3 text-sm font-medium text-gray-500">Duration</th>
                      <th className="pb-3 text-sm font-medium text-gray-500">Phonemes Practiced</th>
                      <th className="pb-3 text-sm font-medium text-gray-500">Words Attempted</th>
                      <th className="pb-3 text-sm font-medium text-gray-500">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patientData.recentSessions.map((session, index) => (
                      <tr key={index}>
                        <td className="py-4">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{session.date}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{session.duration}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            {session.phonemesPracticed.map((phoneme, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                                {phoneme}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-900">{session.wordsAttempted} words</span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-custom-blue h-2 rounded-full"
                                style={{ width: `${session.accuracy}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900 font-medium">{session.accuracy}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-8">
            {/* Patient Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Gender</span>
                  <span className="font-medium text-gray-900">{patientData.patient.gender}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">First Visit</span>
                  <span className="font-medium text-gray-900">{patientData.patient.first_clinic_date}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-medium text-gray-900">{patientData.statistics.total_sessions}</span>
                </div>
              </div>
            </div>

            {/* Phoneme Mastery Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Phoneme Mastery</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mastered</p>
                      <p className="text-lg font-semibold text-gray-900">{patientData.statistics.completed_phonemes} phonemes</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">In Progress</p>
                      <p className="text-lg font-semibold text-gray-900">{patientData.statistics.in_progress_phonemes} phoneme</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Accuracy</p>
                      <p className="text-lg font-semibold text-gray-900">{patientData.statistics.average_accuracy}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowGraph(true)}
                className="w-full mt-6 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition flex items-center justify-center"
              >
                View Speech Analytics
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Modal */}
      {showGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Speech Analytics</h2>
              <button 
                onClick={() => setShowGraph(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="h-96 bg-gray-50 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Phoneme mastery and speech pattern visualization</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Progress Report</h2>
              <button 
                onClick={() => setShowReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Report Content */}
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{patientData.patient.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Patient ID</p>
                    <p className="font-medium">{patientData.patient.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{patientData.patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">First Visit</p>
                    <p className="font-medium">{patientData.patient.first_clinic_date}</p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Mastered Phonemes</p>
                    <p className="text-2xl font-bold text-green-700">
                      {patientData.statistics.completed_phonemes}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {patientData.statistics.in_progress_phonemes}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600">Average Accuracy</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {patientData.statistics.average_accuracy}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Phoneme Progress */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Phoneme Progress Details</h3>
                <div className="space-y-3">
                  {patientData.phonemeProgress.map(phoneme => (
                    <div key={phoneme.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">{phoneme.phoneme}</span>
                        <span className="ml-3 text-sm text-gray-600">
                          {phoneme.exampleWords.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          phoneme.status === 'completed' ? 'bg-green-100 text-green-800' :
                          phoneme.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {phoneme.status}
                        </span>
                        <span className="font-medium">{phoneme.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sessions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Practice Sessions</h3>
                <div className="space-y-3">
                  {patientData.recentSessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">{session.date}</span>
                        <span className="ml-3 text-sm text-gray-600">
                          {session.duration} - {session.phonemesPracticed.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{session.wordsAttempted} words</span>
                        <span className="font-medium">{session.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientUser;