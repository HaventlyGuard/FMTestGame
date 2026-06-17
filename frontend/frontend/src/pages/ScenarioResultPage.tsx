import { motion } from 'framer-motion';
import type { Scenario, EffectivenessResult, SelectedPhraseInfo } from '../types/training';
import { AnimatedBackground } from '../components/AnimatedBackground';

interface Props {
  scenario: Scenario; results: EffectivenessResult[]; bestMatch: EffectivenessResult | null;
  selectedPhrases: SelectedPhraseInfo[]; hasMoreScenarios: boolean;
  onReplay: () => void; onNext: () => void; onFinish: () => void;
}

export function ScenarioResultPage({ scenario, results, selectedPhrases, hasMoreScenarios, onReplay, onNext, onFinish }: Props) {
  const nativeResult = results.find(r => r.isNative);
  const otherResults = results.filter(r => !r.isNative).sort((a, b) => b.percent - a.percent);

  return (
    <div className="min-h-screen relative bg-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-extralight text-slate-800 text-center mb-2">Результат сценария</h1>
        <p className="text-slate-400 text-center mb-8">{scenario.title}</p>

        {nativeResult && (
          <div className="glass p-8 text-center mb-6">
            <p className="text-slate-400 mb-2">Сообщение для <span className="font-medium text-slate-700">{scenario.recipientName}</span> ({scenario.recipientFormatName})</p>
            <p className="text-6xl font-extralight gradient-text">{nativeResult.percent}%</p>
            <p className="text-slate-400 text-sm mt-2">{nativeResult.percent >= 80 ? '✅ Отлично! Ваше сообщение смогло заинтересовать этого человека' : nativeResult.percent >= 50 ? '⚠️ Неплохо, человек вас услышал, но есть небольшое недовольство' : '❌ Человеку неприятно читать это сообщение, подумайте как бы вы могли префразировать, чтобы это изменить'}</p>
          </div>
        )}

        {otherResults.length > 0 && (
          <div className="glass p-6 mb-6">
            <h3 className="text-sm text-slate-400 mb-4">Для других форматов подошло бы на:</h3>
            {otherResults.map(r => (
              <div key={r.formatCode} className="flex items-center gap-3 mb-2">
                <span className="w-10 text-sm text-slate-400">{r.formatCode}</span>
                <span className="w-36 text-sm text-slate-500 truncate">{r.formatName}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${r.percent}%`, backgroundColor: r.color }} /></div>
                <span className="w-10 text-right text-sm font-medium">{r.percent}%</span>
              </div>
            ))}
          </div>
        )}

        <div className="glass p-6 mb-8">
          <h3 className="text-sm text-slate-400 mb-3">Ваше сообщение</h3>
          {selectedPhrases.map(p => (
            <div key={p.partCode} className="mb-2 text-sm"><span className="text-slate-400">{p.partName}: </span><span className="text-slate-600">{p.text}</span></div>
          ))}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onReplay} className="glass rounded-2xl px-6 py-3 text-slate-600 font-medium hover:bg-white/80 transition">Переиграть</motion.button>
          {hasMoreScenarios && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext} className="bg-slate-900 text-white rounded-2xl px-6 py-3 font-medium hover:bg-slate-800 transition">Дальше</motion.button>
          )}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onFinish} className="glass rounded-2xl px-6 py-3 text-red-400 font-medium hover:bg-red-50 transition">Закончить</motion.button>
        </div>
      </div>
    </div>
  );
}