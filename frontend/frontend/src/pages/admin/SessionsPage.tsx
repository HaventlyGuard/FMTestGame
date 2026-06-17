import { useState, useEffect } from 'react';
import { adminApi, type AdminSession } from '../../api/adminApi';

export function SessionsPage() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSessions().then(data => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Загрузка...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Сессии ({sessions.length})</h2>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 text-left">
              <th className="px-4 py-3 text-sm text-gray-400 font-medium">Пользователь</th>
              <th className="px-4 py-3 text-sm text-gray-400 font-medium">Статус</th>
              <th className="px-4 py-3 text-sm text-gray-400 font-medium">Прогресс</th>
              <th className="px-4 py-3 text-sm text-gray-400 font-medium">Средний %</th>
              <th className="px-4 py-3 text-sm text-gray-400 font-medium">Начало</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-b border-gray-700/50 hover:bg-gray-750 transition">
                <td className="px-4 py-3">
                  <div className="text-white font-medium">{s.userName}</div>
                  <div className="text-xs text-gray-500">{s.userEmail}</div>
                </td>
                <td className="px-4 py-3">
                  {s.status === 'completed' ? (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Завершена</span>
                  ) : (
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">В процессе</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {s.completedScenarios}/{s.totalScenarios}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-bold ${s.avgPercent >= 70 ? 'text-green-400' : s.avgPercent >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {s.avgPercent}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">
                  {new Date(s.startedAt).toLocaleString('ru')}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">Нет сессий</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

