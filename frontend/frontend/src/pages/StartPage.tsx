import { motion } from 'framer-motion';
import { AnimatedBackground } from '../components/AnimatedBackground';

interface Props { onStart: () => void; loading: boolean; }

export function StartPage({ onStart, loading }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-white overflow-hidden">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl px-6">
        <div className="mb-4 inline-block px-4 py-1.5 glass rounded-full text-blue-500 text-sm font-medium shadow-[0_2px_10px_rgba(59,130,246,0.1)]">
          Коммуникационный тренажёр
        </div>
        <h1 className="text-5xl md:text-7xl font-extralight tracking-tight mb-6 text-slate-800">
          Говори на языке <span className="gradient-text font-normal">собеседника</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg mx-auto">
          Научитесь составлять сообщения, которые точно попадают в цель.
        </p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onStart} disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-lg px-10 py-4 rounded-2xl font-medium transition shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2)]">
          {loading ? 'Загрузка...' : 'Начать тренировку'}
        </motion.button>
      </motion.div>
    </div>
  );
}