import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ScenariosList } from './pages/admin/ScenariosList';
import { ScenarioEditor } from './pages/admin/ScenarioEditor';
import { StatsPage } from './pages/admin/StatsPage';
import { StartPage } from './pages/StartPage';
import { TrainingPage } from './pages/TrainingPage';
import { ResultsPage } from './pages/ResultsPage';
import { useTrainingSession } from './hooks/useTrainingSession';

function UserApp() {
  const t = useTrainingSession();
  
  if (t.error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{t.error}</p>
          <button onClick={() => t.start()} className="bg-orange-500 px-6 py-3 rounded-xl">Попробовать снова</button>
        </div>
      </div>
    );
  }
  
  if (t.results && t.scenario) {
    return (
      <ResultsPage
        scenario={t.scenario}
        results={t.results}
        bestMatch={t.bestMatch}
        selectedPhrases={t.selectedPhrases}
        onRestart={() => t.start()}
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
        loading={t.loading}
      />
    );
  }
  
  return <StartPage onStart={() => t.start()} loading={t.loading} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ScenariosList />} />
          <Route path="scenarios" element={<ScenariosList />} />
          <Route path="scenarios/:id" element={<ScenarioEditor />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>
        <Route path="*" element={<UserApp />} />
      </Routes>
    </BrowserRouter>
  );
}