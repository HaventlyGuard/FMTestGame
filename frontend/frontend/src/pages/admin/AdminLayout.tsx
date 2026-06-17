import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatedBackground } from '../../components/AnimatedBackground';

export function AdminLayout() {
  const location = useLocation();

  const tabs = [
    { path: '/admin/scenarios', label: 'Сценарии' },
    { path: '/admin/formats', label: 'Форматы' },
    { path: '/admin/sessions', label: 'Сессии' },
    { path: '/admin/users', label: 'Пользователи' },
    { path: '/admin/stats', label: 'Статистика' },
  ];

  return (
    <div className="min-h-screen relative bg-white">
      <AnimatedBackground />

      <header className="glass sticky top-0 z-50 mx-4 mt-4 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-light text-slate-800">
              <span className="gradient-text font-normal">Админ-панель</span>
            </h1>
            <nav className="flex gap-2">
              {tabs.map(tab => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    location.pathname.startsWith(tab.path)
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-700 transition">← На сайт</Link>
        </div>
      </header>
      <main className="relative z-10 max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}