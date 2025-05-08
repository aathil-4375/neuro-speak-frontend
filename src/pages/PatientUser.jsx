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
  Download,
  BarChart2,
  TrendingUp,
  Award,
  Activity,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';

const PatientUser = () => {
  const [showGraph, setShowGraph] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
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
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 30px;
              background-color: #f9f9f9;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #26046B;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #26046B;
              letter-spacing: 0.5px;
            }
            .report-title {
              font-size: 22px;
              margin-top: 10px;
              color: #444;
            }
            .section {
              margin-bottom: 35px;
              background-color: white;
              border-radius: 10px;
              padding: 25px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              color: #26046B;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .info-item {
              margin-bottom: 12px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin: 25px 0;
            }
            .summary-card {
              border: 1px solid #eee;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              box-shadow: 0 3px 8px rgba(0,0,0,0.03);
              background-color: #fcfcfc;
            }
            .summary-value {
              font-size: 28px;
              font-weight: bold;
              margin: 12px 0;
            }
            .summary-label {
              font-size: 15px;
              color: #555;
              font-weight: 500;
            }
            .phoneme-row {
              display: flex;
              justify-content: space-between;
              padding: 15px;
              border-bottom: 1px solid #eee;
              align-items: center;
              margin-bottom: 8px;
              border-radius: 8px;
              background-color: #fcfcfc;
              transition: all 0.2s;
            }
            .phoneme-row:hover {
              background-color: #f7f7f7;
            }
            .phoneme-info {
              flex: 1;
            }
            .phoneme-status {
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 12px;
              margin-left: 10px;
              font-weight: 600;
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
              padding: 15px;
              border-bottom: 1px solid #eee;
              align-items: center;
              border-radius: 8px;
              background-color: #fcfcfc;
              margin-bottom: 8px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              text-align: center;
              font-size: 13px;
              color: #777;
            }
            @media print {
              body {
                background-color: white;
              }
              .section {
                box-shadow: none;
                border: 1px solid #eee;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">NeuroSpeak Therapy</div>
            <div class="report-title">Patient Progress Report</div>
            <div>Generated on: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
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
            <p>© ${new Date().getFullYear()} NeuroSpeak Therapy. All rights reserved.</p>
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

  const renderLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-custom-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl text-gray-700 font-medium">Loading patient data...</div>
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-2xl text-red-600 font-bold mb-2">Error</div>
          <div className="text-lg text-gray-700 mb-6">{error}</div>
          <button 
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-custom-blue text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return renderLoading();
  if (error) return renderError();
  if (!patientData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Top Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-custom-blue transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patient List</span>
          </button>
        </div>
        
        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden backdrop-blur-sm bg-opacity-95">
          <div className="absolute inset-0 bg-gradient-to-r from-custom-blue/10 to-indigo-500/5 z-0"></div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-custom-blue to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="ml-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{patientData.patient.full_name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    ID: {patientData.patient.patient_id}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {patientData.patient.gender}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                    First Visit: {patientData.patient.first_clinic_date}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mt-6 md:mt-0">
              <button 
                onClick={() => setShowGraph(true)}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Speech Analytics
              </button>
              
              <button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className={`px-5 py-2.5 bg-gradient-to-r from-custom-blue to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center ${
                  isGenerating ? 'opacity-80 cursor-not-allowed' : 'hover:translate-y-[-2px]'
                }`}
              >
                <FileText className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
                <span>{isGenerating ? 'Generating...' : 'Progress Report'}</span>
              </button>
            </div>
          </div>
          
          {/* Key Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/90 p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500">Total Sessions</div>
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{patientData.statistics.total_sessions}</div>
            </div>
            
            <div className="bg-white/90 p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500">Mastered</div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">{patientData.statistics.completed_phonemes}</div>
            </div>
            
            <div className="bg-white/90 p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500">In Progress</div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{patientData.statistics.in_progress_phonemes}</div>
            </div>
            
            <div className="bg-white/90 p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500">Avg. Accuracy</div>
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600">{patientData.statistics.average_accuracy}%</div>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="bg-white rounded-t-2xl shadow-sm p-1 flex mb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all duration-300 ${
              activeTab === 'overview' 
                ? 'bg-custom-blue text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('phonemes')}
            className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all duration-300 ${
              activeTab === 'phonemes' 
                ? 'bg-custom-blue text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Phoneme Progress
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all duration-300 ${
              activeTab === 'sessions' 
                ? 'bg-custom-blue text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Practice Sessions
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-lg p-8 mb-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Progress Overview */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Therapy Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Phoneme Mastery</h3>
                    <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 flex items-center"
                        style={{ 
                          width: `${Math.round(
                            (patientData.statistics.completed_phonemes / 
                            (patientData.statistics.completed_phonemes + 
                             patientData.statistics.in_progress_phonemes + 
                             patientData.phonemeProgress.filter(p => p.status === 'not-started').length)) * 100
                          )}%` 
                        }}
                      >
                        <span className="text-white text-sm font-bold ml-3">
                          {Math.round(
                            (patientData.statistics.completed_phonemes / 
                            (patientData.statistics.completed_phonemes + 
                             patientData.statistics.in_progress_phonemes + 
                             patientData.phonemeProgress.filter(p => p.status === 'not-started').length)) * 100
                          )}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex mt-4 justify-around">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500">Mastered</div>
                        <div className="flex items-center mt-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="font-semibold">{patientData.statistics.completed_phonemes}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500">In Progress</div>
                        <div className="flex items-center mt-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="font-semibold">{patientData.statistics.in_progress_phonemes}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500">Not Started</div>
                        <div className="flex items-center mt-1">
                          <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                          <span className="font-semibold">
                            {patientData.phonemeProgress.filter(p => p.status === 'not-started').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-custom-blue/10 to-indigo-500/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Performance</h3>
                    {patientData.recentSessions.length > 0 ? (
                      <>
                        <div className="text-3xl font-bold text-custom-blue">
                          {patientData.recentSessions[0].accuracy}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Latest session accuracy
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Average last 3 sessions</span>
                            <span className="font-semibold text-gray-900">
                              {Math.round(
                                patientData.recentSessions
                                  .slice(0, 3)
                                  .reduce((acc, session) => acc + session.accuracy, 0) / 
                                Math.min(patientData.recentSessions.length, 3)
                              )}%
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-600">No recent sessions recorded</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Recent Activities & Next Steps */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activities & Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                    {patientData.recentSessions.length > 0 ? (
                      <div className="space-y-4">
                        {patientData.recentSessions.slice(0, 3).map((session, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900 mb-1">Practice Session</div>
                                <div className="text-sm text-gray-600">
                                  {session.phonemesPracticed.join(', ')} • {session.wordsAttempted} words
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {session.date}
                                </div>
                                <div className="mt-1 font-semibold text-green-600">{session.accuracy}% accuracy</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center">
                        <div className="text-gray-500">No recent activities recorded</div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Focus</h3>
                    {patientData.phonemeProgress.filter(p => p.status === 'in-progress').length > 0 ? (
                      <div className="space-y-3">
                        {patientData.phonemeProgress
                          .filter(p => p.status === 'in-progress')
                          .slice(0, 3)
                          .map((phoneme, index) => (
                            <div 
                              key={index}
                              onClick={() => handlePhonemeClick(phoneme.id)} 
                              className="bg-blue-50 rounded-xl p-4 border border-blue-100 cursor-pointer hover:shadow-md transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xl font-bold text-blue-800">{phoneme.phoneme}</span>
                                  </div>
                                  <div className="ml-3">
                                    <div className="font-medium text-gray-900">Chapter {phoneme.id}</div>
                                    <div className="text-xs text-gray-600">{phoneme.accuracy}% accuracy</div>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                          ))
                        }
                        <button
                          onClick={() => setActiveTab('phonemes')}
                          className="w-full py-2 mt-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          View All Phonemes
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center">
                        <div className="text-gray-500">No in-progress phonemes</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Phoneme Progress Tab */}
          {activeTab === 'phonemes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Phoneme Progress</h2>
                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {patientData.phonemeProgress.filter(p => p.status === 'completed').length} of {patientData.phonemeProgress.length} mastered
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patientData.phonemeProgress.map(phoneme => (
                  <div 
                    key={phoneme.id} 
                    onClick={() => handlePhonemeClick(phoneme.id)}
                    className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-md transform hover:-translate-y-1 ${
                      phoneme.status === 'completed' ? 'border-green-200 bg-green-50' :
                      phoneme.status === 'in-progress' ? 'border-blue-200 bg-blue-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-sm ${
                          phoneme.status === 'completed' ? 'bg-gradient-to-br from-green-400 to-green-500 text-white' :
                          phoneme.status === 'in-progress' ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white' :
                          'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                        }`}>
                          <span className="text-2xl font-bold">{phoneme.phoneme}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Phoneme Chapter {phoneme.id}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {phoneme.exampleWords.slice(0, 3).map((word, index) => (
                              <span key={index} className="px-2 py-1 bg-white rounded-md text-sm text-gray-600 border border-gray-200 shadow-sm">
                                {word}
                              </span>
                            ))}
                            {phoneme.exampleWords.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
                                +{phoneme.exampleWords.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="mb-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            phoneme.status === 'completed' ? 'bg-green-100 text-green-800' :
                            phoneme.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {phoneme.status === 'completed' ? 'Mastered' :
                             phoneme.status === 'in-progress' ? 'In Progress' :
                             'Not Started'}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{phoneme.accuracy}%</p>
                        <div className="w-32 mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-2.5 rounded-full ${
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
                      <div className="mt-3 text-sm text-gray-500 flex items-center border-t border-gray-100 pt-2">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        Last practiced: {phoneme.lastPracticed}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Practice Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice Sessions History</h2>
              
              {patientData.recentSessions.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Duration</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Phonemes</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Words</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {patientData.recentSessions.map((session, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-gray-900 font-medium">{session.date}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-gray-900">{session.duration}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {session.phonemesPracticed.map((phoneme, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                                    {phoneme}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-900 font-medium">{session.wordsAttempted}</span>
                              <span className="text-gray-500 ml-1">words</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-custom-blue to-indigo-500 h-2 rounded-full"
                                    style={{ width: `${session.accuracy}%` }}
                                  ></div>
                                </div>
                                <span className="text-gray-900 font-semibold">{session.accuracy}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-10 bg-gray-50 rounded-xl border border-gray-200">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No practice sessions yet</h3>
                  <p className="text-gray-600">Schedule a new session to start tracking progress</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Graph Modal */}
      {showGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-5xl w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Speech Analytics</h2>
              <button 
                onClick={() => setShowGraph(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-6 md:w-1/3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phoneme Mastery</h3>
                <div className="aspect-square rounded-full border-8 border-gray-200 relative flex items-center justify-center">
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-green-500 border-r-transparent border-b-transparent"
                    style={{ 
                      transform: `rotate(${Math.round(
                        (patientData.statistics.completed_phonemes / patientData.phonemeProgress.length) * 360
                      )}deg)` 
                    }}
                  ></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.round(
                        (patientData.statistics.completed_phonemes / patientData.phonemeProgress.length) * 100
                      )}%
                    </div>
                    <div className="text-sm text-gray-600">Mastered</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-6">
                  <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                    <div className="text-xs text-gray-500">Mastered</div>
                    <div className="text-lg font-bold text-green-600">{patientData.statistics.completed_phonemes}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                    <div className="text-xs text-gray-500">In Progress</div>
                    <div className="text-lg font-bold text-blue-600">{patientData.statistics.in_progress_phonemes}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                    <div className="text-xs text-gray-500">Not Started</div>
                    <div className="text-lg font-bold text-gray-600">
                      {patientData.phonemeProgress.filter(p => p.status === 'not-started').length}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 md:w-2/3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accuracy Trend</h3>
                <div className="h-64 bg-white rounded-lg p-4">
                  {/* Placeholder for chart - would use recharts LineChart in a real implementation */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Accuracy trend visualization would appear here</p>
                      <p className="text-gray-400 text-sm">Using patient's historical session data</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Phoneme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {patientData.phonemeProgress
                  .filter(p => p.status !== 'not-started')
                  .sort((a, b) => b.accuracy - a.accuracy)
                  .slice(0, 6)
                  .map((phoneme, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            phoneme.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            <span className="text-lg font-bold">{phoneme.phoneme}</span>
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">Chapter {phoneme.id}</div>
                            <div className="text-xs text-gray-600">
                              {phoneme.status === 'completed' ? 'Mastered' : 'In Progress'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{phoneme.accuracy}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            phoneme.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${phoneme.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Patient Progress Report</h2>
                <p className="text-gray-500">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button 
                onClick={() => setShowReport(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Report Content */}
            <div className="space-y-8">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Patient Information</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-900 mt-1">{patientData.patient.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Patient ID</p>
                    <p className="font-semibold text-gray-900 mt-1">{patientData.patient.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="font-semibold text-gray-900 mt-1">{patientData.patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">First Visit</p>
                    <p className="font-semibold text-gray-900 mt-1">{patientData.patient.first_clinic_date}</p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Summary Statistics</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-green-600">Mastered Phonemes</p>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {patientData.statistics.completed_phonemes}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {Math.round((patientData.statistics.completed_phonemes / patientData.phonemeProgress.length) * 100)}% of total phonemes
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-blue-600">In Progress</p>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                      {patientData.statistics.in_progress_phonemes}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Currently working on these phonemes
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-amber-600">Average Accuracy</p>
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-amber-700">
                      {patientData.statistics.average_accuracy}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Based on {patientData.statistics.total_sessions} total sessions
                    </p>
                  </div>
                </div>
              </div>

              {/* Phoneme Progress */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Phoneme Progress Details</h3>
                <div className="space-y-3">
                  {patientData.phonemeProgress.map(phoneme => (
                    <div key={phoneme.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                      <div>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                            phoneme.status === 'completed' ? 'bg-green-100 text-green-800' :
                            phoneme.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <span className="font-bold">{phoneme.phoneme}</span>
                          </div>
                          <span className="font-medium text-gray-900">Chapter {phoneme.id}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600 ml-11">
                          Example words: {phoneme.exampleWords.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          phoneme.status === 'completed' ? 'bg-green-100 text-green-800' :
                          phoneme.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {phoneme.status === 'completed' ? 'Mastered' : 
                           phoneme.status === 'in-progress' ? 'In Progress' : 
                           'Not Started'}
                        </span>
                        <span className="font-semibold text-gray-900">{phoneme.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Recent Practice Sessions</h3>
                {patientData.recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {patientData.recentSessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                            {session.date}
                            <span className="mx-2 text-gray-300">•</span>
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            {session.duration}
                          </div>
                          <div className="mt-1 text-sm text-gray-600 ml-6">
                            Phonemes: {session.phonemesPracticed.join(', ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{session.wordsAttempted} words</div>
                          <div className="font-semibold text-gray-900">{session.accuracy}% accuracy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-gray-600">No recent sessions recorded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setShowReport(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-5 py-2.5 bg-gradient-to-r from-custom-blue to-indigo-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
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