import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onStart: () => void;
}

export function IntroModal({ isOpen, onStart }: Props) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Как это работает?',
      text: 'Вы получаете сценарий — ситуацию общения с конкретным человеком. У каждого человека свой формат мышления: Презентатор, Аналитик, Системщик и другие.',
    },
    {
      title: 'Что нужно делать?',
      text: 'Из трёх частей (вступление, основная часть, завершение) вы составляете сообщение. Для каждой части даны 10 вариантов — по одному на каждый формат мышления.',
    },
    {
      title: 'Как оценивается результат?',
      text: 'Система анализирует ваше сообщение и показывает, насколько % оно подходит каждому формату. Результат 80%+ означает, что сообщение точно зацепит человека этого формата и он будет к вам расположен.',
    },
    {
      title: 'Что вы получите?',
      text: 'После тренировки вы увидите свой общий % попадания в нужные форматы. Это покажет, насколько хорошо вы умеете подбирать слова под разных людей.',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setStep(0); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass rounded-3xl p-8 w-full max-w-lg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] relative"
          >
            {/* Кнопка Пропустить */}
            <button
              onClick={onStart}
              className="absolute top-4 right-4 text-sm text-slate-400 hover:text-slate-600 transition"
            >
              Пропустить
            </button>

            {/* Прогресс точек */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? 'w-8 bg-slate-800' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Контент */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center mb-8"
            >
              <h3 className="text-xl font-medium text-slate-800 mb-4">
                {steps[step].title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {steps[step].text}
              </p>
            </motion.div>

            {/* Кнопки навигации */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                className={`text-sm text-slate-400 hover:text-slate-600 transition ${step === 0 ? 'invisible' : ''}`}
              >
                ← Назад
              </button>

              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition"
                >
                  Далее
                </button>
              ) : (
                <button
                  onClick={onStart}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition shadow-[0_10px_30px_-5px_rgba(59,130,246,0.3)]"
                >
                  Начать тренировку
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}