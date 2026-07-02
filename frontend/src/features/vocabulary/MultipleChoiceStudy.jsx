import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const MultipleChoiceStudy = ({ word, onNext }) => {
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    loadOptions();
  }, [word]);

  const loadOptions = async () => {
    setSelectedAnswer(null);
    try {
      // Gọi API lấy đáp án nhiễu
      const distractors = await fetchWithAuth(`/vocabularies/random?excludeId=${word.id}&limit=3`);
      
      let others = Array.isArray(distractors) ? distractors : [];
      
      // Fallback nếu database chưa có đủ từ
      while (others.length < 3) {
        others.push({ id: `fake-${Math.random()}`, meaning: `Đáp án sai ${others.length + 1}` });
      }

      const mergedOptions = [word, ...others].sort(() => 0.5 - Math.random());
      setOptions(mergedOptions);
    } catch (error) {
      console.error("Lỗi khi tải distractors:", error);
      const fakeOptions = [word, { id: 1, meaning: 'Nghĩa sai 1' }, { id: 2, meaning: 'Nghĩa sai 2' }, { id: 3, meaning: 'Nghĩa sai 3' }].sort(() => 0.5 - Math.random());
      setOptions(fakeOptions);
    }
  };

  const handleAnswer = (option) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);
    
    const isCorrect = option.id === word.id;
    
    if (isCorrect && 'speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(word.word);
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    }

    setTimeout(() => {
      onNext(isCorrect);
    }, 1500);
  };

  if (options.length === 0) return <div className="text-center py-10">Đang tạo câu hỏi...</div>;

  return (
    <div className="bg-card border-2 border-border rounded-3xl p-10 shadow-sm text-center max-w-2xl mx-auto">
      <h2 className="text-5xl font-black text-primary mb-12 tracking-tight">{word.word}</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {options.map((option, idx) => {
          let btnClass = "p-5 border-2 rounded-2xl text-lg font-medium transition-all text-left flex justify-between items-center group";
          
          if (selectedAnswer !== null) {
            if (option.id === word.id) {
              btnClass += " bg-green-500/10 border-green-500 text-green-700";
            } else if (selectedAnswer.id === option.id) {
              btnClass += " bg-red-500/10 border-red-500 text-red-700";
            } else {
              btnClass += " opacity-50 bg-card border-border";
            }
          } else {
            btnClass += " bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5";
          }

          return (
            <button 
              key={idx} 
              onClick={() => handleAnswer(option)}
              className={btnClass}
              disabled={selectedAnswer !== null}
            >
              <span>{option.meaning}</span>
              {selectedAnswer !== null && option.id === word.id && <CheckCircle className="text-green-600" />}
              {selectedAnswer !== null && selectedAnswer.id === option.id && option.id !== word.id && <XCircle className="text-red-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceStudy;
