import type { Scenario, Part, PhraseOption, SelectedPhraseInfo } from '../types/training';

interface Props {
  scenario: Scenario;
  currentPart: Part;
  options: PhraseOption[];
  selectedPhrases: SelectedPhraseInfo[];
  onSelect: (id: number) => void;
  loading: boolean;
}

export function TrainingPage({ scenario, currentPart, options, selectedPhrases, onSelect, loading }: Props) {
  const steps = [
    { code: 'opening', name: 'Вступление' },
    { code: 'middle', name: 'Основная часть' },
    { code: 'closing', name: 'Завершение' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {steps.map((step, i) => {
            const done = selectedPhrases.some(p => p.partCode === step.code);
            const active = currentPart.code === step.code;
            return (
              <div key={step.code} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  done ? 'bg-green-500' : active ? 'bg-orange-500' : 'bg-gray-600'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={active ? 'text-white font-semibold' : 'text-gray-400'}>{step.name}</span>
                {i < 2 && <div className="flex-1 h-px bg-gray-600 mx-2" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-400">Адресат:</span>
              <span className="px-3 py-1 bg-gray-700 rounded-full text-sm font-semibold">{scenario.recipientName}</span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/10">{scenario.recipientFormatName}</span>
            </div>
            <h2 className="text-2xl font-bold mb-3">{scenario.title}</h2>
            <p className="text-gray-300">{scenario.situationText}</p>
            {scenario.hintText && (
              <div className="mt-4 bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <span className="text-orange-400 text-sm font-semibold">Подсказка: </span>
                <span className="text-gray-300 text-sm">{scenario.hintText}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Выберите вариант для: <span className="text-orange-400">{currentPart.name}</span>
            </h3>
            <div className="grid gap-3">
              {options.map(o => (
                <button
                  key={o.id}
                  onClick={() => onSelect(o.id)}
                  disabled={loading}
                  className="text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-orange-500 rounded-xl p-4 transition disabled:opacity-50 w-full"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: o.formatColor }} />
                    <div>
                      <span className="text-xs text-gray-500">{o.formatName}</span>
                      <p className="text-white mt-1">{o.text}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Ваше сообщение</h3>
          <div className="space-y-3">
            {steps.map(step => {
              const phrase = selectedPhrases.find(p => p.partCode === step.code);
              return (
                <div key={step.code} className={`rounded-xl p-4 border ${phrase ? 'border-green-500/50 bg-gray-800' : 'border-gray-700 bg-gray-800/50'}`}>
                  <div className="text-xs text-gray-500 mb-1">{step.name}</div>
                  {phrase ? (
                    <>
                      <p className="text-sm text-white mb-2">{phrase.text}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: phrase.formatColor + '30', color: phrase.formatColor }}>
                        {phrase.formatCode}
                      </span>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 italic">Ожидает выбора...</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}