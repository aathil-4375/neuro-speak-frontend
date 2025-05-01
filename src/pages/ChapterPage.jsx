// frontend/src/pages/ChapterPage.jsx (Updated with API integration)
import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, User } from "lucide-react";
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

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        const response = await progressService.getChapterWords(chapterNumber);
        setChapterData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chapter data:', err);
        setError('Failed to load chapter data');
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [chapterNumber]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="text-lg text-gray-600">Loading chapter data...</div>
        </div>
      </div>
    );
  }

  if (error || !chapterData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="text-lg text-red-600">{error || 'Chapter not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Patient Info Section */}
        {patient && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-custom-blue rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{patient.full_name}</h2>
                  <p className="text-gray-500">Patient ID: {patient.patient_id}</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/home/patient', { state: { patient } })}
                className="px-4 py-2 text-custom-blue border border-custom-blue rounded-lg hover:bg-custom-blue hover:text-white transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-custom-blue to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">{chapterData.phoneme}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Phoneme Training
                </h1>
                <p className="text-gray-500 mt-1">
                  Chapter {chapterNumber} • {chapterData.words.length} words to practice
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Word List Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <BookOpen className="w-6 h-6 text-custom-blue mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Practice Words</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {chapterData.words.map((word, index) => (
              <div
                key={index}
                onClick={() => handleWordClick(word)}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white hover:border-custom-blue transition-all duration-300 cursor-pointer"
              >
                <div className="p-6 flex flex-col items-center justify-center">
                  <span className="text-xl font-semibold text-gray-800 group-hover:text-custom-blue transition-colors duration-300">
                    {word}
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    Word #{index + 1}
                  </span>
                </div>
                <div className="absolute inset-0 bg-custom-blue opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex justify-between items-center">
          <button
            disabled={chapterNumber <= 1}
            onClick={() => navigate(`/home/patient/chapter-${chapterNumber - 1}`, { state: { patient } })}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition duration-300
              ${chapterNumber <= 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-custom-blue border-2 border-custom-blue hover:bg-custom-blue hover:text-white'
              }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous Phoneme
          </button>

          <button
            onClick={() => navigate(`/home/patient/chapter-${chapterNumber + 1}`, { state: { patient } })}
            className="flex items-center px-6 py-3 rounded-lg font-medium transition duration-300 bg-custom-blue text-white hover:bg-blue-700"
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