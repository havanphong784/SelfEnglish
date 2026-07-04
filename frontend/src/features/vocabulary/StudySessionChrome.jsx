import { AlertTriangle, ArrowLeft, BookOpen, RotateCcw, Target, Trophy } from 'lucide-react';

export const StudyLoading = () => (
  <div className="text-center py-12">Đang chuẩn bị bài học...</div>
);

export const StudyLoadError = ({ error, onRetry, onBack }) => (
  <div className="max-w-xl mx-auto mt-20 text-center space-y-6">
    <h2 className="text-2xl font-bold">Không tải được bài học</h2>
    <p className="text-muted-foreground">{error}</p>
    <div className="flex justify-center gap-3">
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl"
        type="button"
      >
        <RotateCcw className="h-4 w-4" />
        Thử lại
      </button>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-6 py-2 bg-muted text-muted-foreground rounded-xl"
        type="button"
      >
        <BookOpen className="h-4 w-4" />
        Thư viện
      </button>
    </div>
  </div>
);

export const EmptyStudyState = ({ onBack }) => (
  <div className="max-w-xl mx-auto mt-20 text-center space-y-6">
    <h2 className="text-2xl font-bold">Không có từ vựng nào!</h2>
    <p className="text-muted-foreground">Có thể bạn đã học hết gói này, hoặc hôm nay không có từ nào cần ôn.</p>
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl"
      type="button"
    >
      <BookOpen className="h-4 w-4" />
      Thư viện
    </button>
  </div>
);

const SummaryTile = ({ label, value, detail, tone = 'default' }) => {
  const toneClass = {
    default: 'bg-card text-foreground',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    muted: 'bg-slate-50 text-slate-700 border-slate-200',
  }[tone];

  return (
    <div className={`rounded-2xl border border-border p-5 ${toneClass}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">{label}</div>
      <div className="mt-3 font-mono text-4xl font-black tabular-nums">{value}</div>
      {detail && <div className="mt-1 text-xs font-semibold opacity-70">{detail}</div>}
    </div>
  );
};

export const FinishedStudy = ({ error, summary, retryCount, onRetryMissed, onBack }) => (
  <div className="mx-auto mt-10 max-w-4xl space-y-6">
    <div className="rounded-[2rem] border border-border bg-white p-8 text-center soft-shadow">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <Trophy className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-foreground">Phiên học đã ghi sổ</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground">
        {retryCount > 0
          ? 'Có một nhóm từ chưa chắc. Ôn lại ngay sẽ hiệu quả hơn để ngày mai nhẹ hơn.'
          : 'Ổn rồi. Không còn từ nào bị đánh dấu cần ôn lại trong phiên này.'}
      </p>
      {error && (
        <p className="mx-auto mt-5 max-w-xl rounded-xl bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-700">
          {error}
        </p>
      )}
    </div>

    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <SummaryTile label="Đã xử lý" value={summary.answered} detail={`${summary.score}% chắc`} />
      <SummaryTile label="Nhớ chắc" value={summary.remembered + summary.mastered} tone="success" />
      <SummaryTile label="Cần ôn" value={summary.needsReview} tone="warning" />
      <SummaryTile label="Bỏ qua" value={summary.skipped} tone="muted" />
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      {retryCount > 0 && (
        <button
          onClick={onRetryMissed}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          type="button"
        >
          <RotateCcw className="h-5 w-5" />
          Ôn lại {retryCount} từ chưa chắc
        </button>
      )}
      <button
        onClick={onBack}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 font-bold text-foreground transition-colors hover:bg-muted"
        type="button"
      >
        <BookOpen className="h-5 w-5" />
        Về thư viện
      </button>
    </div>
  </div>
);

export const StudyHeader = ({ currentIndex, totalWords, modeLabel, summary, onBack }) => {
  const progressPercent = (currentIndex / totalWords) * 100;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
            type="button"
            aria-label="Quay lại thư viện"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{modeLabel}</div>
            <h1 className="truncate text-2xl font-black tracking-tight text-foreground">Luyện từ vựng</h1>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-2 text-right">
          <div className="font-mono text-lg font-black tabular-nums text-foreground">{currentIndex + 1}/{totalWords}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Thẻ</div>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card px-3 py-2">
          <div className="font-mono text-xl font-black tabular-nums text-foreground">{summary.remembered + summary.mastered}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Nhớ</div>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-amber-700">
          <div className="font-mono text-xl font-black tabular-nums">{summary.needsReview}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">Ôn</div>
        </div>
        <div className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-slate-700">
          <div className="font-mono text-xl font-black tabular-nums">{summary.skipped}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">Bỏ</div>
        </div>
      </div>
    </div>
  );
};

export const LevelPanel = ({ level }) => (
  <div className="rounded-[1.5rem] border border-border bg-card p-5">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Cấp độ</div>
        <div className="mt-1 font-mono text-3xl font-black tabular-nums text-foreground">{level}</div>
      </div>
      <Target className="h-8 w-8 text-primary" />
    </div>
    <div className="mt-5 grid grid-cols-6 gap-1.5">
      {[1, 2, 3, 4, 5, 6].map((lvl) => (
        <div
          key={lvl}
          className={`h-2 rounded-full ${lvl <= level ? 'bg-primary' : 'bg-muted'}`}
          title={`Level ${lvl}`}
        />
      ))}
    </div>
  </div>
);

export const SessionLedger = ({ summary, totalWords }) => (
  <div className="rounded-[1.5rem] border border-border bg-card p-5">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Phiên học</div>
        <div className="mt-1 font-mono text-3xl font-black tabular-nums text-foreground">{summary.answered}</div>
      </div>
      <BookOpen className="h-8 w-8 text-muted-foreground" />
    </div>
    <div className="mt-4 space-y-3 text-sm font-semibold">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Đã trả lời</span>
        <span className="font-mono tabular-nums">{summary.answered}/{totalWords}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Độ chắc</span>
        <span className="font-mono tabular-nums">{summary.score}%</span>
      </div>
      <div className="flex items-center justify-between text-amber-700">
        <span>Cần ôn</span>
        <span className="font-mono tabular-nums">{summary.needsReview}</span>
      </div>
    </div>
  </div>
);

export const InlineError = ({ error }) => (
  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4 text-sm font-medium text-yellow-700">
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
    <span>{error}</span>
  </div>
);
