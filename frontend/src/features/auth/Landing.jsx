import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../config/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import axios from 'axios';

export default function Landing() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleFirebaseLogin = async (result) => {
    try {
      const idToken = await result.user.getIdToken();
      
      // Gửi token lên backend để xác thực và lấy thông tin User
      const response = await axios.post('http://localhost:5000/api/auth/verify', { idToken });
      
      if (response.data.user) {
        // Lưu token hoặc thông tin user vào localStorage/Context
        localStorage.setItem('user', JSON.stringify(response.data.user));
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
      {/* Left side: Hero & Features */}
      <div className="md:w-1/2 p-12 flex flex-col justify-center items-start space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent"
        >
          SelfEnglish
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-300"
        >
          Nền tảng tự học tiếng Anh thông minh với Flashcard 3D và thống kê trực quan.
        </motion.p>

        <div className="space-y-4">
          <FeatureItem text="✨ Học từ vựng với Flashcard 3D sống động" delay={0.4} />
          <FeatureItem text="📈 Theo dõi tiến độ qua Activity Chart trực quan" delay={0.5} />
          <FeatureItem text="🎧 Luyện nghe phát âm chuẩn bằng Web Speech API" delay={0.6} />
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="md:w-1/2 bg-slate-900 p-12 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700"
        >
          <h2 className="text-3xl font-semibold mb-6 text-center">
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </h2>
          
          {error && <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Mật khẩu</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>
          </form>

          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-slate-700"></div>
            <span className="px-3 text-slate-500 text-sm">Hoặc</span>
            <div className="flex-1 border-t border-slate-700"></div>
          </div>

          <button 
            onClick={signInWithGoogle}
            className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

          <p className="mt-8 text-center text-sm text-slate-400">
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-blue-400 hover:underline"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureItem({ text, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center space-x-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"
    >
      <span className="text-lg">{text}</span>
    </motion.div>
  );
}
