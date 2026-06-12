import { Link, Outlet, useLocation } from 'react-router-dom';

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-orange-400">Админ-панель</h1>
            <nav className="flex gap-2">
              <Link to="/admin/scenarios" className={`px-4 py-2 rounded-lg text-sm font-medium transition ${location.pathname.includes('/scenarios') ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>Сценарии</Link>
              <Link to="/admin/stats" className={`px-4 py-2 rounded-lg text-sm font-medium transition ${location.pathname === '/admin/stats' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>Статистика</Link>
            </nav>
          </div>
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition">← На сайт</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}