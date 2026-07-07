import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Crown, Lightbulb, Repeat, Volume2, X } from 'lucide-react';
import { Badge, Button, Kbd } from '../../components/ui/Primitives';

const ratings = [
  {
    value: false,
    label: 'Quên',
    effect: 'Ôn lại sau',
    shortcuts: ['1', '←'],
    icon: X,
    classes: 'border-[#ffc9c9] bg-[#fff2f2] text-danger hover:border-danger',
  },
  {
    value: true,
    label: 'Nhớ',
    effect: 'Level up',
    shortcuts: ['2', '→'],
    icon: Check,
    classes: 'border-primary bg-storybook-green text-foreground hover:bg-fresh-leaf',
  },
];

const ShortcutKey = ({ children, dark = false }) => (
  <Kbd className={dark ? 'border-white bg-white text-night-ink' : ''}>{children}</Kbd>
);

const FlashcardStudy = ({ word, onNext, onMaster, disabled = false }) => {
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

  const handleAction = useCallback((payload) => {
    if (disabled) return;
    onNext(payload);
  }, [disabled, onNext]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      if (event.code === 'Space') {
        event.preventDefault();
        setIsFlipped((prev) => !prev);
        return;
      }

      if (!isFlipped) return;

      if (event.code === 'ArrowLeft' || event.code === 'Digit1') {
        event.preventDefault();
        handleAction(false);
      }
      if (event.code === 'ArrowRight' || event.code === 'Digit2') {
        event.preventDefault();
        handleAction(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleAction]);

  if (!word) return null;

  const audioButton = () => (
    <button
      onClick={(event) => playAudio(event, word.word)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-primary bg-storybook-green text-primary transition-transform hover:scale-105 active:scale-95"
      title="Nghe phát âm"
      type="button"
    >
      <Volume2 className="h-5 w-5" />
    </button>
  );

  const englishCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col rounded-xl border-2 border-border bg-card [backface-visibility:hidden]"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      <div className="flex w-full items-start justify-between p-4 md:p-6 pb-0 md:pb-0">
        <div>
          {word.partOfSpeech && (
            <Badge tone="muted" className="border-border shadow-sm">
              {word.partOfSpeech}
            </Badge>
          )}
        </div>
        {audioButton()}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h2 className="font-secondary text-5xl font-black tracking-tight text-foreground md:text-7xl">
          {word.word}
        </h2>
        {word.ipa && (
          <p className="mt-3 font-mono text-lg font-medium text-muted-foreground md:text-xl">
            {word.ipa}
          </p>
        )}
        
        {word.example && back && (
          <div className="mt-6 w-full max-w-sm rounded-xl bg-storybook-green/30 p-4">
            <p className="text-base font-bold italic leading-relaxed text-foreground md:text-lg">"{word.example}"</p>
          </div>
        )}
      </div>

      {Array.isArray(word.synonyms) && word.synonyms.length > 0 && !back ? (
        <div className="border-t-2 border-border/50 bg-muted/30 p-4 text-center rounded-b-xl">
          <p className="text-sm font-medium text-foreground/80">
            <span className="mr-2 font-bold text-primary">Từ gần nghĩa:</span>
            {word.synonyms.join(', ')}
          </p>
        </div>
      ) : (
        <div className="h-4 md:h-6" /> // spacer to keep center balanced
      )}
    </div>
  );

  const meaningCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col rounded-xl border-2 border-border bg-card shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] [backface-visibility:hidden]"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      <div className="flex w-full items-start justify-end p-4 md:p-6 pb-0 md:pb-0">
        {!back && reverseMode ? <div className="h-10" /> : audioButton()}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h3 className="text-3xl font-black leading-tight tracking-tight text-primary md:text-5xl">
          {word.meaning}
        </h3>

        {word.example && !reverseMode && (
          <div className="mt-6 w-full max-w-sm rounded-xl border-2 border-border border-l-primary border-l-4 bg-muted/40 p-4 text-left shadow-sm">
            <p className="text-base font-bold italic leading-relaxed text-foreground md:text-lg text-center">
              "{word.example}"
            </p>
          </div>
        )}

        {reverseMode && !showHint && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              setShowHint(true);
            }}
            className="mt-6 flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-muted px-6 py-2.5 font-bold text-foreground transition-transform hover:scale-105 active:scale-95 shadow-sm"
            type="button"
          >
            <Lightbulb className="h-5 w-5 text-accent" />
            Gợi ý nhẹ
          </button>
        )}

        {reverseMode && showHint && (
          <div className="mt-6 rounded-xl border-2 border-border bg-muted/40 p-4 shadow-sm">
            <p className="font-mono text-2xl font-bold tracking-[0.35em] text-foreground md:text-3xl">
              {word.word[0].toUpperCase()}{Array(Math.max(word.word.length - 1, 0)).fill('_').join(' ')}
            </p>
          </div>
        )}
      </div>
      
      <div className="h-4 md:h-6" />
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center py-2">
      <div className="mb-3 flex w-full items-center justify-between gap-3 px-1 sm:px-2">
        <Button
          onClick={() => setReverseMode((prev) => !prev)}
          variant={reverseMode ? 'primary' : 'secondary'}
          size="sm"
        >
          <Repeat className="h-4 w-4" />
          {reverseMode ? 'Nghĩa -> từ' : 'Từ -> nghĩa'}
        </Button>

        <Button
          onClick={() => setAutoPlay((prev) => !prev)}
          variant={autoPlay ? 'soft' : 'secondary'}
          size="sm"
        >
          <Volume2 className={`h-4 w-4 ${!autoPlay ? 'opacity-50' : ''}`} />
          Tự phát âm: {autoPlay ? 'Bật' : 'Tắt'}
        </Button>
      </div>

      <div
        className="group relative mb-4 h-[min(42vh,360px)] min-h-[280px] w-full cursor-pointer [perspective:1200px]"
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <motion.div
          className="h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 220, damping: 22 }}
        >
          {reverseMode ? meaningCard(false) : englishCard(false)}
          {reverseMode ? englishCard(true) : meaningCard(true)}
        </motion.div>
      </div>

      <div className="flex min-h-[88px] w-full flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.button
              key="flip-action"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => setIsFlipped(true)}
              className="se-button se-button-secondary se-button-md"
              type="button"
            >
              <Repeat className="h-4 w-4" />
              Lật thẻ
              <ShortcutKey>Space</ShortcutKey>
            </motion.button>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col items-center gap-4"
            >
              <div className="grid w-full max-w-xl grid-cols-2 gap-3">
                {ratings.map((rating) => {
                  const Icon = rating.icon;
                  return (
                    <button
                      key={String(rating.value)}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAction(rating.value);
                      }}
                      disabled={disabled}
                      className={`group flex min-h-[72px] items-center gap-3 rounded-xl border-2 p-3 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 ${rating.classes}`}
                      type="button"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-current bg-white/60">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex min-w-0 flex-col items-start">
                        <span className="text-base">{rating.label}</span>
                        <span className="text-xs font-medium opacity-70">{rating.effect}</span>
                      </div>
                      <div className="ml-auto flex shrink-0 items-center gap-1">
                        {rating.shortcuts.map((shortcut) => (
                          <ShortcutKey key={shortcut}>{shortcut}</ShortcutKey>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAction({ action: 'prev' });
                  }}
                  disabled={disabled}
                  className="se-button se-button-secondary se-button-sm disabled:cursor-wait disabled:opacity-60"
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Lùi
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAction({ action: 'next' });
                  }}
                  disabled={disabled}
                  className="se-button se-button-secondary se-button-sm disabled:cursor-wait disabled:opacity-60"
                  type="button"
                >
                  Bỏ qua
                  <ChevronRight className="h-4 w-4" />
                </button>

                {onMaster && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onMaster();
                    }}
                    disabled={disabled}
                    className="se-button se-button-soft se-button-sm disabled:cursor-wait disabled:opacity-60"
                    type="button"
                  >
                    <Crown className="h-4 w-4" />
                    Mình nhớ rồi
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FlashcardStudy;
