import { useState, useEffect, useCallback } from 'react';
import { Volume2, X, Check, Crown } from 'lucide-react';

const FlashcardStudy = ({ word, onNext, onMaster }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset trạng thái lật thẻ khi word thay đổi
  useEffect(() => {
    setIsFlipped(false);
  }, [word]);

  const playAudio = useCallback((e) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(word.word);
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    } else {
      alert("Trình duyệt không hỗ trợ phát âm thanh");
    }
  }, [word]);

  const handleAction = useCallback((isCorrect) => {
    onNext(isCorrect);
  }, [onNext]);

  // Xử lý phím tắt
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bỏ qua nếu đang gõ vào input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) {
        if (e.code === 'ArrowLeft') {
          handleAction(false);
        } else if (e.code === 'ArrowRight') {
          handleAction(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleAction]);

  if (!word) return null;

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-full max-w-2xl h-96 [perspective:1000px] cursor-pointer mb-8"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          {/* Mặt trước: Tiếng Anh */}
          <div className="absolute inset-0 bg-card border-2 rounded-3xl p-8 flex flex-col items-center justify-center [backface-visibility:hidden] hover:border-primary/50 transition-colors shadow-sm">
            <button 
              onClick={playAudio}
              className="absolute top-6 right-6 p-4 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <h2 className="text-6xl font-black mb-6 tracking-tight">{word.word}</h2>
            <p className="text-2xl text-muted-foreground font-medium">{word.ipa}</p>
            <p className="absolute bottom-8 text-sm text-muted-foreground animate-pulse">Nhấn Space hoặc Click để lật thẻ</p>
          </div>

          {/* Mặt sau: Tiếng Việt */}
          <div className="absolute inset-0 bg-primary/5 border-2 border-primary/20 rounded-3xl p-8 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-sm">
            <h3 className="text-4xl font-bold text-primary mb-8 text-center">{word.meaning}</h3>
            {word.example && (
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground italic">"{word.example}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className={`flex flex-col items-center gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex gap-4">
          <button 
            onClick={() => handleAction(false)}
            className="flex items-center gap-2 px-8 py-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl font-bold transition-colors"
          >
            <X className="w-5 h-5" />
            Quên / Sai <span className="text-xs opacity-50 ml-1">[←]</span>
          </button>
          <button 
            onClick={() => handleAction(true)}
            className="flex items-center gap-2 px-8 py-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl font-bold transition-colors"
          >
            <Check className="w-5 h-5" />
            Nhớ / Đúng <span className="text-xs opacity-50 ml-1">[→]</span>
          </button>
        </div>
        
        {onMaster && (
          <button 
            onClick={onMaster}
            className="flex items-center gap-2 px-6 py-2 mt-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-full font-bold transition-colors text-sm"
          >
            <Crown className="w-4 h-4" />
            Đã thuộc (Bỏ qua mọi cấp độ)
          </button>
        )}
      </div>
    </div>
  );
};

export default FlashcardStudy;
