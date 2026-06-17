import { motion } from 'framer-motion';
import type { FinalResultsResponse } from '../types/training';
import { AnimatedBackground } from '../components/AnimatedBackground';

interface Props { finalResults: FinalResultsResponse; onRestart: () => void; }

export function FinalResultsPage({ finalResults, onRestart }: Props) {
  return (
    <div className="min-h-screen relative bg-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extralight text-slate-800 text-center mb-2">Тренировка завершена</h1>
        <p className="text-slate-400 text-center mb-8">Пройдено {finalResults.completedScenarios} из {finalResults.totalScenarios} сценариев</p>

        <div className="glass p-8 text-center mb-8">
          <p className="text-slate-400 mb-2">Ваш общий результат</p>
          <p className="text-7xl font-extralight gradient-text">{finalResults.overallAverage}%</p>
          <p className="text-slate-400 text-sm mt-2">Средний % попадания в нужные форматы</p>
        </div>

        <div className="glass p-6 mb-8">
          <h3 className="text-sm text-slate-400 mb-4">По форматам</h3>
          {finalResults.formatAverages.sort((a, b) => b.percent - a.percent).map(r => (
            <div key={r.formatCode} className="flex items-center gap-3 mb-2">
              <span className="w-10 text-sm text-slate-400">{r.formatCode}</span>
              <span className="w-36 text-sm text-slate-500 truncate">{r.formatName}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${r.percent}%`, backgroundColor: r.color }} /></div>
              <span className="w-10 text-right text-sm font-medium">{r.percent}%</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onRestart}
            className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-medium text-lg transition">Попробовать снова</motion.button>
        </div>
      </div>
    </div>
  );
}