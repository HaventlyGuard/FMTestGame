import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import type { Scenario, EffectivenessResult, SelectedPhraseInfo } from '../types/training';

interface Props {
  scenario: Scenario;
  results: EffectivenessResult[];
  bestMatch: EffectivenessResult | null;
  selectedPhrases: SelectedPhraseInfo[];
  onRestart: () => void;
}

export function ResultsPage({ scenario, results, bestMatch, selectedPhrases, onRestart }: Props) {
  const chartData = results
    .filter(r => r.percent > 0)
    .sort((a, b) => b.percent - a.percent)
    .map(r => ({
      name: r.formatCode,
      fullName: r.formatName,
      percent: r.percent,
      color: r.color,
      isNative: r.isNative,
    }));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-2">Результат оценки</h1>
        <p className="text-gray-400 text-center mb-8">Эффективность вашего сообщения для разных форматов</p>

        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 flex justify-center">
          <BarChart width={700} height={400} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis domain={[0, 100]} stroke="#999" tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              formatter={(value: number) => [`${value}%`, 'Эффективность']}
            />
            <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={entry.isNative ? 1 : 0.5} />
              ))}
            </Bar>
          </BarChart>
        </div>

        {bestMatch && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 text-center">
            <p className="text-gray-400 mb-1">Лучше всего подходит для:</p>
            <p className="text-3xl font-bold" style={{ color: bestMatch.color }}>{bestMatch.formatName} — {bestMatch.percent}%</p>
            {bestMatch.isNative && <p className="text-green-400 mt-2">✅ Родной формат адресата ({scenario.recipientName})</p>}
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Все форматы</h2>
          <div className="space-y-3">
            {results.sort((a, b) => b.percent - a.percent).map(r => (
              <div key={r.formatCode} className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-400">{r.formatCode}</span>
                <span className="w-44 text-sm">{r.formatName}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-4">
                  <div className="h-4 rounded-full" style={{ width: `${r.percent}%`, backgroundColor: r.color, opacity: r.isNative ? 1 : 0.5 }} />
                </div>
                <span className="w-12 text-right font-bold">{r.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button onClick={onRestart} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition">
            Попробовать ещё раз
          </button>
        </div>
      </div>
    </div>
  );
}