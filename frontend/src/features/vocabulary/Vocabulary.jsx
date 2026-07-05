import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { Button, Panel } from '../../components/ui/Primitives';

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
      alert('Trình duyệt của bạn chưa hỗ trợ phát âm.');
    }
  };

  return (
    <div className="se-shell max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="se-page-title">Học từ vựng</h1>
        <Button>
          <Upload className="w-4 h-4" /> Thêm file CSV
        </Button>
      </div>

      <div className="flex flex-col items-center mt-12">
        <div 
          className="w-full max-w-xl h-80 cursor-pointer [perspective:1000px]"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full relative [transform-style:preserve-3d]"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Front */}
            <Panel className="absolute flex h-full w-full flex-col items-center justify-center text-center [backface-visibility:hidden]">
              <h2 className="mb-6 font-secondary text-5xl font-black text-foreground">{card.word}</h2>
              <button 
                onClick={playAudio}
                type="button"
                className="se-icon-sticker h-16 w-16"
                title="Nghe phát âm"
              >
                <Volume2 className="w-8 h-8" />
              </button>
              <p className="mt-8 text-sm font-bold text-muted-foreground animate-pulse">Bấm để xem nghĩa</p>
            </Panel>
            
            {/* Back */}
            <div
              className="absolute flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-primary bg-primary p-8 text-center text-primary-foreground [backface-visibility:hidden]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <h2 className="mb-2 text-3xl font-black">{card.meaning}</h2>
              <p className="mb-6 font-mono text-lg font-bold opacity-90">{card.ipa}</p>
              <p className="text-xl font-bold italic leading-relaxed">"{card.example}"</p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col w-full max-w-xl gap-6 mt-10">
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleNext}
              className="se-button se-button-danger se-button-md flex-1"
              type="button"
            >
              Chưa nhớ
            </button>
            <button 
              onClick={handleNext}
              className="se-button se-button-soft se-button-md flex-1"
              type="button"
            >
              Nhớ rồi
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <button 
              onClick={handlePrev}
              className="se-button se-button-secondary se-button-sm"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" /> Từ trước
            </button>
            <span className="font-medium text-muted-foreground">
              {currentIndex + 1} / {flashcards.length}
            </span>
            <button 
              onClick={handleNext}
              className="se-button se-button-secondary se-button-sm"
              type="button"
            >
              Từ tiếp <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vocabulary;
