import { motion, useReducedMotion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../config/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { API_BASE_URL } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

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
      
      // Gửi token lên backend để xác thực và lấy thông tin User
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Dang nhap that bai');
      }

      if (data.user) {
        // Lưu token hoặc thông tin user vào localStorage/Context
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

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
      }
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
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col md:flex-row font-sans">
      {/* Animated Background Blobs */}
      <motion.div 
        animate={shouldReduceMotion ? false : { 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[150px] pointer-events-none" 
      />
      <motion.div 
        animate={shouldReduceMotion ? false : { 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/30 blur-[150px] pointer-events-none" 
      />

      {/* Left side: Hero & Features */}
      <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center items-start space-y-6 md:space-y-8 relative z-10 mt-10 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-xs md:text-sm mb-2 md:mb-4 shadow-sm"
        >
          🚀 Nền tảng học tiếng Anh thế hệ mới
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold bg-gradient-to-br from-primary via-accent to-purple-500 bg-clip-text text-transparent font-secondary leading-tight"
        >
          SelfEnglish
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-xl text-muted-foreground max-w-md leading-relaxed"
        >
          Trải nghiệm phương pháp tự học tiếng Anh thông minh với <strong className="text-primary">Flashcard 3D</strong>, luyện nghe phát âm chuẩn và hệ thống thống kê trực quan.
        </motion.p>

        <div className="space-y-3 md:space-y-4 w-full max-w-md mt-6 md:mt-8">
          <FeatureItem text="✨ Học từ vựng sinh động với Flashcard 3D" delay={0.4} />
          <FeatureItem text="📈 Phân tích tiến độ qua Activity Chart trực quan" delay={0.5} />
          <FeatureItem text="🎧 Luyện nghe & phát âm chuẩn với Web Speech API" delay={0.6} />
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="md:w-1/2 p-6 md:p-12 flex items-center justify-center relative z-10 mb-10 md:mb-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-md glass-panel p-6 md:p-10 rounded-3xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-foreground font-secondary">
              {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLogin ? 'Chào mừng bạn quay trở lại với SelfEnglish' : 'Bắt đầu hành trình chinh phục tiếng Anh'}
            </p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5 ml-1">Email</label>
              <input 
                id="email"
                type="email" 
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all placeholder:text-muted-foreground/50"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">Mật khẩu</label>
                {isLogin && <a href="#" className="text-xs text-primary hover:underline">Quên mật khẩu?</a>}
              </div>
              <input 
                id="password"
                type="password" 
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all placeholder:text-muted-foreground/50"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>
          </form>

          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-muted-foreground text-xs uppercase tracking-wider font-medium">Hoặc tiếp tục với</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <button 
            onClick={signInWithGoogle}
            type="button"
            className="w-full mt-8 bg-card/50 hover:bg-card border border-white/10 text-foreground font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-3 group"
          >
            <svg aria-hidden="true" className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
            </svg>
            <span>Google</span>
          </button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              type="button"
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? 'Tạo ngay' : 'Đăng nhập'}
            </button>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function FeatureItem({ text, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center space-x-4 glass-panel p-4 rounded-2xl hover:-translate-y-1 hover:shadow-primary/10 transition-all cursor-default"
    >
      <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary to-accent"></div>
      <span className="text-foreground font-medium">{text}</span>
    </motion.div>
  );
}
