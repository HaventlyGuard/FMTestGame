import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground } from '../components/AnimatedBackground';

export function AuthPage() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [name, setName] = useState(''); const [error, setError] = useState('');

  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (password.length < 6) { setError('Пароль не менее 6 символов'); return; }
    const err = isLogin ? await login(email, password) : await register(email, password, name);
    if (err) setError(typeof err === 'string' ? err : 'Ошибка'); else navigate('/', { replace: true });
  };

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-white">
      <AnimatedBackground />
      <form onSubmit={handleSubmit} className="relative z-10 glass p-8 w-full max-w-md">
        <h2 className="text-2xl font-extralight text-slate-800 mb-6">{isLogin ? 'С возвращением' : 'Создать аккаунт'}</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        {!isLogin && (
          <div className="mb-4"><label className="block text-sm text-slate-400 mb-1">Имя</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white/50 rounded-xl px-4 py-3 text-slate-800 border border-white/80 focus:border-blue-300 outline-none transition" /></div>
        )}
        <div className="mb-4"><label className="block text-sm text-slate-400 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/50 rounded-xl px-4 py-3 text-slate-800 border border-white/80 focus:border-blue-300 outline-none transition" /></div>
        <div className="mb-6"><label className="block text-sm text-slate-400 mb-1">Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full bg-white/50 rounded-xl px-4 py-3 text-slate-800 border border-white/80 focus:border-blue-300 outline-none transition" /></div>
        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
        <p className="text-center mt-4 text-sm text-slate-400">{isLogin ? 'Нет аккаунта?' : 'Уже есть?'} <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-blue-500 hover:underline font-medium">{isLogin ? 'Регистрация' : 'Войти'}</button></p>
      </form>
    </div>
  );
}