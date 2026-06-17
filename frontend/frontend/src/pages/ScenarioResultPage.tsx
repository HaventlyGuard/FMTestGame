import type { Scenario, EffectivenessResult, SelectedPhraseInfo } from '../types/training';

interface Props {
  scenario: Scenario;
  results: EffectivenessResult[];
  bestMatch: EffectivenessResult | null;
  selectedPhrases: SelectedPhraseInfo[];
  hasMoreScenarios: boolean;
  onReplay: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export function ScenarioResultPage({
  scenario, results, bestMatch, selectedPhrases,
  hasMoreScenarios, onReplay, onNext, onFinish,
}: Props) {
  const nativeResult = results.find(r => r.isNative);
  const otherResults = results.filter(r => !r.isNative).sort((a, b) => b.percent - a.percent);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Результат сценария</h1>
        <p className="text-gray-400 text-center mb-6">{scenario.title}</p>

        {/* Родной формат */}
        {nativeResult && (
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center mb-6">
            <p className="text-gray-400 mb-2">
              Сообщение для <span className="text-white font-semibold">{scenario.recipientName}</span> ({scenario.recipientFormatName})
            </p>
            <p className="text-5xl font-bold" style={{ color: nativeResult.color }}>
              {nativeResult.percent}%
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {nativeResult.percent >= 80 ? '✅ Отлично! Сообщение точно дойдёт.' :
               nativeResult.percent >= 50 ? '⚠️ Неплохо, но можно лучше.' :
               '❌ Сообщение вряд ли заинтересует.'}
            </p>
          </div>
        )}

        {/* Другие форматы */}
        {otherResults.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
            <h3 className="text-sm text-gray-400 mb-4">Для других форматов подошло бы на:</h3>
            <div className="space-y-2">
              {otherResults.map(r => (
                <div key={r.formatCode} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-gray-500">{r.formatCode}</span>
                  <span className="w-36 text-sm text-gray-300 truncate">{r.formatName}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div className="h-3 rounded-full" style={{ width: `${r.percent}%`, backgroundColor: r.color }} />
                  </div>
                  <span className="w-10 text-right text-sm font-bold">{r.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Выбранные фразы */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <h3 className="text-sm text-gray-400 mb-3">Ваше сообщение</h3>
          {selectedPhrases.map(p => (
            <div key={p.partCode} className="mb-2">
              <span className="text-xs text-gray-500">{p.partName}: </span>
              <span className="text-sm text-gray-300">{p.text}</span>
              <span className="text-xs ml-2 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: p.formatColor + '30', color: p.formatColor }}>
                {p.formatCode}
              </span>
            </div>
          ))}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={onReplay} className="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded-xl font-semibold transition">
            Переиграть
          </button>
          {hasMoreScenarios && (
            <button onClick={onNext} className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-semibold transition">
              Дальше
            </button>
          )}
          <button onClick={onFinish} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-6 py-3 rounded-xl font-semibold transition">
            Закончить попытку
          </button>
        </div>
      </div>
    </div>
  );
}