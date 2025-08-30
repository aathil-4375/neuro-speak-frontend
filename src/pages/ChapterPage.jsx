import React, { useEffect, useMemo, useState, useCallback } from "react";
import NavBar from "../components/NavBar";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight, User, Play } from "lucide-react";
import api from "../services/api";
import CreateWordFab from "../components/CreateWordFab";

const ChapterPage = () => {
  const { chapterId } = useParams(); // "chapter-1"
  const navigate = useNavigate();
  const location = useLocation();

  // language passed from PatientUser route state; default to Tamil if missing
  const language = (location.state?.language || "ta").toLowerCase(); // 'ta' | 'si'
  const patient = location.state?.patient || null;

  const chapterNumber = useMemo(() => {
    try {
      return parseInt(String(chapterId).replace("chapter-", ""), 10);
    } catch {
      return 1;
    }
  }, [chapterId]);

  const [chapter, setChapter] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const [cRes, wRes] = await Promise.all([
        api.get(`/chapters/${language}/${chapterNumber}/`),
        api.get(`/chapters/${language}/${chapterNumber}/words/`),
      ]);
      setChapter(cRes.data);
      setWords(wRes.data || []);
    } catch (e) {
      console.error(e);
      setErr("Failed to load chapter/words");
    } finally {
      setLoading(false);
    }
  }, [language, chapterNumber]);

  useEffect(() => {
    load();
  }, [load]);

  const onWordCreated = () => load();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-custom-blue border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-xl text-gray-700 font-medium">Loading chapter…</div>
          </div>
        </div>
      </div>
    );
  }

  if (err || !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate("/home/patient", { state: { patient } })}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-custom-blue"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patient Dashboard
          </button>
          <div className="mt-8 bg-white rounded-2xl p-8 shadow">
            <p className="text-red-600">{err || "Chapter not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/home/patient", { state: { patient } })}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-custom-blue"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patient Dashboard
          </button>
        </div>

        {/* Patient card (if available) */}
        {patient && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-custom-blue to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{patient.full_name}</h2>
                <div className="flex gap-2 mt-1 text-sm">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border">ID: {patient.patient_id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border">{patient.gender}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapter header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-custom-blue to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">{chapter?.name?.slice(0, 2) || "Ph"}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {chapter?.name} <span className="text-gray-500">— Chapter {chapterNumber}</span>
              </h1>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-700">
                  Language: {language === "ta" ? "Tamil" : "Sinhala"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 border text-green-700">
                  {words.length} words
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Words */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <BookOpen className="w-6 h-6 text-custom-blue mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Practice Words</h2>
          </div>

          {words.length === 0 ? (
            <div className="text-gray-600">No words yet. Use the green “+” to add one.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((w) => (
                <div
                  key={w.id}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white hover:border-custom-blue hover:shadow-md transition-all"
                >
                  <div className="p-5 flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{w.word}</div>
                      <div className="text-xs text-gray-500 mt-1">Order #{w.order}</div>
                    </div>

                    {w.reference_video_url ? (
                      <a
                        href={w.reference_video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-custom-blue hover:underline"
                        title="Preview Reference Video"
                      >
                        <Play className="w-4 h-4" />
                        Preview
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500">No video</span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      navigate("/graph-tab", {
                        state: { patient, chapter: chapterNumber, word: w.word, phoneme: chapter?.name },
                      })
                    }
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-xs text-white bg-custom-blue px-2 py-1 rounded"
                  >
                    Analyze
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Create Word button (uploads to S3 via backend) */}
      <CreateWordFab language={language} chapterNumber={chapterNumber} onCreated={onWordCreated} />
    </div>
  );
};

export default ChapterPage;
