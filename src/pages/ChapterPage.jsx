// frontend/src/pages/ChapterPage.jsx (Production Version)
import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, User, ArrowLeft } from "lucide-react";
import { progressService } from "../services/progress";

const ChapterPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const chapterNumber = parseInt(chapterId.replace('chapter-', ''));
  const patient = location.state?.patient;
  
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordHoverIndex, setWordHoverIndex] = useState(null);
  const [chapterProgress, setChapterProgress] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch chapter words
        const chapterResponse = await progressService.getChapterWords(chapterNumber);
        setChapterData(chapterResponse.data);
        
        // If patient data is available, fetch progress summary for this patient
        if (patient?.patient_id) {
          const summaryResponse = await progressService.getPatientSummary(patient.patient_id);
          
          // Find the progress for this specific chapter - handle case mismatch by parsing integers
          const chapterData = summaryResponse.data.phonemeProgress.find(
            phoneme => parseInt(phoneme.id) === chapterNumber
          );
          
          if (chapterData) {
            setChapterProgress(chapterData);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [chapterNumber, patient?.patient_id]);

  // Navigate to graph page when word is clicked
  const handleWordClick = (word) => {
    navigate('/graph-tab', { 
      state: { 
        patient,
        chapter: chapterNumber,
        word,
        phoneme: chapterData?.phoneme
      } 
    });
  };

  // Render loading state
  const renderLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-custom-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl text-gray-700 font-medium">Loading chapter data...</div>
          <div className="text-sm text-gray-500 mt-2">Preparing phoneme practice words</div>
        </div>
      </div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-lg text-red-600 mb-6">{error || 'Chapter not found'}</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-gradient-to-r from-custom-blue to-indigo-600 text-white rounded-xl hover:shadow-lg transition-colors duration-300 shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderLoading();
  }

  if (error || !chapterData) {
    return renderError();
  }

  // Calculate completed words percentage based on the data
  const getProgressPercentage = () => {
    if (chapterProgress) {
      return chapterProgress.progress;
    }
    return 0; // Default if no progress data
  };

  // Get the chapter status
  const getChapterStatus = () => {
    if (!chapterProgress) return 'not-started';
    return chapterProgress.status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/home/patient', { state: { patient } })}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-custom-blue transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patient Dashboard</span>
          </button>
        </div>

        {/* Patient Info Section */}
        {patient && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 relative overflow-hidden backdrop-blur-sm bg-opacity-95">
            <div className="absolute inset-0 bg-gradient-to-r from-custom-blue/5 to-indigo-500/5 z-0"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-custom-blue to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{patient.full_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      ID: {patient.patient_id}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      {patient.gender}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 hover:shadow-xl backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-custom-blue to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-105">
                <span className="text-4xl font-bold text-white">{chapterData.phoneme}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Phoneme Training
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Chapter {chapterNumber}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    {chapterData.words.length} words
                  </span>
                  {chapterProgress && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${chapterProgress.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : 
                       chapterProgress.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                       'bg-gray-100 text-gray-800 border border-gray-200'}`}
                    >
                      {chapterProgress.status === 'completed' ? 'Mastered' : 
                       chapterProgress.status === 'in-progress' ? 'In Progress' : 
                       'Not Started'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 md:items-center">
              <div className="h-2 w-full sm:w-44 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    getChapterStatus() === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                    getChapterStatus() === 'in-progress' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                    'bg-gradient-to-r from-gray-400 to-gray-300'
                  }`} 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-600">{getProgressPercentage()}% complete</span>
            </div>
          </div>
        </div>

        {/* Word List Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 hover:shadow-xl backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center mb-6">
            <BookOpen className="w-6 h-6 text-custom-blue mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Practice Words</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {chapterData.words.map((word, index) => (
              <div
                key={index}
                onClick={() => handleWordClick(word)}
                onMouseEnter={() => setWordHoverIndex(index)}
                onMouseLeave={() => setWordHoverIndex(null)}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white hover:border-custom-blue hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="p-6 flex flex-col items-center justify-center">
                  <span className="text-xl font-semibold text-gray-800 group-hover:text-custom-blue transition-colors duration-300">
                    {word}
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    Word #{index + 1}
                  </span>
                </div>
                <div 
                  className={`absolute inset-0 bg-gradient-to-br from-custom-blue/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>
                {wordHoverIndex === index && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-custom-blue rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex justify-between items-center">
          <button
            disabled={chapterNumber <= 1}
            onClick={() => navigate(`/home/patient/chapter-${chapterNumber - 1}`, { state: { patient } })}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-sm
              ${chapterNumber <= 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-custom-blue border-2 border-custom-blue hover:bg-custom-blue hover:text-white hover:shadow-md'
              }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous Phoneme
          </button>

          <button
            onClick={() => navigate(`/home/patient/chapter-${chapterNumber + 1}`, { state: { patient } })}
            className="flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-custom-blue to-indigo-600 text-white hover:from-indigo-600 hover:to-custom-blue shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Next Phoneme
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterPage;