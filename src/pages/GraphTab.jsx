// frontend/src/pages/GraphTab.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Area, AreaChart, PieChart, Pie, Cell,
} from "recharts";
import {
  Calendar, BarChart2, PieChart as PieChartIcon, Activity,
  ArrowLeft, ArrowRight, Play, Film, History
} from "lucide-react";

import NavBar from "../components/NavBar";
import { progressService } from "../services/progress";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const GraphTab = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient, chapter, word, phoneme, language = "ta" } = location.state || {};

  // Graph state
  const [timeFrame, setTimeFrame] = useState("weekly");
  const [graphType, setGraphType] = useState("line");
  const [graphData, setGraphData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Word list for prev/next
  const [allWords, setAllWords] = useState([]);

  // Video panel state
  const [refVideoUrl, setRefVideoUrl] = useState("");
  const [trials, setTrials] = useState([]); // [{id, created_at, accuracy, video_url}, ...]
  const [selectedTrialIdx, setSelectedTrialIdx] = useState(0);
  const [videoTab, setVideoTab] = useState("trials"); // 'trials' | 'reference'

  // -----------------------------
  // Fetch words for the chapter (also gives us reference video url for the active word)
  // -----------------------------
  useEffect(() => {
    const fetchWords = async () => {
      if (!chapter) return;
      try {
        // Expect: { data: { words: ["bus", "cat", ...] } } OR full objects
        const response = await progressService.getChapterWords(chapter, language);
        const words = response?.data?.words || [];
        setAllWords(Array.isArray(words) ? words.map(w => (typeof w === "string" ? w : w.word)) : []);

        // If backend returns full word objects with reference_video_url
        const wordObj = (response?.data?.words || []).find(w =>
          (typeof w === "string" ? w : w.word) === word
        );
        if (wordObj && typeof wordObj === "object" && wordObj.reference_video_url) {
          setRefVideoUrl(wordObj.reference_video_url);
        } else {
          // Fallback: try a dedicated meta endpoint if you added one
          try {
            const meta = await progressService.getWordMeta?.(chapter, word, language);
            if (meta?.data?.reference_video_url) setRefVideoUrl(meta.data.reference_video_url);
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.error("Error fetching words:", err);
      }
    };
    fetchWords();
  }, [chapter, word, language]);

  // -----------------------------
  // Fetch progress + trials for the word
  // -----------------------------
  const fetchProgressData = useCallback(async () => {
    if (!patient?.patient_id || !chapter || !word) {
      setError("Missing required information");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1) Progress timeseries (for charts)
      const response = await progressService.getWordProgress(
        patient.patient_id, chapter, word
      );
      const trialsRaw = response?.data?.trials || [];

      // 2) Patient trials w/ video URLs (for viewer)
      //    Expect each trial item to contain: id, created_at, accuracy, video_url
      //    If your getWordProgress already includes video_url in `trials`, you can reuse.
      let trialsWithVideo = [];
      try {
        const trialRes = await progressService.getWordTrials(
          patient.patient_id, chapter, word
        );
        trialsWithVideo = trialRes?.data?.trials || [];
      } catch {
        // fallback: use the same list if it already has video_url
        trialsWithVideo = trialsRaw.filter(t => t.video_url);
      }

      // keep newest first for the right panel
      const sortedTrials = [...trialsWithVideo].sort((a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      setTrials(sortedTrials);
      setSelectedTrialIdx(0);

      // ---- Build graph data + stats
      if (!trialsRaw.length) {
        setGraphData([]);
        setStatistics(null);
        setLoading(false);
        return;
      }

      // Process by timeframe
      let processedData = [];
      const stats = {
        totalTrials: trialsRaw.length,
        averageAccuracy: 0,
        improvement: 0,
        bestScore: 0,
        worstScore: 100,
      };

      if (timeFrame === "weekly") {
        const weeklyData = {};
        trialsRaw.forEach(trial => {
          const date = new Date(trial.year, getMonthNumber(trial.month), trial.date);
          const weekNum = getWeekNumber(date);
          const weekKey = `${trial.year}-W${weekNum}`;

          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { week: weekKey, accuracy: 0, count: 0, trials: [] };
          }
          weeklyData[weekKey].accuracy += trial.accuracy;
          weeklyData[weekKey].count += 1;
          weeklyData[weekKey].trials.push(trial);
        });

        processedData = Object.values(weeklyData).map(week => ({
          name: week.week.replace("-W", " Week "),
          accuracy: Math.round(week.accuracy / week.count),
          totalTrials: week.count,
          bestTrial: Math.max(...week.trials.map(t => t.accuracy)),
          worstTrial: Math.min(...week.trials.map(t => t.accuracy)),
        }));
      } else {
        const monthlyData = {};
        trialsRaw.forEach(trial => {
          const monthKey = `${trial.month} ${trial.year}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { month: monthKey, accuracy: 0, count: 0, trials: [] };
          }
          monthlyData[monthKey].accuracy += trial.accuracy;
          monthlyData[monthKey].count += 1;
          monthlyData[monthKey].trials.push(trial);
        });

        processedData = Object.values(monthlyData).map(month => ({
          name: month.month,
          accuracy: Math.round(month.accuracy / month.count),
          totalTrials: month.count,
          bestTrial: Math.max(...month.trials.map(t => t.accuracy)),
          worstTrial: Math.min(...month.trials.map(t => t.accuracy)),
        }));
      }

      const accuracies = trialsRaw.map(t => t.accuracy);
      stats.averageAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length);
      stats.improvement = accuracies[accuracies.length - 1] - accuracies[0];
      stats.bestScore = Math.max(...accuracies);
      stats.worstScore = Math.min(...accuracies);

      setStatistics(stats);
      setGraphData(processedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setError("Failed to load progress data");
      setLoading(false);
    }
  }, [patient, chapter, word, timeFrame]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // Helpers
  const getMonthNumber = (monthName) => {
    const months = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];
    return months.indexOf(monthName);
  };
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Navigation
  const currentWordIndex = useMemo(() => allWords.indexOf(word), [allWords, word]);
  const navigateToPreviousWord = () => {
    if (currentWordIndex > 0) {
      const previousWord = allWords[currentWordIndex - 1];
      navigate("/graph-tab", { state: { patient, chapter, word: previousWord, phoneme, language } });
    }
  };
  const navigateToNextWord = () => {
    if (currentWordIndex < allWords.length - 1) {
      const nextWord = allWords[currentWordIndex + 1];
      navigate("/graph-tab", { state: { patient, chapter, word: nextWord, phoneme, language } });
    }
  };

  // Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-custom-blue">{label}</p>
          <p className="text-gray-700">Average: {payload[0].value}%</p>
          <p className="text-gray-600">Total Trials: {payload[0].payload.totalTrials}</p>
          <p className="text-green-600">Best: {payload[0].payload.bestTrial}%</p>
          <p className="text-red-600">Worst: {payload[0].payload.worstTrial}%</p>
        </div>
      );
    }
    return null;
  };

  // Render graph
  const renderGraph = () => {
    switch (graphType) {
      case "line":
        return (
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="accuracy" stroke="#4F46E5" strokeWidth={3}
              dot={{ r: 5, fill: "#4F46E5" }} activeDot={{ r: 8 }} />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="accuracy" fill="#4F46E5">
              {graphData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="accuracy" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie data={graphData} dataKey="accuracy" nameKey="name" cx="50%" cy="50%" outerRadius={120}
              fill="#4F46E5" label={({ name, value }) => `${name}: ${value}%`}>
              {graphData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      default:
        return null;
    }
  };

  // UI: loading / error
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="text-lg text-gray-600">Loading progress data...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  // Determine current video URL for viewer
  const currentTrial = trials[selectedTrialIdx];
  const currentVideoUrl =
    videoTab === "reference" ? refVideoUrl : (currentTrial?.video_url || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Patient Info */}
        {patient && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 backdrop-blur-sm bg-opacity-90">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.full_name}</h2>
                <p className="text-gray-500">Patient ID: {patient.patient_id}</p>
              </div>
              <button
                onClick={() => navigate(`/home/patient/chapter-${chapter}`, { state: { patient } })}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-custom-blue to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-custom-blue transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Chapter
              </button>
            </div>
          </div>
        )}

        {/* Word Info and Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-90">
            <h2 className="text-3xl font-bold text-custom-blue mb-2">
              {word?.toUpperCase()}
            </h2>
            <p className="text-xl text-gray-600">
              Chapter {chapter} • Phoneme: {phoneme}
            </p>
          </div>

          {statistics && (
            <div className="bg-gradient-to-br from-custom-blue to-indigo-600 text-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Overall Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">Average</p>
                  <p className="text-2xl font-bold">{statistics.averageAccuracy}%</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Improvement</p>
                  <p className="text-2xl font-bold">
                    {statistics.improvement > 0 ? "+" : ""}{statistics.improvement}%
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Best Score</p>
                  <p className="text-2xl font-bold">{statistics.bestScore}%</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Total Trials</p>
                  <p className="text-2xl font-bold">{statistics.totalTrials}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 backdrop-blur-sm bg-opacity-90">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Time Frame */}
            <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setTimeFrame("weekly")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-300 ${
                  timeFrame === "weekly"
                    ? "bg-white text-custom-blue shadow-md"
                    : "text-gray-600 hover:text-custom-blue"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Weekly
              </button>
              <button
                onClick={() => setTimeFrame("monthly")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-300 ${
                  timeFrame === "monthly"
                    ? "bg-white text-custom-blue shadow-md"
                    : "text-gray-600 hover:text-custom-blue"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Monthly
              </button>
            </div>

            {/* Graph Type */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGraphType("line")}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  graphType === "line"
                    ? "bg-custom-blue text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Activity className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGraphType("bar")}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  graphType === "bar"
                    ? "bg-custom-blue text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <BarChart2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGraphType("area")}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  graphType === "area"
                    ? "bg-custom-blue text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 21H3V3" />
                  <path d="M3 20L9 14L13 18L21 10" />
                  <path d="M3 19V15L9 9L13 13L21 5V19H3Z" fill="currentColor" fillOpacity="0.2" />
                </svg>
              </button>
              <button
                onClick={() => setGraphType("pie")}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  graphType === "pie"
                    ? "bg-custom-blue text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <PieChartIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Graph + Video: two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Graph */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 backdrop-blur-sm bg-opacity-90">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Progress
            </h2>
            {graphData.length > 0 ? (
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {renderGraph()}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-lg h-96 flex items-center justify-center">
                No progress data available 📊
              </div>
            )}
          </div>

          {/* Videos Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-90">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-custom-blue" />
                Videos
              </h3>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setVideoTab("trials")}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    videoTab === "trials" ? "bg-white shadow text-custom-blue" : "text-gray-600"
                  }`}
                >
                  Patient Trials
                </button>
                <button
                  onClick={() => setVideoTab("reference")}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    videoTab === "reference" ? "bg-white shadow text-custom-blue" : "text-gray-600"
                  }`}
                >
                  Reference
                </button>
              </div>
            </div>

            {/* Player */}
            <div className="rounded-xl overflow-hidden border">
              {currentVideoUrl ? (
                <video
                  key={currentVideoUrl} // force reload on tab/selection change
                  src={currentVideoUrl}
                  controls
                  controlsList="nodownload noplaybackrate"
                  className="w-full aspect-video bg-black"
                />
              ) : (
                <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-500">
                  No video available
                </div>
              )}
            </div>

            {/* Trials list */}
            {videoTab === "trials" && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <History className="w-4 h-4" />
                  {trials.length ? `${trials.length} uploads` : "No uploads yet"}
                </div>
                <div className="max-h-56 overflow-auto divide-y">
                  {trials.map((t, idx) => {
                    const ts = t.created_at ? new Date(t.created_at) : null;
                    const label = ts
                      ? `${ts.toLocaleDateString()} ${ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : `Trial #${t.id || idx + 1}`;
                    return (
                      <button
                        key={t.id || idx}
                        onClick={() => { setSelectedTrialIdx(idx); setVideoTab("trials"); }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between ${
                          idx === selectedTrialIdx ? "bg-indigo-50" : ""
                        }`}
                      >
                        <span className="truncate">
                          {label} • Acc: {t.accuracy ?? "—"}%
                        </span>
                        <Play className="w-4 h-4 text-custom-blue shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reference info */}
            {videoTab === "reference" && (
              <p className="mt-3 text-sm text-gray-500">
                Reference pronunciation video for <strong>{word}</strong>.
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={navigateToPreviousWord}
            disabled={currentWordIndex <= 0}
            className={`flex items-center gap-2 px-6 py-3 bg-white text-custom-blue border-2 border-custom-blue rounded-xl transition-all duration-300 shadow-md hover:shadow-lg
              ${currentWordIndex <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-custom-blue hover:text-white"}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Word
          </button>

          <button
            onClick={() => navigate("/home/patient", { state: { patient } })}
            className="px-8 py-3 bg-gradient-to-r from-custom-blue to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-custom-blue transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Patient Dashboard
          </button>

          <button
            onClick={navigateToNextWord}
            disabled={currentWordIndex >= allWords.length - 1}
            className={`flex items-center gap-2 px-6 py-3 bg-white text-custom-blue border-2 border-custom-blue rounded-xl transition-all duration-300 shadow-md hover:shadow-lg
              ${currentWordIndex >= allWords.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-custom-blue hover:text-white"}`}
          >
            Next Word
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphTab;
