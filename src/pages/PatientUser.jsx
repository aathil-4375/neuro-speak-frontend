import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SpeechAnalyticsModal from '../components/SpeechAnalyticsModal';
import CreateChapterFab from '../components/CreateChapterFab';
import { 
  User, 
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  X,
  FileText,
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

  // NEW: chapters loaded per language
  const [chaptersTa, setChaptersTa] = useState([]); // Tamil
  const [chaptersSi, setChaptersSi] = useState([]); // Sinhala
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chaptersError, setChaptersError] = useState('');

  // NEW: selected language filter: 'all' | 'ta' | 'si'
  const [phonemeLang, setPhonemeLang] = useState('all');
  
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;

  // Fetch patient summary
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

  // Load chapters for a given language code ('ta' or 'si')
  const loadChapters = useCallback(async (lang) => {
    try {
      setLoadingChapters(true);
      setChaptersError('');
      const res = await api.get(`/chapters/`, { params: lang ? { language: lang } : {} });
      if (lang === 'ta') setChaptersTa(res.data || []);
      else if (lang === 'si') setChaptersSi(res.data || []);
    } catch (err) {
      console.error('Error loading chapters:', err);
      setChaptersError('Failed to load chapters');
    } finally {
      setLoadingChapters(false);
    }
  }, []);

  // Initial chapters load for both Tamil and Sinhala
  useEffect(() => {
    loadChapters('ta');
    loadChapters('si');
  }, [loadChapters]);

  // Navigation for a chapter card
  const handlePhonemeClick = (chapterNumber, language) => {
    // include language in state so the chapter page can fetch words with language
    navigate(`/home/patient/chapter-${chapterNumber}`, { state: { patient, language } });
  };

  // Generate Progress Report
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowReport(true);
    }, 1500);
  };

  // Download report (print)
  const handleDownloadReport = () => {
    if (!patientData) return;
    const printWindow = window.open('', '_blank');
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Progress Report - ${patientData.patient.full_name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 30px; background-color: #f9f9f9; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #26046B; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #26046B; letter-spacing: 0.5px; }
            .report-title { font-size: 22px; margin-top: 10px; color: #444; }
            .section { margin-bottom: 35px; background-color: white; border-radius: 10px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            .section-title { font-size: 20px; font-weight: bold; color: #26046B; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 20px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 25px 0; }
            .summary-card { border: 1px solid #eee; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 3px 8px rgba(0,0,0,0.03); background-color: #fcfcfc; }
            .summary-value { font-size: 28px; font-weight: bold; margin: 12px 0; }
            .phoneme-row { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #eee; align-items: center; margin-bottom: 8px; border-radius: 8px; background-color: #fcfcfc; transition: all 0.2s; }
            .phoneme-row:hover { background-color: #f7f7f7; }
            .phoneme-status { padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-left: 10px; font-weight: 600; }
            .status-completed { background-color: #d1fae5; color: #065f46; }
            .status-in-progress { background-color: #dbeafe; color: #1e40af; }
            .status-not-started { background-color: #f3f4f6; color: #374151; }
            .session-row { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #eee; align-items: center; border-radius: 8px; background-color: #fcfcfc; margin-bottom: 8px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; font-size: 13px; color: #777; }
            @media print { body { background-color: white; } .section { box-shadow: none; border: 1px solid #eee; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">NeuroSpeak Therapy</div>
            <div class="report-title">Patient Progress Report</div>
            <div>Generated on: ${new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}</div>
          </div>

          <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="info-grid">
              <div><strong>Name:</strong> ${patientData.patient.full_name}</div>
              <div><strong>Patient ID:</strong> ${patientData.patient.patient_id}</div>
              <div><strong>Gender:</strong> ${patientData.patient.gender}</div>
              <div><strong>First Visit:</strong> ${patientData.patient.first_clinic_date}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Summary Statistics</div>
            <div class="summary-grid">
              <div class="summary-card"><div>Mastered Phonemes</div><div class="summary-value" style="color:#059669;">${patientData.statistics.completed_phonemes}</div></div>
              <div class="summary-card"><div>In Progress</div><div class="summary-value" style="color:#2563eb;">${patientData.statistics.in_progress_phonemes}</div></div>
              <div class="summary-card"><div>Average Accuracy</div><div class="summary-value" style="color:#d97706;">${parseFloat(patientData.statistics.average_accuracy).toFixed(1)}%</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Phoneme Progress Details</div>
            ${(patientData.phonemeProgress || []).map(p => `
              <div class="phoneme-row">
                <div><strong>${p.phoneme}</strong> <span style="color:#666;margin-left:10px;">Examples: ${p.exampleWords.join(', ')}</span></div>
                <div><span class="phoneme-status status-${p.status}">${p.status.replace('-', ' ')}</span>
                <span style="margin-left:10px;font-weight:bold;">${parseFloat(p.accuracy).toFixed(1)}%</span></div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="section-title">Recent Practice Sessions</div>
            ${(patientData.recentSessions || []).map(s => `
              <div class="session-row">
                <div><strong>${s.date}</strong><span style="color:#666;margin-left:10px;">${s.duration} - ${s.phonemesPracticed.join(', ')}</span></div>
                <div><span style="color:#666;margin-right:10px;">${s.wordsAttempted} words</span><span style="font-weight:bold;">${parseFloat(s.accuracy).toFixed(1)}%</span></div>
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
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.onload = function() { printWindow.print(); };
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

  // Helper: map progress by chapter number (if your summary uses chapter id == chapter_number)
  const progressByNumber = Object.fromEntries(
    (patientData.phonemeProgress || []).map(p => [String(p.id), p])
  );

  // Visible chapters according to selected language
  const visibleChapters = phonemeLang === 'ta'
    ? chaptersTa
    : phonemeLang === 'si'
      ? chaptersSi
      : [...chaptersTa, ...chaptersSi].sort((a, b) => a.chapter_number - b.chapter_number);

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
        
        {/* Patient Header */}
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
          
          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatCard title="Total Sessions" icon={<Activity className="w-4 h-4 text-indigo-600" />} value={patientData.statistics.total_sessions} />
            <StatCard title="Mastered" icon={<CheckCircle className="w-4 h-4 text-green-600" />} value={patientData.statistics.completed_phonemes} valueClass="text-green-600" />
            <StatCard title="In Progress" icon={<TrendingUp className="w-4 h-4 text-blue-600" />} value={patientData.statistics.in_progress_phonemes} valueClass="text-blue-600" />
            <StatCard title="Avg. Accuracy" icon={<Award className="w-4 h-4 text-amber-600" />} value={`${parseFloat(patientData.statistics.average_accuracy).toFixed(1)}%`} valueClass="text-amber-600" />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-sm p-1 flex mb-1">
          <TabButton label="Overview" active={activeTab==='overview'} onClick={()=>setActiveTab('overview')} />
          <TabButton label="Phoneme Progress" active={activeTab==='phonemes'} onClick={()=>setActiveTab('phonemes')} />
          <TabButton label="Practice Sessions" active={activeTab==='sessions'} onClick={()=>setActiveTab('sessions')} />
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-lg p-8 mb-8">
          {activeTab === 'overview' && (
            <OverviewSection patientData={patientData} />
          )}

          {activeTab === 'phonemes' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Phoneme Progress</h2>
                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {patientData.statistics.completed_phonemes} of {patientData.phonemeProgress.length} mastered
                </span>
              </div>

              {/* Language filter chips */}
              <div className="flex items-center gap-2 mb-6">
                <FilterChip active={phonemeLang==='all'} onClick={()=>setPhonemeLang('all')} label="All" />
                <FilterChip active={phonemeLang==='ta'} onClick={()=>setPhonemeLang('ta')} label="Tamil" />
                <FilterChip active={phonemeLang==='si'} onClick={()=>setPhonemeLang('si')} label="Sinhala" />
                <span className="text-xs text-gray-500 ml-2">
                  {loadingChapters ? 'Loading chapters…' : chaptersError ? chaptersError : `Showing ${visibleChapters.length} chapter(s)`}
                </span>
              </div>

              {/* Chapter cards from chapters endpoint */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleChapters.map((chapter) => {
                  const p = progressByNumber[String(chapter.chapter_number)];
                  const status = p?.status || 'not-started';
                  const accuracy = p?.accuracy != null ? parseFloat(p.accuracy).toFixed(1) : '—';
                  const progress = p?.progress != null ? parseFloat(p.progress).toFixed(1) : '0.0';

                  return (
                    <div
                      key={`${chapter.language}-${chapter.chapter_number}`}
                      onClick={() => handlePhonemeClick(chapter.chapter_number, chapter.language)}
                      className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-md transform hover:-translate-y-1 ${
                        status === 'completed' ? 'border-green-200 bg-green-50' :
                        status === 'in-progress' ? 'border-blue-200 bg-blue-50' :
                        'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-sm ${
                            status === 'completed' ? 'bg-gradient-to-br from-green-400 to-green-500 text-white' :
                            status === 'in-progress' ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white' :
                            'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                          }`}>
                            {/* Show language code big, or the chapter name if you prefer */}
                            <span className="text-2xl font-bold">
                              {chapter.language === 'ta' ? 'TA' : 'SI'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {chapter.name || 'Phoneme'} — Chapter {chapter.chapter_number}
                            </h3>
                            {/* Show language tag */}
                            <div className="mt-2 text-xs">
                              <span className="px-2 py-0.5 rounded-full border">
                                {chapter.language === 'ta' ? 'Tamil' : 'Sinhala'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="mb-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status === 'completed' ? 'bg-green-100 text-green-800' :
                              status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {status === 'completed' ? 'Mastered' :
                               status === 'in-progress' ? 'In Progress' :
                               'Not Started'}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{accuracy}%</p>
                          <div className="w-32 mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  status === 'completed' ? 'bg-green-500' :
                                  status === 'in-progress' ? 'bg-blue-500' :
                                  'bg-gray-300'
                                }`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">{progress}% complete</p>
                          </div>
                        </div>
                      </div>
                      {/* Last practiced if available in summary (can’t get this from chapters) */}
                      {p?.lastPracticed && (
                        <div className="mt-3 text-sm text-gray-500 flex items-center border-t border-gray-100 pt-2">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          Last practiced: {p.lastPracticed}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <SessionsSection recentSessions={patientData.recentSessions} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showGraph && (
        <SpeechAnalyticsModal 
          patientData={patientData} 
          onClose={() => setShowGraph(false)}
        />
      )}

      {showReport && (
        <ReportModal
          patientData={patientData}
          onClose={() => setShowReport(false)}
          onDownload={handleDownloadReport}
        />
      )}

      {/* Floating Create Chapter button */}
      <CreateChapterFab
        onCreated={(newChapter) => {
          // If a chapter was created, refresh the list for its language
          if (newChapter?.language) {
            loadChapters(newChapter.language);
          } else {
            // fallback: reload current filter
            if (phonemeLang === 'ta' || phonemeLang === 'si') loadChapters(phonemeLang);
            else { loadChapters('ta'); loadChapters('si'); }
          }
        }}
      />
    </div>
  );
};

/* ---------------- helper components ---------------- */

function StatCard({ title, icon, value, valueClass = '' }) {
  return (
    <div className="bg-white/90 p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all duration-300 ${
        active ? 'bg-custom-blue text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-sm ${
        active ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}

/* Overview Section reused from your earlier build, compacted to keep focus */
function OverviewSection({ patientData }) {
  return (
    <div className="space-y-8">
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
                     (patientData.statistics.not_started_phonemes || 
                      patientData.phonemeProgress.filter(p => p.status === 'not-started').length))) * 100
                  )}%` 
                }}
              >
                <span className="text-white text-sm font-bold ml-3">
                  {Math.round(
                    (patientData.statistics.completed_phonemes / 
                    (patientData.statistics.completed_phonemes + 
                     patientData.statistics.in_progress_phonemes + 
                     (patientData.statistics.not_started_phonemes || 
                      patientData.phonemeProgress.filter(p => p.status === 'not-started').length))) * 100
                  )}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-custom-blue/10 to-indigo-500/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Performance</h3>
            {patientData.recentSessions.length > 0 ? (
              <>
                <div className="text-3xl font-bold text-custom-blue">{parseFloat(patientData.recentSessions[0].accuracy).toFixed(1)}%</div>
                <div className="text-sm text-gray-600 mt-1">Latest session accuracy</div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average last 3 sessions</span>
                    <span className="font-semibold text-gray-900">
                      {parseFloat(
                        patientData.recentSessions
                          .slice(0, 3)
                          .reduce((acc, session) => acc + session.accuracy, 0) / 
                        Math.min(patientData.recentSessions.length, 3)
                      ).toFixed(1)}%
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
    </div>
  );
}

function SessionsSection({ recentSessions }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice Sessions History</h2>
      {recentSessions.length > 0 ? (
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
                {recentSessions.map((session, index) => (
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
                        <span className="text-gray-900 font-semibold">{parseFloat(session.accuracy).toFixed(1)}%</span>
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
  );
}

function ReportModal({ patientData, onClose, onDownload }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Patient Progress Report</h2>
            <p className="text-gray-500">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Minimal content preview (you’re using the print window for the full export) */}
        <div className="space-y-4 text-sm text-gray-700">
          <div><strong>Patient:</strong> {patientData.patient.full_name} ({patientData.patient.patient_id})</div>
          <div><strong>Total Sessions:</strong> {patientData.statistics.total_sessions}</div>
          <div><strong>Average Accuracy:</strong> {parseFloat(patientData.statistics.average_accuracy).toFixed(1)}%</div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Close
          </button>
          <button
            onClick={onDownload}
            className="px-5 py-2.5 bg-gradient-to-r from-custom-blue to-indigo-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            <span>Download / Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientUser;
