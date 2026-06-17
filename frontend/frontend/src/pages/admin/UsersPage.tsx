import { useState, useEffect } from 'react';
import { adminApi, type UserAdmin } from '../../api/adminApi';

export function UsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(debouncedSearch || undefined);
      setUsers(data);
    } catch { alert('Ошибка загрузки пользователей'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [debouncedSearch]);

  const handleRoleChange = async (userId: string, newRole: string, userName: string) => {
    const roleLabel = newRole === 'admin' ? 'Админ' : 'Пользователь';
    if (!confirm(`Сменить роль "${userName}" на "${roleLabel}"?`)) return;
    await adminApi.updateUserRole(userId, newRole);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Удалить пользователя "${userName}"?`)) return;
    await adminApi.deleteUser(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <div>
      <h2 className="text-2xl font-extralight text-slate-800 mb-4">Пользователи ({users.length})</h2>
      <div className="mb-4">
        <input type="text" placeholder="Поиск по email или имени..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-white/50 backdrop-blur rounded-xl px-4 py-3 text-slate-800 border border-white/80 focus:border-blue-300 outline-none text-sm" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Загрузка...</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 text-sm text-slate-400 font-medium">Пользователь</th>
                <th className="px-4 py-3 text-sm text-slate-400 font-medium">Email</th>
                <th className="px-4 py-3 text-sm text-slate-400 font-medium">Роль</th>
                <th className="px-4 py-3 text-sm text-slate-400 font-medium">Сессии</th>
                <th className="px-4 py-3 text-sm text-slate-400 font-medium">Дата</th>
                <th className="px-4 py-3 text-sm text-slate-400 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-white/40 transition">
                  <td className="px-4 py-3"><span className="text-slate-800 font-medium">{u.name}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin'
                      ? <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">Админ</span>
                      : <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">Пользователь</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{u.completedSessions}/{u.totalSessions}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{new Date(u.createdAt).toLocaleDateString('ru')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {u.role === 'user'
                        ? <button onClick={() => handleRoleChange(u.id, 'admin', u.name)} className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded-lg text-xs font-medium transition">Сделать админом</button>
                        : <button onClick={() => handleRoleChange(u.id, 'user', u.name)} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1 rounded-lg text-xs font-medium transition">Разжаловать</button>}
                      <button onClick={() => handleDelete(u.id, u.name)} className="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-medium transition">Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">{debouncedSearch ? 'Ничего не найдено' : 'Нет пользователей'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}