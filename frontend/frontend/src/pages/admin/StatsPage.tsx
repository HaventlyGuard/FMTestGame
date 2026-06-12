import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import type { AdminStats } from '../../types/admin';

export function StatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => { adminApi.getStats().then(setStats); }, []);

  if (!stats) return <div className="text-center py-12 text-gray-400">Загрузка...</div>;

  const items = [
    { label: 'Активных сценариев', value: stats.activeScenarios },
    { label: 'Всего сессий', value: stats.totalSessions },
    { label: 'Завершённых сессий', value: stats.completedSessions },
    { label: 'Заполненных фраз', value: `${stats.filledPhrases}/${stats.totalPhrases}` },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Статистика</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="text-3xl font-bold text-orange-400 mb-1">{item.value}</div>
            <div className="text-sm text-gray-400">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}