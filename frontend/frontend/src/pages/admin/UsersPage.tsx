import { useState, useEffect } from 'react';
import { adminApi, type UserAdmin } from '../../api/adminApi';

export function UsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Дебаунс поиска (ждём 500мс после последнего ввода)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(debouncedSearch || undefined);
      setUsers(data);
    } catch {
      alert('Ошибка загрузки пользователей');
    }
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
    if (!confirm(`Удалить пользователя "${userName}"? Сессии сохранятся анонимно.`)) return;
    await adminApi.deleteUser(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Пользователи ({users.length})</h2>

      {/* Поиск */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по email или имени..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Загрузка...</div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="px-4 py-3 text-sm text-gray-400 font-medium">Пользователь</th>
                <th className="px-4 py-3 text-sm text-gray-400 font-medium">Email</th>
                <th className="px-4 py-3 text-sm text-gray-400 font-medium">Роль</th>
                <th className="px-4 py-3 text-sm text-gray-400 font-medium">Сессии</th>
                <th className="px-4 py-3 text-sm text-gray-400 font-medium">Дата</th>
                <th className="px-4 py-3 text-sm text-gray-400 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-700/50 hover:bg-gray-750 transition">
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{u.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full font-medium">Админ</span>
                    ) : (
                      <span className="bg-gray-600/50 text-gray-300 text-xs px-2 py-0.5 rounded-full">Пользователь</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{u.completedSessions}/{u.totalSessions}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {new Date(u.createdAt).toLocaleDateString('ru')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {u.role === 'user' ? (
                        <button onClick={() => handleRoleChange(u.id, 'admin', u.name)}
                          className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-3 py-1 rounded-lg text-xs font-medium transition">
                          Сделать админом
                        </button>
                      ) : (
                        <button onClick={() => handleRoleChange(u.id, 'user', u.name)}
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1 rounded-lg text-xs font-medium transition">
                          Разжаловать
                        </button>
                      )}
                      <button onClick={() => handleDelete(u.id, u.name)}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1 rounded-lg text-xs font-medium transition">
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    {debouncedSearch ? 'Ничего не найдено' : 'Нет зарегистрированных пользователей'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}