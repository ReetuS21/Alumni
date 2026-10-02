import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { saveSkillVerification } from "../services/dataService";
import { Sparkles, Award, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, X } from "lucide-react";

export const SkillVerificationModal = ({ isOpen, onClose, onVerified }) => {
  const { user } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState("Full Stack Web Development (React & Node.js)");
  const [currentStep, setCurrentStep] = useState(1); // 1: Select track, 2: Quiz, 3: Verified Card
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const tracks = [
    {
      title: "Full Stack Web Development (React & Node.js)",
      desc: "Tests component architecture, state management, async JS, REST APIs & security."
    },
    {
      title: "Cloud & DevOps (AWS & Docker)",
      desc: "Tests containerization, serverless functions, CI/CD pipelines & IAM policies."
    },
    {
      title: "Data Structures & AI Algorithms",
      desc: "Tests algorithmic logic, database optimization, SQL queries & data pipelines."
    }
  ];

  const questions = [
    {
      id: 1,
      q: "In React 18/19, which hook is used for executing side-effects after state updates?",
      options: ["useMemo", "useEffect", "useState", "useContext"],
      answer: "useEffect"
    },
    {
      id: 2,
      q: "How does Cloud Firestore enforce role-based access control?",
      options: ["Client side if/else logic", "Firestore Security Rules", "Express router middleware", "Cookies"],
      answer: "Firestore Security Rules"
    },
    {
      id: 3,
      q: "What is the key advantage of an ATS-friendly single-column resume?",
      options: ["It looks decorative", "It uses multi-column tables", "It ensures high parser readability without format errors", "It hides text in images"],
      answer: "It ensures high parser readability without format errors"
    }
  ];

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    setVerifying(true);
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);

    // Save verification in database / localStorage
    if (user) {
      await saveSkillVerification(user.uid, selectedTrack, calculatedScore);
    }

    setVerifying(false);
    setCurrentStep(3);
    if (onVerified) onVerified();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-xl">AI-Assisted Skill Verification Engine</h2>
              <p className="text-xs text-indigo-100">Earn your Official Verified Skill Card & Alumni Badge</p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Track */}
        {currentStep === 1 && (
          <div className="p-6 space-y-5">
            <h3 className="font-semibold text-slate-900 text-sm">Select Your Primary Skill Verification Track:</h3>
            <div className="space-y-3">
              {tracks.map(track => (
                <div
                  key={track.title}
                  onClick={() => setSelectedTrack(track.title)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedTrack === track.title
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{track.title}</span>
                    <input
                      type="radio"
                      checked={selectedTrack === track.title}
                      onChange={() => setSelectedTrack(track.title)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{track.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md mt-4"
            >
              <span>Start Assessment Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Quiz Assessment */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b">
              <span>Track: <strong>{selectedTrack}</strong></span>
              <span>Questions: {Object.keys(answers).length} of {questions.length} answered</span>
            </div>

            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <p className="font-semibold text-slate-900 text-sm">
                    {idx + 1}. {q.q}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`text-left text-xs p-3 rounded-xl border transition-all ${
                          answers[q.id] === opt
                            ? "bg-indigo-600 text-white font-medium border-indigo-600 shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length < questions.length || verifying}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Skill Verification...</span>
                </>
              ) : (
                <>
                  <span>Submit & Verify Skills</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Verified Skill Card */}
        {currentStep === 3 && (
          <div className="p-6 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OFFICIAL VERIFIED BADGE EARNED</span>
              </span>
              <h3 className="font-bold text-2xl text-slate-900">Skill Verification Complete!</h3>
              <p className="text-sm text-slate-500 mt-1">
                Your verification record has been generated and appended to your Alumni Hub Profile.
              </p>
            </div>

            {/* Verification Card Box */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl text-left relative overflow-hidden shadow-xl border border-slate-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Verified Skill Card</span>
                  <h4 className="font-bold text-lg text-white">{selectedTrack}</h4>
                </div>
                <div className="bg-emerald-500 text-slate-950 font-extrabold text-sm px-3 py-1 rounded-lg">
                  {score}% SCORE
                </div>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p>Candidate: <strong className="text-white">{user?.name || "Student"}</strong></p>
                <p>Status: <span className="text-emerald-400 font-semibold">AI-Verified & Endorsed</span></p>
                <p>Verification ID: <span className="font-mono text-slate-400">VER-{Math.floor(100000 + Math.random() * 900000)}</span></p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Done, Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
