// frontend/src/pages/PatientUser.jsx - Final Fixed Version
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
  ChevronLeft,
  Award,
  Activity,
  TrendingUp,
  ArrowRight,
  MoreHorizontal,
  Calendar,
  Bell
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const ProgressCard = ({ title, value, total, color, icon }) => {
  const percentage = Math.round((value / total) * 100) || 0;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <h3 className="ml-3 font-semibold text-gray-700">{title}</h3>
        </div>
        <span className="text-lg font-bold">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color.replace('bg-', 'bg-')}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>{value} completed</span>
        <span>{total} total</span>
      </div>
    </div>
  );
};

const PhonemeCard = ({ phoneme, onClick, isActive }) => {
  const { id, status, progress, accuracy, lastPracticed } = phoneme;
  
  const getStatusColorClasses = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getProgressBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
        isActive 
          ? 'border-custom-blue bg-blue-50' 
          : `border-gray-200 ${status === 'completed' ? 'bg-green-50' : status === 'in-progress' ? 'bg-blue-50' : 'bg-white'}`
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            status === 'completed' ? 'bg-green-200' :
            status === 'in-progress' ? 'bg-blue-200' :
            'bg-gray-200'
          }`}>
            <span className="text-xl font-bold text-gray-900">{phoneme.phoneme}</span>
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">Chapter {id}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {phoneme.exampleWords.map((word, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border border-gray-200">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColorClasses()}`}>
            {status.replace('-', ' ')}
          </span>
          <p className="text-lg font-semibold mt-1">{accuracy}%</p>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${getProgressBarColor()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">{progress}% complete</p>
          {lastPracticed && (
            <p className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {lastPracticed}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const SessionCard = ({ session }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{session.date}</h3>
            <p className="text-sm text-gray-500">{session.duration}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{session.accuracy}%</p>
          <p className="text-sm text-gray-500">{session.wordsAttempted} words</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {session.phonemesPracticed.map((phoneme, idx) => (
          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
            {phoneme}
          </span>
        ))}
      </div>
    </div>
  );
};

const PatientUser = () => {
  const [showGraph, setShowGraph] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPhoneme, setSelectedPhoneme] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
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
    
    // Generate HTML content for the report (using existing code)
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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-custom-blue to-indigo-600 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-white">{patientData.patient.full_name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    ID: {patientData.patient.patient_id}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    {patientData.patient.gender}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className={`px-5 py-2.5 bg-white text-custom-blue rounded-lg font-medium shadow hover:bg-gray-50 transition flex items-center space-x-2 ${
                  isGenerating ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <FileText className={`w-5 h-5 ${isGenerating ? 'animate-pulse' : ''}`} />
                <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
              </button>
              <button 
                className="px-5 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition flex items-center space-x-2"
                onClick={() => setShowGraph(true)}
              >
                <BarChart2 className="w-5 h-5" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-white mr-2" />
                <h3 className="text-sm text-white/80">Mastered Phonemes</h3>
              </div>
              <p className="text-3xl font-bold text-white">{patientData.statistics.completed_phonemes}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <BookOpen className="w-5 h-5 text-white mr-2" />
                <h3 className="text-sm text-white/80">In Progress</h3>
              </div>
              <p className="text-3xl font-bold text-white">{patientData.statistics.in_progress_phonemes}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Star className="w-5 h-5 text-white mr-2" />
                <h3 className="text-sm text-white/80">Average Accuracy</h3>
              </div>
              <p className="text-3xl font-bold text-white">{patientData.statistics.average_accuracy}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <CalendarIcon className="w-5 h-5 text-white mr-2" />
                <h3 className="text-sm text-white/80">Total Sessions</h3>
              </div>
              <p className="text-3xl font-bold text-white">{patientData.statistics.total_sessions}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-custom-blue border-b-2 border-custom-blue'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('phonemes')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'phonemes'
                ? 'text-custom-blue border-b-2 border-custom-blue'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Phoneme Progress
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'sessions'
                ? 'text-custom-blue border-b-2 border-custom-blue'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Practice Sessions
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Progress Overview */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                  <button className="text-sm text-custom-blue hover:text-indigo-700 font-medium">
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {patientData.recentSessions.slice(0, 3).map((session, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-custom-blue rounded-lg flex items-center justify-center text-white">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">Practice Session</h3>
                            <p className="text-sm text-gray-500 mt-1">{session.date} • {session.duration}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                            {session.accuracy}% accuracy
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {session.phonemesPracticed.map((phoneme, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">
                              {phoneme}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Progress Overview */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Progress Overview</h2>
                
                <div className="space-y-4">
                  <ProgressCard 
                    title="Phoneme Mastery" 
                    value={patientData.statistics.completed_phonemes} 
                    total={patientData.phonemeProgress.length}
                    color="bg-green-100 text-green-600"
                    icon={<CheckCircle className="w-5 h-5" />}
                  />
                  
                  <ProgressCard 
                    title="Overall Accuracy" 
                    value={patientData.statistics.average_accuracy} 
                    total={100}
                    color="bg-blue-100 text-blue-600"
                    icon={<Activity className="w-5 h-5" />}
                  />
                  
                  <ProgressCard 
                    title="Session Completion" 
                    value={patientData.statistics.total_sessions} 
                    total={patientData.statistics.total_sessions + 5} // Adding 5 as target for example
                    color="bg-purple-100 text-purple-600"
                    icon={<TrendingUp className="w-5 h-5" />}
                  />
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-4">Next Recommended Phonemes</h3>
                  <div className="space-y-3">
                    {patientData.phonemeProgress
                      .filter(p => p.status === 'in-progress')
                      .slice(0, 2)
                      .map((phoneme, index) => (
                        <div 
                          key={index}
                          onClick={() => handlePhonemeClick(phoneme.id)}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg font-bold text-blue-700">{phoneme.phoneme}</span>
                            </div>
                            <div className="ml-3">
                              <h4 className="font-medium text-gray-900">Chapter {phoneme.id}</h4>
                              <div className="mt-1 flex">
                                {phoneme.exampleWords.slice(0, 2).map((word, idx) => (
                                  <span key={idx} className="mr-2 text-xs text-gray-500">
                                    {word}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-custom-blue">
                            <span className="mr-1 text-sm">Practice</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Patient Info Card */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Patient Information</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-medium text-gray-900">{patientData.patient.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Patient ID</span>
                    <span className="font-medium text-gray-900">{patientData.patient.patient_id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Gender</span>
                    <span className="font-medium text-gray-900">{patientData.patient.gender}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">First Visit</span>
                    <span className="font-medium text-gray-900">{patientData.patient.first_clinic_date}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Upcoming Sessions */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Upcoming Sessions</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-custom-blue mr-2" />
                        <span className="font-medium text-gray-900">Speech Therapy</span>
                      </div>
                      <span className="text-sm text-gray-500">Tomorrow</span>
                    </div>
                    <p className="text-sm text-gray-600">10:00 AM - 11:00 AM</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500">With Dr. Smith</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        Confirmed
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-custom-blue mr-2" />
                        <span className="font-medium text-gray-900">Progress Assessment</span>
                      </div>
                      <span className="text-sm text-gray-500">In 3 days</span>
                    </div>
                    <p className="text-sm text-gray-600">2:30 PM - 3:30 PM</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500">With Dr. Johnson</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Actions</h2>
                <div className="space-y-3">
                  <button className="w-full py-2.5 px-4 bg-custom-blue text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center">
                    <Bell className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </button>
                  <button className="w-full py-2.5 px-4 bg-white text-custom-blue border border-custom-blue rounded-lg hover:bg-gray-50 transition flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Edit Patient Information
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Phoneme Progress Tab */}
        {activeTab === 'phonemes' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Phoneme Progress</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    All
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium text-custom-blue bg-blue-50 rounded-md hover:bg-blue-100">
                    In Progress
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100">
                    Completed
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patientData.phonemeProgress.map((phoneme, index) => (
                  <PhonemeCard 
                    key={index}
                    phoneme={phoneme}
                    onClick={() => handlePhonemeClick(phoneme.id)}
                    isActive={selectedPhoneme === phoneme.id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Practice Sessions</h2>
                <div className="flex items-center">
                  <div className="relative">
                    <select className="pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-custom-blue focus:border-custom-blue">
                      <option>All Time</option>
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last 3 Months</option>
                    </select>
                    <ChevronLeft className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patientData.recentSessions.map((session, index) => (
                  <SessionCard key={index} session={session} />
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <button className="px-4 py-2 text-sm font-medium text-custom-blue hover:text-indigo-700 flex items-center">
                  <p>Load More Sessions</p>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Speech Analytics Modal */}
      {showGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Speech Analytics</h2>
              <button 
                onClick={() => setShowGraph(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-custom-blue to-indigo-600 text-white rounded-xl p-4">
                <h3 className="font-medium mb-1">Overall Accuracy</h3>
                <p className="text-3xl font-bold">{patientData.statistics.average_accuracy}%</p>
                <p className="text-sm text-white/80 mt-1">Across all phonemes</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-4">
                <h3 className="font-medium mb-1">Mastered Phonemes</h3>
                <p className="text-3xl font-bold">{patientData.statistics.completed_phonemes}</p>
                <p className="text-sm text-white/80 mt-1">Out of {patientData.phonemeProgress.length} total</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-4">
                <h3 className="font-medium mb-1">Practice Sessions</h3>
                <p className="text-3xl font-bold">{patientData.statistics.total_sessions}</p>
                <p className="text-sm text-white/80 mt-1">Total completed</p>
              </div>
            </div>
            
            <div className="h-80 bg-gray-50 rounded-xl mb-6 flex items-center justify-center p-4">
              <div className="text-gray-500 text-center">
                <BarChart2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Phoneme Accuracy Visualization</p>
                <p className="text-sm mt-1">Chart will be displayed here</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowGraph(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-indigo-700 transition flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Progress Report</h2>
              <button 
                onClick={() => setShowReport(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Report Header */}
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-gray-500 text-sm">Generated on</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">Patient ID</p>
                <p className="font-medium">{patientData.patient.patient_id}</p>
              </div>
            </div>
            
            {/* Patient Info */}
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{patientData.patient.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{patientData.patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">First Visit</p>
                  <p className="font-medium">{patientData.patient.first_clinic_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sessions</p>
                  <p className="font-medium">{patientData.statistics.total_sessions}</p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Summary Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-green-600 mb-1">Mastered Phonemes</p>
                  <p className="text-2xl font-bold text-green-700">
                    {patientData.statistics.completed_phonemes}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-600 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {patientData.statistics.in_progress_phonemes}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-600 mb-1">Average Accuracy</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {patientData.statistics.average_accuracy}%
                  </p>
                </div>
              </div>
            </div>

            {/* Phoneme Progress */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Phoneme Progress Details</h3>
              <div className="space-y-3">
                {patientData.phonemeProgress.map((phoneme, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{phoneme.phoneme}</span>
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
                        {phoneme.status.replace('-', ' ')}
                      </span>
                      <span className="font-medium text-gray-900">{phoneme.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Practice Sessions</h3>
              <div className="space-y-3">
                {patientData.recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{session.date}</span>
                      <span className="ml-3 text-sm text-gray-600">
                        {session.duration} • {session.phonemesPracticed.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{session.wordsAttempted} words</span>
                      <span className="font-medium text-gray-900">{session.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientUser;