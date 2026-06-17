import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ScenariosList } from './pages/admin/ScenariosList';
import { ScenarioEditor } from './pages/admin/ScenarioEditor';
import { StatsPage } from './pages/admin/StatsPage';
import { StartPage } from './pages/StartPage';
import { TrainingPage } from './pages/TrainingPage';
import { AuthPage } from './pages/AuthPage';
import { useTrainingSession } from './hooks/useTrainingSession';
import { UsersPage } from './pages/admin/UsersPage';
import { FormatsPage } from './pages/admin/FormatsPage';
import { FinalResultsPage } from './pages/FinalResultsPage';
import { SessionsPage } from './pages/admin/SessionsPage';
import { ScenarioResultPage } from './pages/ScenarioResultPage';

function UserApp() {
  const t = useTrainingSession();

  if (t.error) {
    return (
      <div className="min-h-screen relative bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{t.error}</p>
          <button onClick={() => t.start()} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-medium">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (t.finalResults) {
    return <FinalResultsPage finalResults={t.finalResults} onRestart={() => t.start()} />;
  }

  if (t.scenarioResult && t.scenario && t.selectedPhrases) {
    return (
      <ScenarioResultPage
        scenario={t.scenario}
        results={t.scenarioResult.results}
        bestMatch={t.scenarioResult.bestMatch}
        selectedPhrases={t.selectedPhrases}
        hasMoreScenarios={!!t.pendingScenario}
        onReplay={() => t.replayScenario()}
        onNext={() => t.nextScenario()}
        onFinish={() => t.finishEarly()}
      />
    );
  }

  if (t.scenario && t.currentPart) {
    return (
      <TrainingPage
        scenario={t.scenario}
        currentPart={t.currentPart}
        options={t.options}
        selectedPhrases={t.selectedPhrases}
        onSelect={t.select}
        onSwitchPart={t.switchPart}
        loading={t.loading}
      />
    );
  }

  return <StartPage onStart={() => t.start()} loading={t.loading} />;
}

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen relative bg-white">
      <header className="glass sticky top-0 z-50 mx-4 mt-4 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="text-xl font-light text-slate-800">
            <span className="gradient-text font-normal">Тренажёр</span>
          </button>
          <nav className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link to="/admin/scenarios" className="text-slate-500 hover:text-slate-800 text-sm transition">Админка</Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm">{user.name}</span>
                <button onClick={logout} className="text-slate-400 hover:text-slate-700 text-sm transition">Выйти</button>
              </div>
            ) : (
              <Link to="/auth" className="text-slate-500 hover:text-slate-800 text-sm transition">Войти</Link>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        {user?.role === 'admin' && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<ScenariosList />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="scenarios" element={<ScenariosList />} />
            <Route path="scenarios/:id" element={<ScenarioEditor />} />
            <Route path="formats" element={<FormatsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="stats" element={<StatsPage />} />
          </Route>
        )}
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