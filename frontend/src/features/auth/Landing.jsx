import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { BookOpenCheck, CheckCircle2, GraduationCap, Layers3, LineChart, Sparkles } from 'lucide-react';

import { auth, googleProvider } from '../../config/firebase';
import { useAuth } from '../../contexts/authState';
import { API_BASE_URL } from '../../utils/api';
import { Badge, Button, IconSticker, Panel } from '../../components/ui/Primitives';

const features = [
  { icon: Layers3, title: 'Học từ bằng flashcard', text: 'Lật thẻ, nghe phát âm và ghi nhớ nghĩa nhanh hơn mỗi ngày.' },
  { icon: LineChart, title: 'Theo dõi tiến độ', text: 'Xem số từ đã học, chuỗi học và mục tiêu tuần trong một nơi.' },
  { icon: GraduationCap, title: 'Ôn tập thông minh', text: 'Hệ thống nhắc lại đúng lúc để bạn nhớ lâu hơn mà không bị quá tải.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleFirebaseLogin = async (result) => {
    try {
      const idToken = await result.user.getIdToken(true);

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleFirebaseLogin(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    try {
      setError('');
      const result = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      await handleFirebaseLogin(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen bg-background font-sans">
      <header className="se-shell flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <IconSticker icon={BookOpenCheck} className="border-primary bg-storybook-green" />
          <span className="text-lg font-black text-foreground">SelfEnglish</span>
        </div>
        <Badge tone="blue">Tiếng Việt</Badge>
      </header>

      <section className="se-shell grid min-h-[calc(100vh-84px)] gap-10 px-4 pb-12 pt-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="space-y-8">
          <div className="max-w-2xl">
            <div className="se-eyebrow mb-4">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Học tiếng Anh mỗi ngày
            </div>
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
              className="se-heading-display"
            >
              SelfEnglish
            </motion.h1>
            <p className="se-body mt-5 max-w-xl">
              Tự học từ vựng, luyện phát âm và ôn tập theo lịch thông minh. Mỗi ngày một chút, level up tiếng Anh cực gọn.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureItem key={feature.title} {...feature} />
            ))}
          </div>

          <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
            <MiniStat label="Từ mới hôm nay" value="12" />
            <MiniStat label="Chuỗi học" value="7" tone="green" />
            <MiniStat label="Cần ôn" value="24" tone="blue" />
          </div>
        </div>

        <Panel className="p-6 md:p-8">
          <div className="mb-8 text-center">
            <Badge tone="green" className="mb-4">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Học ngay
            </Badge>
            <h2 className="text-3xl font-black text-foreground">
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h2>
            <p className="se-body mt-2 text-sm">
              {isLogin ? 'Vào học tiếp thôi, đừng để mất mood.' : 'Tạo tài khoản để lưu tiến độ học của bạn.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border-2 border-[#ffc9c9] bg-[#fff2f2] p-3 text-center text-sm font-bold text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div>
              <label htmlFor="email" className="se-label mb-2">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="se-input"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="password" className="se-label">Mật khẩu</label>
                {isLogin && (
                  <button type="button" className="min-h-11 px-1 text-sm font-extrabold text-accent hover:underline">
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="se-input"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-0.5 flex-1 bg-border" />
            <span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">hoặc</span>
            <div className="h-0.5 flex-1 bg-border" />
          </div>

          <Button onClick={signInWithGoogle} variant="secondary" size="lg" className="w-full">
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
            </svg>
            Đăng nhập với Google
          </Button>

          <p className="mt-8 text-center text-sm font-bold text-muted-foreground">
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button onClick={() => setIsLogin((value) => !value)} type="button" className="min-h-11 px-1 font-black text-accent hover:underline">
              {isLogin ? 'Tạo ngay' : 'Đăng nhập'}
            </button>
          </p>
        </Panel>
      </section>
    </main>
  );
}

const FeatureItem = ({ icon: Icon, title, text }) => (
  <div className="se-card min-h-[150px]">
    <IconSticker icon={Icon} />
    <h3 className="mt-4 text-lg font-black text-foreground">{title}</h3>
    <p className="mt-2 text-sm font-bold leading-relaxed text-muted-foreground">{text}</p>
  </div>
);

const MiniStat = ({ label, value, tone = 'default' }) => {
  const toneClass = {
    default: 'border-border bg-card',
    green: 'border-primary bg-storybook-green',
    blue: 'border-accent bg-card text-accent',
  }[tone];

  return (
    <div className={`rounded-xl border-2 p-4 ${toneClass}`}>
      <div className="se-label text-[12px]">{label}</div>
      <div className="se-stat-value mt-4 text-[42px]">{value}</div>
    </div>
  );
};
