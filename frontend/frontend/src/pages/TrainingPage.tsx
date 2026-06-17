import { motion } from 'framer-motion';
import type { Scenario, Part, PhraseOption, SelectedPhraseInfo } from '../types/training';
import { AnimatedBackground } from '../components/AnimatedBackground';

interface Props {
  scenario: Scenario; currentPart: Part; options: PhraseOption[];
  selectedPhrases: SelectedPhraseInfo[]; onSelect: (id: number) => void;
  onSwitchPart: (partCode: string) => void; loading: boolean;
}

const STEPS = [{ code: 'opening', name: 'Вступление' }, { code: 'middle', name: 'Основная часть' }, { code: 'closing', name: 'Завершение' }];

export function TrainingPage({ scenario, currentPart, options, selectedPhrases, onSelect, onSwitchPart, loading }: Props) {
  return (
    <div className="min-h-screen relative bg-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="glass rounded-2xl p-4 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            {STEPS.map((step, i) => {
              const done = selectedPhrases.some(p => p.partCode === step.code);
              const active = currentPart.code === step.code;
              return (
                <div key={step.code} className="flex items-center gap-2 flex-1">
                  <button onClick={() => onSwitchPart(step.code)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition shadow-[0_2px_8px_rgba(0,0,0,0.1)] ${done ? 'bg-green-400 text-white' : active ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    {done ? '✓' : i + 1}
                  </button>
                  <button onClick={() => onSwitchPart(step.code)} className={`text-sm font-medium ${active ? 'text-slate-800' : done ? 'text-green-500' : 'text-slate-400'}`}>
                    {step.name}
                  </button>
                  {i < 2 && <div className="flex-1 h-0.5 bg-slate-100 mx-2" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-slate-400">Адресат:</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">{scenario.recipientName}</span>
                <span className="px-3 py-1 bg-blue-50 rounded-full text-sm font-medium text-blue-500">{scenario.recipientFormatName}</span>
              </div>
              <h2 className="text-2xl font-extralight text-slate-800 mb-3">{scenario.title}</h2>
              <p className="text-slate-500 leading-relaxed">{scenario.situationText}</p>
              {scenario.hintText && (
                <div className="mt-4 bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                  <span className="text-blue-500 text-sm font-medium">Подсказка: </span>
                  <span className="text-slate-500 text-sm">{scenario.hintText}</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-extralight text-slate-800 mb-4">
                Выберите вариант для: <span className="text-blue-500 font-medium">{currentPart.name}</span>
              </h3>
              <div className="space-y-3">
                {options.map((o, i) => {
                  const isSelected = selectedPhrases.some(p => p.partCode === currentPart.code && p.text === o.text);
                  return (
                    <motion.button
                      key={o.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => onSelect(o.id)}
                      disabled={loading}
                      className={`w-full text-left rounded-2xl p-5 transition disabled:opacity-50 border ${
                        isSelected
                          ? 'bg-blue-50/60 border-blue-300 shadow-[0_4px_16px_rgba(59,130,246,0.12)]'
                          : 'bg-white/80 border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_4px_rgba(0,0,0,0.2)]" style={{ backgroundColor: o.formatColor }} />
                        <div>
                          <span className="text-xs text-slate-400 font-medium">{o.formatName}</span>
                          <p className="text-slate-700 mt-1 leading-relaxed">{o.text}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-extralight text-slate-800 mb-4">Ваше сообщение</h3>
            <div className="space-y-3">
              {STEPS.map(step => {
                const phrase = selectedPhrases.find(p => p.partCode === step.code);
                return (
                  <button key={step.code} onClick={() => onSwitchPart(step.code)}
                    className={`w-full text-left rounded-2xl p-4 border transition ${
                      currentPart.code === step.code
                        ? 'border-blue-300 bg-white/90 shadow-[0_4px_16px_rgba(59,130,246,0.1)]'
                        : phrase
                        ? 'border-green-200 bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                        : 'border-slate-200 bg-white/60 shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
                    }`}>
                    <div className="text-xs text-slate-400 mb-1">{step.name}</div>
                    {phrase ? (
                      <>
                        <p className="text-sm text-slate-700 mb-2 leading-relaxed">{phrase.text}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: phrase.formatColor + '20', color: phrase.formatColor }}>
                          {phrase.formatCode}
                        </span>
                      </>
                    ) : (
                      <p className="text-sm text-slate-300 italic">Нажмите, чтобы выбрать</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}