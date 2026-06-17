import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Редирект если уже авторизован — через useEffect, а не в рендере
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    const err = isLogin
      ? await login(email, password)
      : await register(email, password, name);

    if (err) {
      setError(typeof err === 'string' ? err : 'Ошибка. Проверьте данные.');
    } else {
      navigate('/', { replace: true });
    }
  };

  // Не показываем форму пока проверяется токен
  if (user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Вход' : 'Регистрация'}</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!isLogin && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Имя</label>
            <input value={name} onChange={e => setName(e.target.value)} required minLength={2}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none" />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-1">Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none" />
        </div>

        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 py-2 rounded-lg font-semibold transition">
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>

        <p className="text-center mt-4 text-sm text-gray-400">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-orange-400 hover:underline">
            {isLogin ? 'Регистрация' : 'Войти'}
          </button>
        </p>
      </form>
    </div>
  );
}