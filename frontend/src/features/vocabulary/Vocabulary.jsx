import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronRight, ChevronLeft, Upload } from 'lucide-react';

const flashcards = [
  { id: 1, word: 'Diligent', ipa: '/ˈdɪlɪdʒənt/', meaning: 'Siêng năng, cần cù', example: 'He is a diligent student.' },
  { id: 2, word: 'Resilient', ipa: '/rɪˈzɪliənt/', meaning: 'Kiên cường, mau phục hồi', example: 'She is very resilient to stress.' },
  { id: 3, word: 'Obsolete', ipa: '/ˈɒbsəliːt/', meaning: 'Lỗi thời, cổ xưa', example: 'Typewriters are completely obsolete now.' },
];

const Vocabulary = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const playAudio = (e) => {
    e.stopPropagation();
    // Sử dụng Web Speech API để đọc từ vựng
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(card.word);
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    } else {
      alert("Trình duyệt không hỗ trợ phát âm thanh");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Học từ vựng (Flashcards)</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          type="button"
        >
          <Upload className="w-4 h-4" /> Import CSV
        </button>
      </div>

      <div className="flex flex-col items-center mt-12">
        <div 
          className="w-full max-w-xl h-80 perspective-1000 cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full relative preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Front */}
            <div className="absolute w-full h-full backface-hidden bg-card border rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-5xl font-bold mb-6 text-foreground">{card.word}</h2>
              <button 
                onClick={playAudio}
                type="button"
                className="p-4 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-foreground"
                title="Nghe phát âm"
              >
                <Volume2 className="w-8 h-8" />
              </button>
              <p className="mt-8 text-sm text-muted-foreground animate-pulse">Click để xem nghĩa</p>
            </div>
            
            {/* Back */}
            <div 
              className="absolute w-full h-full backface-hidden bg-primary text-primary-foreground border rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 text-center"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <h2 className="text-3xl font-bold mb-2">{card.meaning}</h2>
              <p className="text-lg opacity-80 mb-6 font-mono">{card.ipa}</p>
              <p className="italic text-xl leading-relaxed">"{card.example}"</p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col w-full max-w-xl gap-6 mt-10">
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-semibold transition-colors"
              type="button"
            >
              Quên
            </button>
            <button 
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold transition-colors"
              type="button"
            >
              Nhớ
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <button 
              onClick={handlePrev}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-secondary transition-colors text-foreground font-medium"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" /> Lùi
            </button>
            <span className="font-medium text-muted-foreground">
              {currentIndex + 1} / {flashcards.length}
            </span>
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-secondary transition-colors text-foreground font-medium"
              type="button"
            >
              Tiến <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vocabulary;
