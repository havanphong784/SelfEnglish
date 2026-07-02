import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    loadStudySession();
  }, [packageId, mode]);

  const loadStudySession = async () => {
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
  };

  // Tự động phát âm thanh khi chuyển sang từ mới
  useEffect(() => {
    if (words.length > 0 && words[currentIndex] && !isFinished) {
      if ('speechSynthesis' in window) {
        // Tuỳ chọn huỷ đọc cũ để tránh đè giọng
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(words[currentIndex].word);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
      }
    }
  }, [currentIndex, words, isFinished]);

  const playSound = (type) => {
    try {
      const audio = new Audio(
        type === 'correct' 
          ? 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3'
          : 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=error-126627.mp3'
      );
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.error('Lỗi phát âm thanh:', e);
    }
  };

  const handleResult = async (isCorrect) => {
    const currentWord = words[currentIndex];
    
    // Phát âm thanh đúng sai
    playSound(isCorrect ? 'correct' : 'incorrect');

    // Gửi kết quả lên server nếu KHÔNG PHẢI là chế độ practice
    if (mode !== 'practice') {
      try {
        await fetchWithAuth(`/vocabularies/${currentWord.id}/review`, {
          method: 'POST',
          body: JSON.stringify({ isCorrect })
        });
      } catch (err) {
        console.error('Lỗi khi lưu kết quả:', err);
      }
    }

    moveToNext();
  };

  const handleMaster = async () => {
    const currentWord = words[currentIndex];
    playSound('correct');
    
    if (mode !== 'practice') {
      try {
        await fetchWithAuth(`/vocabularies/${currentWord.id}/master`, {
          method: 'POST'
        });
      } catch (err) {
        console.error('Lỗi khi đánh dấu thuộc:', err);
      }
    }
    
    moveToNext();
  };

  const moveToNext = async () => {
    // Chuyển sang từ tiếp theo
    if (currentIndex + 1 < words.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
      // Lưu session
      const durationMinutes = Math.max(1, Math.floor((Date.now() - startTime) / 60000));
      try {
        await fetchWithAuth('/vocabularies/session', {
          method: 'POST',
          body: JSON.stringify({
            durationMinutes,
            wordsLearned: words.length
          })
        });
      } catch (err) {
        console.error('Lỗi lưu phiên học:', err);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Đang chuẩn bị bài học...</div>;
  }

  if (words.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-6">
        <h2 className="text-2xl font-bold">Không có từ vựng nào!</h2>
        <p className="text-muted-foreground">Có thể bạn đã học hết gói này, hoặc hôm nay không có từ nào cần ôn.</p>
        <button 
          onClick={() => navigate('/dashboard/vocabulary')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-xl"
        >
          Quay lại Thư viện
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-6 bg-card border rounded-3xl p-12">
        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold">Hoàn thành xuất sắc!</h2>
        <p className="text-muted-foreground">Bạn đã hoàn tất phiên học. Hãy nghỉ ngơi và quay lại vào ngày mai nhé.</p>
        <button 
          onClick={() => navigate('/dashboard/vocabulary')}
          className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-pink-500/20 mt-4"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progressPercent = ((currentIndex) / words.length) * 100;

  // Quyết định Component render dựa trên Level
  let StudyComponent;
  const currentLevel = currentWord.level || 1; // Default to 1 if new word

  if (currentLevel <= 2) {
    StudyComponent = FlashcardStudy;
  } else if (currentLevel <= 4) {
    StudyComponent = MultipleChoiceStudy;
  } else {
    StudyComponent = TypingStudy;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header & Progress */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/dashboard/vocabulary')}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="font-medium text-sm text-muted-foreground whitespace-nowrap">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      {/* Render Sub-Component */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentWord.id}>
        <StudyComponent 
          word={currentWord} 
          onNext={handleResult} 
          onMaster={handleMaster}
        />
      </div>
    </div>
  );
};

export default StudyController;
