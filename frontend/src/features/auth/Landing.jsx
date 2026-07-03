import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../config/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { BookOpen, ChevronRight, Layers, LineChart, Volume2 } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import heroImage from '../../assets/hero.png';

const featureItems = [
  { icon: BookOpen, title: 'Flashcard có ngữ cảnh', copy: 'Từ, IPA, ví dụ và nghĩa nằm trong một nhịp học rõ ràng.' },
  { icon: LineChart, title: 'Lịch ôn theo trí nhớ', copy: 'Spaced repetition giữ các từ cần ôn ở đúng thời điểm.' },
  { icon: Volume2, title: 'Nghe phát âm ngay', copy: 'Web Speech API giúp kiểm tra âm thanh trong phiên học.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleFirebaseLogin = async (result) => {
    try {
      const idToken = await result.user.getIdToken();

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
        navigate('/dashboard');
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
    setError('');

    try {
      const result = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      await handleFirebaseLogin(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="grid min-h-[100dvh] bg-background text-foreground lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative overflow-hidden border-b border-border/80 px-6 py-8 learning-lines sm:px-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-12">
        <div className="flex min-h-full max-w-3xl flex-col justify-between gap-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
              SE
            </div>
            <div>
              <p className="text-sm font-bold leading-5">SelfEnglish</p>
              <p className="text-xs font-medium text-muted-foreground">Personal English studio</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-2xl"
          >
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Vocabulary rhythm
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Học tiếng Anh theo nhịp của trí nhớ
              <span className="mx-3 inline-flex translate-y-2 align-middle">
                <img
                  src={heroImage}
                  alt=""
                  className="h-12 w-12 object-contain opacity-80 [filter:hue-rotate(104deg)_saturate(.45)_brightness(.86)] sm:h-16 sm:w-16"
                />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
              Một nơi gọn để nhập gói từ, luyện bằng flashcard, nghe phát âm và quay lại đúng những từ sắp quên.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3">
            {featureItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index + 0.18, duration: 0.42 }}
                className="rounded-xl border border-border/80 bg-card/72 p-4"
              >
                <item.icon className="mb-4 h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-md rounded-xl surface-panel p-6 sm:p-8"
        >
          <div className="mb-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {isLogin ? 'Vào buổi học' : 'Tạo không gian học'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isLogin ? 'Đăng nhập để tiếp tục phiên học đang mở.' : 'Tạo tài khoản và bắt đầu bằng gói từ đầu tiên.'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`min-h-10 rounded-md text-sm font-bold ${isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`min-h-10 rounded-md text-sm font-bold ${!isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Đăng ký
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-12 w-full rounded-lg surface-inset px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/25"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-foreground">Mật khẩu</label>
                {isLogin && (
                  <button type="button" className="text-xs font-bold text-primary hover:text-foreground">
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-12 w-full rounded-lg surface-inset px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/25"
                placeholder="Nhập mật khẩu"
              />
            </div>
            <button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground pressable hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {isLogin ? 'Tiếp tục học' : 'Tạo tài khoản'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Hoặc</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={signInWithGoogle}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground pressable hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
            </svg>
            Tiếp tục với Google
          </button>
        </motion.div>
      </section>
    </div>
  );
}
