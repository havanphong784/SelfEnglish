import { useState, useEffect, useCallback } from 'react';
import { Volume2, X, Check, Crown, Repeat, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FlashcardStudy = ({ word, onNext, onMaster }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [reverseMode, setReverseMode] = useState(false); // true = VI -> EN
  const [autoPlay, setAutoPlay] = useState(true);
  const [showHint, setShowHint] = useState(false);

  // Reset when word changes
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
    if (autoPlay && !reverseMode) {
      playAudio(null, word?.word);
    }
  }, [word, autoPlay, reverseMode]);

  // Handle auto-play on flip if reverse mode
  useEffect(() => {
    if (isFlipped && autoPlay && reverseMode) {
      playAudio(null, word?.word);
    }
  }, [isFlipped, autoPlay, reverseMode, word]);

  const playAudio = useCallback((e, textToPlay) => {
    if (e) e.stopPropagation();
    if (!textToPlay && word) textToPlay = word.word;
    if (!textToPlay) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(textToPlay);
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    }
  }, [word]);

  const handleAction = useCallback((isCorrect) => {
    onNext(isCorrect);
  }, [onNext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
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

  const englishSide = (
    <div className="absolute inset-0 bg-white border border-border rounded-[2rem] p-8 flex flex-col items-center justify-center [backface-visibility:hidden] soft-shadow">
      <button 
        onClick={(e) => playAudio(e, word.word)}
        className="absolute top-6 right-6 p-4 rounded-full bg-primary/5 hover:bg-primary/20 text-primary transition-colors"
        title="Phát âm thanh"
      >
        <Volume2 className="w-6 h-6" />
      </button>
      
      {word.partOfSpeech && (
        <span className="px-4 py-1.5 bg-secondary text-secondary-foreground text-sm font-bold rounded-xl mb-4 border border-border/50">
          {word.partOfSpeech}
        </span>
      )}
      
      <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tight text-foreground text-center">
        {word.word}
      </h2>
      
      {word.ipa && (
        <p className="text-xl md:text-2xl text-muted-foreground font-medium font-mono bg-secondary/30 px-4 py-1 rounded-lg">
          {word.ipa}
        </p>
      )}

      {word.synonyms && word.synonyms.length > 0 && (
        <div className="absolute bottom-8 left-8 right-8 text-center bg-primary/5 rounded-xl p-3">
          <p className="text-sm text-primary/80">
            <span className="font-bold">Đồng nghĩa:</span> {word.synonyms}
          </p>
        </div>
      )}
    </div>
  );

  const vietnameseSide = (
    <div className="absolute inset-0 bg-white border border-primary/20 rounded-[2rem] p-8 flex flex-col items-center justify-center [backface-visibility:hidden] soft-shadow-primary" style={{ transform: 'rotateY(180deg)' }}>
      <h3 className="text-3xl md:text-5xl font-bold text-primary mb-8 text-center leading-tight">
        {word.meaning}
      </h3>
      
      {word.example && (
        <div className="bg-background/80 p-6 rounded-2xl border border-primary/10 max-w-xl w-full text-center shadow-sm">
          <p className="text-lg md:text-xl font-medium text-foreground italic">
            "{word.example}"
          </p>
        </div>
      )}

      {!reverseMode && (
         <button 
         onClick={(e) => playAudio(e, word.word)}
         className="absolute top-6 right-6 p-4 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
         title="Phát âm thanh"
       >
         <Volume2 className="w-6 h-6" />
       </button>
      )}
    </div>
  );

  const frontContent = reverseMode ? (
    <div className="absolute inset-0 bg-white border border-primary/20 rounded-[2rem] p-8 flex flex-col items-center justify-center [backface-visibility:hidden] soft-shadow-primary">
      <h3 className="text-3xl md:text-5xl font-bold text-primary mb-8 text-center leading-tight">
        {word.meaning}
      </h3>
      
      {showHint ? (
         <div className="mt-4 p-5 bg-background/80 rounded-2xl border border-primary/20 shadow-inner">
            <p className="text-2xl font-mono tracking-[0.3em] text-foreground font-bold">
              {word.word[0].toUpperCase()}{Array(word.word.length - 1).fill('_').join(' ')}
            </p>
         </div>
      ) : (
         <button 
           onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
           className="mt-4 flex items-center gap-2 px-6 py-3 bg-background hover:bg-secondary border border-border rounded-xl font-medium text-muted-foreground hover:text-foreground transition-all shadow-sm"
         >
           <Lightbulb className="w-5 h-5 text-yellow-500" /> Xem gợi ý từ
         </button>
      )}
    </div>
  ) : (
    englishSide
  );

  const backContent = reverseMode ? (
    <div className="absolute inset-0 bg-white border border-border rounded-[2rem] p-8 flex flex-col items-center justify-center [backface-visibility:hidden] soft-shadow" style={{ transform: 'rotateY(180deg)' }}>
       <button 
        onClick={(e) => playAudio(e, word.word)}
        className="absolute top-6 right-6 p-4 rounded-full bg-primary/5 hover:bg-primary/20 text-primary transition-colors"
      >
        <Volume2 className="w-6 h-6" />
      </button>
      
      {word.partOfSpeech && (
        <span className="px-4 py-1.5 bg-secondary text-secondary-foreground text-sm font-bold rounded-xl mb-4 border border-border/50">
          {word.partOfSpeech}
        </span>
      )}
      
      <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tight text-foreground text-center">
        {word.word}
      </h2>
      
      {word.ipa && (
        <p className="text-xl md:text-2xl text-muted-foreground font-medium font-mono bg-secondary/30 px-4 py-1 rounded-lg mb-6">
          {word.ipa}
        </p>
      )}

      {word.example && (
        <div className="bg-secondary/50 p-6 rounded-2xl max-w-xl w-full text-center border border-border">
          <p className="text-lg md:text-xl font-medium text-foreground italic">
            "{word.example}"
          </p>
        </div>
      )}
    </div>
  ) : (
    vietnameseSide
  );

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-4">
      {/* Controls Header */}
      <div className="w-full flex justify-between items-center mb-8 px-4">
        <button 
          onClick={() => setReverseMode(!reverseMode)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${reverseMode ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
        >
          <Repeat className="w-4 h-4" />
          {reverseMode ? 'Đảo mặt: Nghĩa ➔ Từ' : 'Mặc định: Từ ➔ Nghĩa'}
        </button>

        <button 
          onClick={() => setAutoPlay(!autoPlay)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${autoPlay ? 'text-primary bg-primary/10 border border-primary/20' : 'text-muted-foreground bg-secondary hover:bg-secondary/80'}`}
        >
          <Volume2 className={`w-4 h-4 ${!autoPlay && 'opacity-50'}`} />
          {autoPlay ? 'Tự động đọc: Bật' : 'Tự động đọc: Tắt'}
        </button>
      </div>

      {/* Flashcard Area */}
      <div 
        className="relative w-full aspect-[4/3] md:aspect-[16/9] [perspective:1200px] cursor-pointer mb-10 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div 
          className="w-full h-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
        >
          {frontContent}
          {backContent}
        </motion.div>
        
        {/* Glow effect on hover */}
        <div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
      </div>

      {/* Action Buttons */}
      <div className="min-h-[120px] w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div 
              key="flip-hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-muted-foreground font-medium animate-bounce"
            >
              Nhấn <kbd className="px-3 py-1.5 bg-secondary border border-border/50 rounded-lg text-sm mx-1 shadow-sm font-mono text-foreground">Space</kbd> hoặc Click để lật thẻ
            </motion.div>
          ) : (
            <motion.div 
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAction(false); }}
                  className="group flex flex-1 max-w-[240px] items-center gap-4 p-4 bg-red-50 hover:bg-red-100 border-2 border-red-100 hover:border-red-200 text-red-700 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-red-200/50 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <X className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xl">Quên / Sai</span>
                    <span className="text-xs opacity-70 font-medium">Phím mũi tên Trái ◄</span>
                  </div>
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAction(true); }}
                  className="group flex flex-1 max-w-[240px] items-center gap-4 p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-100 hover:border-emerald-200 text-emerald-700 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-200/50 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xl">Nhớ / Đúng</span>
                    <span className="text-xs opacity-70 font-medium">Phím mũi tên Phải ►</span>
                  </div>
                </button>
              </div>
              
              {onMaster && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onMaster(); }}
                  className="flex items-center gap-2 px-6 py-3 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-sm border border-pink-100"
                >
                  <Crown className="w-5 h-5" />
                  Đánh dấu đã thuộc (Bỏ qua vĩnh viễn)
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FlashcardStudy;
