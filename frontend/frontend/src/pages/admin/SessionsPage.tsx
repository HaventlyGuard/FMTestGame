// src/pages/admin/SessionsPage.tsx
import { useState, useEffect } from 'react';
import { adminApi, type AdminSession } from '../../api/adminApi';

export function SessionsPage() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.getSessions().then(data => { setSessions(data); setLoading(false); }); }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Загрузка...</div>;

  return (
    <div>
      <h2 className="text-2xl font-extralight text-slate-800 mb-6">Сессии ({sessions.length})</h2>
      <div className="glass overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="px-4 py-3 text-sm text-slate-400 font-medium">Пользователь</th>
              <th className="px-4 py-3 text-sm text-slate-400 font-medium">Статус</th>
              <th className="px-4 py-3 text-sm text-slate-400 font-medium">Прогресс</th>
              <th className="px-4 py-3 text-sm text-slate-400 font-medium">Средний %</th>
              <th className="px-4 py-3 text-sm text-slate-400 font-medium">Начало</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-white/40 transition">
                <td className="px-4 py-3">
                  <div className="text-slate-800 font-medium">{s.userName}</div>
                  <div className="text-xs text-slate-400">{s.userEmail}</div>
                </td>
                <td className="px-4 py-3">
                  {s.status === 'completed'
                    ? <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">Завершена</span>
                    : <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-0.5 rounded-full">В процессе</span>}
                </td>
                <td className="px-4 py-3 text-slate-500 text-sm">{s.completedScenarios}/{s.totalScenarios}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-bold ${s.avgPercent >= 70 ? 'text-green-500' : s.avgPercent >= 40 ? 'text-yellow-500' : 'text-red-400'}`}>{s.avgPercent}%</span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-sm">{new Date(s.startedAt).toLocaleString('ru')}</td>
              </tr>
            ))}
            {sessions.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-400">Нет сессий</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}