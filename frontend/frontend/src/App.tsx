import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ScenariosList } from './pages/admin/ScenariosList';
import { ScenarioEditor } from './pages/admin/ScenarioEditor';
import { StatsPage } from './pages/admin/StatsPage';
import { StartPage } from './pages/StartPage';
import { TrainingPage } from './pages/TrainingPage';
import { ResultsPage } from './pages/ResultsPage';
import { AuthPage } from './pages/AuthPage';
import { useTrainingSession } from './hooks/useTrainingSession';
import { UsersPage } from './pages/admin/UsersPage';
import { FormatsPage } from './pages/admin/FormatsPage';

function UserApp() {
  const t = useTrainingSession();
  if (t.error) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><div className="text-center"><p className="text-red-400 text-xl mb-4">{t.error}</p><button onClick={() => t.start()} className="bg-orange-500 px-6 py-3 rounded-xl">Попробовать снова</button></div></div>;
  if (t.results && t.scenario) return <ResultsPage scenario={t.scenario} results={t.results} bestMatch={t.bestMatch} selectedPhrases={t.selectedPhrases} onRestart={() => t.start()} />;
  if (t.scenario && t.currentPart) return <TrainingPage scenario={t.scenario} currentPart={t.currentPart} options={t.options} selectedPhrases={t.selectedPhrases} onSelect={t.select} loading={t.loading} />;
  return <StartPage onStart={() => t.start()} loading={t.loading} />;
}

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-orange-400 font-bold text-lg">Тренажёр</Link>
          <nav className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link to="/admin/scenarios" className="text-gray-400 hover:text-white text-sm">Админка</Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-300 text-sm">{user.name}</span>
                <button onClick={logout} className="text-gray-400 hover:text-white text-sm">Выйти</button>
              </div>
            ) : (
              <Link to="/auth" className="text-gray-400 hover:text-white text-sm">Войти</Link>
            )}
          </nav>
        </div>
      </header>
      
      <Routes>
  <Route path="/auth" element={<AuthPage />} />
  {user?.role === 'admin' && (
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<ScenariosList />} />
      <Route path="scenarios" element={<ScenariosList />} />
      <Route path="scenarios/:id" element={<ScenarioEditor />} />
      <Route path="formats" element={<FormatsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="stats" element={<StatsPage />} />
    </Route>
  )}
  {/* Редирект для не-админов */}
  {user?.role !== 'admin' && (
    <Route path="/admin/*" element={<Navigate to="/" replace />} />
  )}
  <Route path="*" element={<UserApp />} />
</Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}