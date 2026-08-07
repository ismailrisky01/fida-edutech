import React, { useState, useEffect } from 'react';
import type { Question } from '../types';
import { api } from '../services/api';

interface QuizViewProps {
  sessionId: number;
  type: 'pre' | 'post' | 'practice';
  topic: string;
  difficulty: string;
  courseId: number;
  onClose: (scoreUpdated?: boolean) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  sessionId,
  type,
  topic,
  difficulty,
  courseId,
  onClose
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [source, setSource] = useState<'cache' | 'ai' | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.getTestQuestions(sessionId, type, topic, difficulty);
        setQuestions(res.questions);
        setSource(res.source);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [sessionId, type, topic, difficulty]);

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: optIdx
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate score & finish
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctOptionIndex) {
          correctCount++;
        }
      });
      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);
      setQuizFinished(true);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSaveScore = async () => {
    if (type === 'practice') {
      onClose(false);
      return;
    }
    setSubmitting(true);
    try {
      await api.submitQuizScore(courseId, sessionId, type, score);
      onClose(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-border-subtle max-w-md w-full text-center flex flex-col items-center gap-4 shadow-2xl">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
          </div>
          <h3 className="font-headline-md font-bold text-text-heading text-lg mt-2">Menghubungkan ke Database Caching...</h3>
          <p className="text-sm text-text-muted">Mengecek ketersediaan soal latihan (Rule #4: Caching efisiensi token AI)...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-border-subtle max-w-md w-full text-center flex flex-col items-center gap-4 shadow-2xl">
          <span className="material-symbols-outlined text-[48px] text-error">error</span>
          <h3 className="font-headline-md font-bold text-text-heading text-lg">Gagal Memuat Soal</h3>
          <p className="text-sm text-text-muted">Koneksi terganggu atau topik tidak valid.</p>
          <button onClick={() => onClose()} className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-text-heading font-semibold text-sm">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const isAnswered = selectedAnswers[currentIdx] !== undefined;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-border-subtle shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden my-8">
        
        {/* Header Kuis */}
        <div className="bg-slate-50 border-b border-border-subtle px-6 py-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                type === 'pre' ? 'bg-orange-100 text-orange-700' : 
                type === 'post' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {type === 'pre' ? 'Pre-Test' : type === 'post' ? 'Post-Test' : 'Latihan'}
              </span>
              <span className="text-xs text-text-muted font-semibold">Topik: {topic.replace(/Math - |Scratch - /, '')}</span>
            </div>
            <h3 className="font-headline-md font-extrabold text-text-heading text-lg mt-1">
              {type === 'practice' ? 'Latihan Soal Bebas' : 'Kuis Evaluasi Belajar'}
            </h3>
          </div>

          {/* AI Cache Indicator Badge */}
          {source && (
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm border ${
              source === 'cache' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse'
            }`}
            title={source === 'cache' ? 'Soal diambil dari cache database, menghemat token AI!' : 'Soal baru di-generate secara real-time oleh AI.'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {source === 'cache' ? 'database' : 'psychology'}
              </span>
              <span>
                {source === 'cache' ? 'Cache HIT (Hemat Token)' : 'Cache MISS (AI Gen)'}
              </span>
            </div>
          )}
        </div>

        {/* Main Quiz Flow */}
        {!quizFinished ? (
          <div className="p-6 md:p-8 flex flex-col gap-6">
            
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs text-text-muted font-bold uppercase tracking-wider mb-2">
                <span>Pertanyaan {currentIdx + 1} dari {questions.length}</span>
                <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Selesai</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary h-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-border-subtle">
              <h4 className="font-body-lg text-text-heading font-semibold leading-relaxed">
                {currentQuestion.questionText}
              </h4>
            </div>

            {/* Options List */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentIdx] === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-secondary bg-secondary/5 font-semibold text-secondary ring-1 ring-secondary'
                        : 'border-border-subtle hover:bg-slate-50 text-text-body'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      isSelected 
                        ? 'bg-secondary text-white' 
                        : 'bg-slate-100 text-text-muted group-hover:bg-slate-200'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center border-t border-border-subtle pt-6">
              <button
                onClick={handleBack}
                disabled={currentIdx === 0}
                className="px-5 py-2.5 rounded-xl border border-border-subtle text-text-body font-bold text-sm hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">west</span>
                Sebelumnya
              </button>

              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5 ${
                  isAnswered ? 'bg-secondary hover:bg-secondary/95' : 'bg-slate-300 cursor-not-allowed shadow-none'
                }`}
              >
                {currentIdx === questions.length - 1 ? 'Selesai & Kumpul' : 'Selanjutnya'}
                <span className="material-symbols-outlined text-[18px]">east</span>
              </button>
            </div>

          </div>
        ) : (
          /* Results Page */
          <div className="p-6 md:p-8 flex flex-col gap-8 max-h-[70vh] overflow-y-auto">
            
            {/* Score Circle & Congrats */}
            <div className="flex flex-col items-center text-center gap-3 border-b border-border-subtle pb-8">
              <div className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center shadow-lg ${
                score >= 80 ? 'border-green-500 bg-green-50 text-green-700' : 
                score >= 60 ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-error bg-error-container/10 text-error'
              }`}>
                <span className="text-3xl font-extrabold">{score}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider -mt-1">Skor</span>
              </div>
              
              <h4 className="font-headline-md font-extrabold text-text-heading text-xl mt-3">
                {score >= 80 ? 'Hebat! Pertahankan Prestasimu!' : 
                 score >= 60 ? 'Bagus! Pelajari Lagi untuk Skor Sempurna' : 'Tetap Semangat! Teruslah Berlatih'}
              </h4>
              <p className="text-sm text-text-muted max-w-md">
                Kuis evaluasi selesai dikerjakan. Hasil jawaban Anda dan pembahasan terperinci dapat dilihat di bawah ini.
              </p>
            </div>

            {/* Answer Key & Explanations */}
            <div className="flex flex-col gap-6">
              <h4 className="font-headline-md font-bold text-text-heading text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">menu_book</span>
                Pembahasan Soal
              </h4>

              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctOptionIndex;

                return (
                  <div key={q.id} className="p-5 rounded-2xl border border-border-subtle bg-slate-50 flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-xs font-bold text-secondary bg-white px-2 py-1 rounded border border-border-subtle">Soal {idx + 1}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                        isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {isCorrect ? 'check_circle' : 'cancel'}
                        </span>
                        {isCorrect ? 'Benar' : 'Salah'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-text-heading leading-relaxed">{q.questionText}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        let optStyle = "bg-white border-border-subtle text-text-body";
                        if (oIdx === q.correctOptionIndex) {
                          optStyle = "bg-green-50 border-green-400 text-green-700 font-semibold";
                        } else if (oIdx === userAns && !isCorrect) {
                          optStyle = "bg-red-50 border-red-400 text-red-700 font-semibold";
                        }
                        
                        return (
                          <div key={oIdx} className={`p-2.5 rounded-lg border flex items-center gap-2 ${optStyle}`}>
                            <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-dashed border-slate-300 text-xs">
                      <div className="font-bold text-text-heading flex items-center gap-1 text-secondary mb-1">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        Penjelasan:
                      </div>
                      <p className="text-text-body leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save & Finish Button */}
            <div className="border-t border-border-subtle pt-6 flex justify-end">
              <button
                onClick={handleSaveScore}
                disabled={submitting}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Memproses...' : type === 'practice' ? 'Tutup Latihan' : 'Simpan & Kembali'}
                <span className="material-symbols-outlined text-[18px]">{type === 'practice' ? 'close' : 'save'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
