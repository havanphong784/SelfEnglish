import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Crown, Gauge, Lightbulb, Repeat, Volume2, X, Zap } from 'lucide-react';

const ratings = [
  {
    value: 'again',
    label: 'Again',
    hint: '1 / Left',
    icon: X,
    classes: 'border-red-100 bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100',
    iconClasses: 'bg-red-200/50 group-hover:bg-red-200',
  },
  {
    value: 'hard',
    label: 'Hard',
    hint: '2',
    icon: Gauge,
    classes: 'border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-200 hover:bg-amber-100',
    iconClasses: 'bg-amber-200/50 group-hover:bg-amber-200',
  },
  {
    value: 'good',
    label: 'Good',
    hint: '3 / Right',
    icon: Check,
    classes: 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100',
    iconClasses: 'bg-emerald-200/50 group-hover:bg-emerald-200',
  },
  {
    value: 'easy',
    label: 'Easy',
    hint: '4',
    icon: Zap,
    classes: 'border-sky-100 bg-sky-50 text-sky-700 hover:border-sky-200 hover:bg-sky-100',
    iconClasses: 'bg-sky-200/50 group-hover:bg-sky-200',
  },
];

const FlashcardStudy = ({ word, onNext, onMaster }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [reverseMode, setReverseMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const playAudio = useCallback((event, textToPlay) => {
    event?.stopPropagation();
    const text = textToPlay || word?.word;
    if (!text || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }, [word]);

  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
    if (autoPlay && !reverseMode) {
      playAudio(null, word?.word);
    }
  }, [word, autoPlay, reverseMode, playAudio]);

  useEffect(() => {
    if (isFlipped && autoPlay && reverseMode) {
      playAudio(null, word?.word);
    }
  }, [isFlipped, autoPlay, reverseMode, word, playAudio]);

  const handleAction = useCallback((rating) => {
    onNext({ rating });
  }, [onNext]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      if (event.code === 'Space') {
        event.preventDefault();
        setIsFlipped((prev) => !prev);
        return;
      }

      if (!isFlipped) return;

      if (event.code === 'ArrowLeft' || event.code === 'Digit1') handleAction('again');
      if (event.code === 'Digit2') handleAction('hard');
      if (event.code === 'ArrowRight' || event.code === 'Digit3') handleAction('good');
      if (event.code === 'Digit4') handleAction('easy');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleAction]);

  if (!word) return null;

  const audioButton = (dark = false) => (
    <button
      onClick={(event) => playAudio(event, word.word)}
      className={`absolute right-6 top-6 rounded-full p-3 transition-all hover:scale-110 active:scale-95 md:right-8 md:top-8 md:p-4 ${
        dark ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-primary/10 text-primary hover:bg-primary/20'
      }`}
      title="Play audio"
    >
      <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
    </button>
  );

  const englishCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-[2.5rem] border border-primary/10 bg-gradient-to-br from-white to-primary/5 p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] [backface-visibility:hidden] md:p-12"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      <div className="absolute right-0 top-0 -z-10 h-40 w-40 rounded-bl-[100px] bg-primary/5" />
      {audioButton()}

      {word.partOfSpeech && (
        <span className="mb-6 rounded-full bg-gradient-to-r from-primary to-indigo-500 px-4 py-1.5 text-xs font-bold tracking-wider text-white shadow-md shadow-primary/20 md:text-sm">
          {word.partOfSpeech.toUpperCase()}
        </span>
      )}

      <h2 className="mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-center text-4xl font-black tracking-tight text-transparent md:text-7xl">
        {word.word}
      </h2>

      {word.ipa && (
        <p className="rounded-2xl border border-border/50 bg-white/50 px-5 py-2 font-mono text-lg font-medium text-muted-foreground shadow-sm md:text-2xl">
          {word.ipa}
        </p>
      )}

      {word.example && back && (
        <div className="mt-8 w-full max-w-xl rounded-3xl border border-primary/10 bg-primary/5 p-6 text-center shadow-sm md:p-8">
          <p className="text-lg font-medium italic leading-relaxed text-foreground md:text-2xl">"{word.example}"</p>
        </div>
      )}

      {word.synonyms && !back && (
        <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-primary/10 bg-white/60 p-4 text-center shadow-sm backdrop-blur-sm">
          <p className="text-sm font-medium text-foreground/80 md:text-base">
            <span className="mr-2 font-bold text-primary">Synonyms:</span>{word.synonyms}
          </p>
        </div>
      )}
    </div>
  );

  const meaningCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-[#4318FF] to-[#8854D0] p-8 shadow-[0_20px_50px_-12px_rgba(67,24,255,0.4)] [backface-visibility:hidden] md:p-12"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      <div className="pointer-events-none absolute -top-[20%] left-[-10%] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      {!back && reverseMode ? null : audioButton(true)}

      <h3 className="mb-8 text-center text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-md md:text-5xl">
        {word.meaning}
      </h3>

      {word.example && !reverseMode && (
        <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-md md:p-8">
          <p className="text-lg font-medium italic leading-relaxed text-white drop-shadow-sm md:text-2xl">"{word.example}"</p>
        </div>
      )}

      {reverseMode && !showHint && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            setShowHint(true);
          }}
          className="mt-6 flex items-center gap-3 rounded-2xl border border-white/30 bg-white/20 px-8 py-4 font-bold text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-white/30 active:scale-95"
        >
          <Lightbulb className="h-6 w-6 text-yellow-300 drop-shadow-sm" />
          Hint
        </button>
      )}

      {reverseMode && showHint && (
        <div className="mt-4 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-inner backdrop-blur-md">
          <p className="font-mono text-3xl font-bold tracking-[0.4em] text-white drop-shadow-md md:text-4xl">
            {word.word[0].toUpperCase()}{Array(word.word.length - 1).fill('_').join(' ')}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center py-4">
      <div className="mb-8 flex w-full items-center justify-between px-4">
        <button
          onClick={() => setReverseMode((prev) => !prev)}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            reverseMode ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <Repeat className="h-4 w-4" />
          {reverseMode ? 'Meaning to word' : 'Word to meaning'}
        </button>

        <button
          onClick={() => setAutoPlay((prev) => !prev)}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            autoPlay ? 'border border-primary/20 bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
          }`}
        >
          <Volume2 className={`h-4 w-4 ${!autoPlay ? 'opacity-50' : ''}`} />
          Auto audio: {autoPlay ? 'On' : 'Off'}
        </button>
      </div>

      <div
        className="group relative mb-10 aspect-[4/3] w-full cursor-pointer [perspective:1200px] md:aspect-[16/9]"
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <motion.div
          className="h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        >
          {reverseMode ? meaningCard(false) : englishCard(false)}
          {reverseMode ? englishCard(true) : meaningCard(true)}
        </motion.div>
        <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary/5 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="flex min-h-[120px] w-full flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="flip-hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-medium text-muted-foreground"
            >
              Press <kbd className="mx-1 rounded-lg border border-border/50 bg-secondary px-3 py-1.5 font-mono text-sm text-foreground shadow-sm">Space</kbd> or click to flip
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col items-center gap-6"
            >
              <div className="grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {ratings.map((rating) => {
                  const Icon = rating.icon;
                  return (
                    <button
                      key={rating.value}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAction(rating.value);
                      }}
                      className={`group flex min-h-[96px] items-center gap-3 rounded-2xl border-2 p-3 font-bold shadow-sm transition-all hover:scale-105 active:scale-95 ${rating.classes}`}
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${rating.iconClasses}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex min-w-0 flex-col items-start">
                        <span className="text-base md:text-lg">{rating.label}</span>
                        <span className="text-xs font-medium opacity-70">{rating.hint}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {onMaster && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onMaster();
                  }}
                  className="flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-6 py-3 font-bold text-pink-600 shadow-sm transition-all hover:scale-105 hover:bg-pink-100 active:scale-95"
                >
                  <Crown className="h-5 w-5" />
                  Mark as mastered
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
