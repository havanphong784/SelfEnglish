import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchWithAuth } from '../../utils/api';

import FlashcardStudy from './FlashcardStudy';
import MultipleChoiceStudy from './MultipleChoiceStudy';
import TypingStudy from './TypingStudy';

const StudyController = () => {
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('packageId');
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());

  const loadStudySession = useCallback(async () => {
    try {
      setLoading(true);
      let data = [];
      if (mode === 'practice' && packageId) {
        data = await fetchWithAuth(`/vocabularies/packages/${packageId}/practice`);
      } else if (packageId) {
        data = await fetchWithAuth(`/vocabularies/packages/${packageId}/learn`);
      } else {
        data = await fetchWithAuth('/vocabularies/review');
      }
      setWords(data);
    } catch (error) {
      console.error('Lỗi tải bài học:', error);
    } finally {
      setLoading(false);
    }
  }, [mode, packageId]);

  useEffect(() => {
    const savedSessionStr = sessionStorage.getItem('currentStudySession');
    if (savedSessionStr) {
      const savedSession = JSON.parse(savedSessionStr);
      if (savedSession.packageId === packageId && savedSession.mode === mode) {
        if (window.confirm('Bạn có phiên học đang dở, muốn tiếp tục không?')) {
          setWords(savedSession.words);
          setCurrentIndex(savedSession.currentIndex);
          setLoading(false);
          return;
        }
        sessionStorage.removeItem('currentStudySession');
      }
    }
    loadStudySession();
  }, [packageId, mode, loadStudySession]);

  useEffect(() => {
    if (words.length > 0 && !isFinished) {
      sessionStorage.setItem('currentStudySession', JSON.stringify({ packageId, mode, currentIndex, words }));
    } else if (isFinished) {
      sessionStorage.removeItem('currentStudySession');
    }
  }, [currentIndex, words, isFinished, packageId, mode]);

  useEffect(() => {
    if (words.length > 0 && words[currentIndex] && !isFinished) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(words[currentIndex].word);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
      }
    }
  }, [currentIndex, words, isFinished]);

  const playSound = (type) => {
    try {
      const audio = new Audio(type === 'correct' ? '/sounds/correct.mp3' : '/sounds/error.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.error('Lỗi phát âm thanh:', error);
    }
  };

  const handleResult = async (result) => {
    const currentWord = words[currentIndex];
    const rating = typeof result === 'object' ? result.rating : null;
    const isCorrect = rating ? rating !== 'again' : Boolean(result);

    playSound(isCorrect ? 'correct' : 'incorrect');

    if (mode !== 'practice') {
      try {
        await fetchWithAuth(`/vocabularies/${currentWord.id}/review`, {
          method: 'POST',
          body: JSON.stringify(rating ? { rating } : { isCorrect }),
        });
      } catch (error) {
        console.error('Lỗi khi lưu kết quả:', error);
      }
    }

    moveToNext();
  };

  const handleMaster = async () => {
    const currentWord = words[currentIndex];
    playSound('correct');
    confetti({
      particleCount: 90,
      spread: 64,
      origin: { y: 0.62 },
      colors: ['#3f7661', '#6f786f', '#f6f7f2'],
    });

    if (mode !== 'practice') {
      try {
        await fetchWithAuth(`/vocabularies/${currentWord.id}/master`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Lỗi khi đánh dấu thuộc:', error);
      }
    }

    moveToNext();
  };

  const moveToNext = async () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
      const durationMinutes = Math.max(1, Math.floor((Date.now() - startTime) / 60000));
      try {
        await fetchWithAuth('/vocabularies/session', {
          method: 'POST',
          body: JSON.stringify({
            durationMinutes,
            wordsLearned: words.length,
          }),
        });
      } catch (error) {
        console.error('Lỗi lưu phiên học:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-xl surface-panel p-8">
        <div className="mb-8 h-3 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-shimmer bg-primary/40" />
        </div>
        <div className="h-10 w-80 max-w-full rounded-full bg-muted" />
        <div className="mt-5 h-4 w-full rounded-full bg-muted" />
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="mx-auto mt-14 max-w-xl rounded-xl surface-panel p-8 text-center">
        <Layers className="mx-auto mb-4 h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Không có từ vựng nào</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Có thể bạn đã học hết gói này, hoặc hôm nay chưa có từ nào cần ôn.
        </p>
        <button
          onClick={() => navigate('/dashboard/vocabulary')}
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground pressable"
        >
          Quay lại thư viện
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="mx-auto mt-14 max-w-xl rounded-xl surface-panel p-8 text-center md:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CheckCircle className="h-9 w-9" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Hoàn thành phiên học</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Kết quả đã được lưu. Quay lại thư viện để chọn phiên tiếp theo khi bạn sẵn sàng.
        </p>
        <button
          onClick={() => navigate('/dashboard/vocabulary')}
          className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground pressable"
        >
          Về thư viện
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progressPercent = ((currentIndex + 1) / words.length) * 100;
  const currentLevel = currentWord.level || 1;
  const StudyComponent = currentLevel <= 2 ? FlashcardStudy : currentLevel <= 4 ? MultipleChoiceStudy : TypingStudy;

  const renderLevelDots = () => (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5, 6].map((level) => (
        <div
          key={level}
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${level <= currentLevel ? 'bg-primary' : 'bg-muted'}`}
          title={`Level ${level}`}
        />
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl pt-2">
      <div className="mb-6 rounded-xl surface-flat p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/vocabulary')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground pressable hover:text-primary"
            aria-label="Quay lại thư viện"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <span>Phiên học</span>
              <span className="tabular-nums">{currentIndex + 1} / {words.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentWord.id}>
        <div className="mb-5">{renderLevelDots()}</div>
        <StudyComponent word={currentWord} onNext={handleResult} onMaster={handleMaster} />
      </div>
    </div>
  );
};

export default StudyController;
