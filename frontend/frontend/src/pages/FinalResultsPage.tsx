import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import type { FinalResultsResponse } from '../types/training';

interface Props {
  finalResults: FinalResultsResponse;
  onRestart: () => void;
}

export function FinalResultsPage({ finalResults, onRestart }: Props) {
  const chartData = finalResults.formatAverages
    .filter(r => r.percent > 0)
    .sort((a, b) => b.percent - a.percent)
    .map(r => ({
      name: r.formatCode,
      fullName: r.formatName,
      percent: r.percent,
      color: r.color,
    }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Тренировка завершена!</h1>
        <p className="text-gray-400 text-center mb-8">
          Пройдено {finalResults.completedScenarios} из {finalResults.totalScenarios} сценариев
        </p>

        {/* Диаграмма */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 flex justify-center">
          <BarChart width={700} height={400} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis domain={[0, 100]} stroke="#999" tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              formatter={(v: any) => [`${v}%`, 'Эффективность']}
            />
            <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </div>

        {/* Таблица */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Средний % попадания по форматам</h2>
          <div className="space-y-3">
            {finalResults.formatAverages
              .sort((a, b) => b.percent - a.percent)
              .map(r => (
                <div key={r.formatCode} className="flex items-center gap-4">
                  <span className="w-12 text-sm text-gray-400">{r.formatCode}</span>
                  <span className="w-44 text-sm">{r.formatName}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-4">
                    <div
                      className="h-4 rounded-full"
                      style={{ width: `${r.percent}%`, backgroundColor: r.color }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold">{r.percent}%</span>
                </div>
              ))}
          </div>
        </div>

        {/* Кнопка */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="bg-orange-500 hover:bg-orange-600 px-10 py-4 rounded-xl font-semibold text-lg transition"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  );
}