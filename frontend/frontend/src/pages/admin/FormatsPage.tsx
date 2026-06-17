import { useState, useEffect } from 'react';
import { adminApi, type FormatFull } from '../../api/adminApi';

const defaultFormat = {
  code: '',
  name: '',
  description: '',
  color: '#6366f1',
  idealEmotional: 3,
  idealSafety: 3,
  idealStructural: 3,
  toleranceEmotional: 1,
  toleranceSafety: 1,
  toleranceStructural: 1,
  weightEmotional: 0.33,
  weightSafety: 0.33,
  weightStructural: 0.34,
};

export function FormatsPage() {
  const [formats, setFormats] = useState<FormatFull[]>([]);
  const [editing, setEditing] = useState<FormatFull | null>(null);
  const [creating, setCreating] = useState(false);
  const [newFormat, setNewFormat] = useState({ ...defaultFormat });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    const data = await adminApi.getFormatsFull();
    setFormats(data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await adminApi.updateFormat(editing.id, editing);
    setFormats(prev => prev.map(f => f.id === editing.id ? editing : f));
    setEditing(null);
    setSaving(false);
    setMessage('Формат сохранён');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleCreate = async () => {
    if (!newFormat.code || !newFormat.name) {
      setMessage('Код и название обязательны');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createFormat(newFormat);
      setFormats(prev => [...prev, created]);
      setCreating(false);
      setNewFormat({ ...defaultFormat });
      setMessage('Формат создан');
    } catch (e: any) {
      setMessage(e.response?.data || 'Ошибка создания');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Удалить формат "${name}"? Фразы этого формата будут удалены.`)) return;
    try {
      await adminApi.deleteFormat(id);
      setFormats(prev => prev.filter(f => f.id !== id));
      setMessage('Формат удалён');
    } catch (e: any) {
      setMessage(e.response?.data || 'Ошибка удаления');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const resetScores = async () => {
    const scenarioId = prompt('ID сценария для сброса баллов фраз?');
    if (!scenarioId) return;
    await adminApi.resetPhraseScores(Number(scenarioId));
    setMessage('Баллы фраз сброшены к эталонам форматов');
    setTimeout(() => setMessage(''), 2000);
  };

  const updateNew = (key: string, value: any) => {
    setNewFormat(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Форматы ({formats.length})</h2>
        <div className="flex gap-2">
          <button onClick={resetScores} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition">
            Сбросить баллы фраз
          </button>
          <button onClick={() => setCreating(true)} className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg font-semibold text-sm transition">
            + Новый формат
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${
          message.includes('Ошибка') || message.includes('Нельзя')
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : 'bg-green-500/10 border border-green-500/30 text-green-400'
        }`}>{message}</div>
      )}

      {/* Форма создания */}
      {creating && (
        <div className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">Новый формат</h3>
          <FormatForm
            data={newFormat}
            onChange={updateNew}
            showCode={true}
          />
          <div className="flex gap-3 mt-6">
            <button onClick={handleCreate} disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-5 py-2.5 rounded-lg font-semibold text-sm">
              {saving ? 'Создание...' : 'Создать'}
            </button>
            <button onClick={() => setCreating(false)} className="bg-gray-600 hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Список форматов */}
      <div className="grid gap-3">
        {formats.map(f => (
          <div key={f.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => setEditing({ ...f })}
              className="text-left p-5 hover:bg-gray-750 transition w-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: f.color }} />
                <span className="text-lg font-semibold text-white">{f.name}</span>
                <span className="text-sm text-gray-500">({f.code})</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                <div>Идеалы: Э={f.idealEmotional} Б={f.idealSafety} С={f.idealStructural}</div>
                <div>Толер: Э={f.toleranceEmotional} Б={f.toleranceSafety} С={f.toleranceStructural}</div>
                <div>Веса: Э={f.weightEmotional} Б={f.weightSafety} С={f.weightStructural}</div>
              </div>
            </button>
            <div className="px-5 pb-3 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setEditing({ ...f }); }}
                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1 rounded-lg text-xs transition">
                Редактировать
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(f.id, f.name); }}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1 rounded-lg text-xs transition">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модалка редактирования */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6">Редактирование: {editing.name} ({editing.code})</h3>

            {/* Основное */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Название</label>
                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 focus:border-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Цвет</label>
                <div className="flex gap-2">
                  <input type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer" />
                  <input value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })}
                    className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 outline-none" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1">Описание</label>
              <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 outline-none resize-none" />
            </div>

            <FormatForm
              data={editing}
              onChange={(key, value) => setEditing({ ...editing, [key]: value })}
              showCode={false}
            />

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1">Порядок сортировки</label>
              <input type="number" value={editing.sortOrder} onChange={e => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                className="w-24 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 outline-none" />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-5 py-2.5 rounded-lg font-semibold text-sm transition">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={() => setEditing(null)} className="bg-gray-600 hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm transition">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент формы с полями формата
function FormatForm({ data, onChange, showCode }: {
  data: any;
  onChange: (key: string, value: any) => void;
  showCode: boolean;
}) {
  return (
    <>
      {showCode && (
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Код (латиница, 2-3 символа)</label>
          <input value={data.code} onChange={e => onChange('code', e.target.value.toUpperCase())}
            maxLength={3} placeholder="P"
            className="w-24 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 focus:border-orange-500 outline-none" />
        </div>
      )}

      <h4 className="text-orange-400 font-semibold mb-3 mt-6">Идеальные значения (сумма за 3 фразы)</h4>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Эмоциональность', key: 'idealEmotional' },
          { label: 'Безопасность', key: 'idealSafety' },
          { label: 'Структурность', key: 'idealStructural' },
        ].map(p => (
          <div key={p.key}>
            <label className="block text-xs text-gray-400 mb-1">{p.label}</label>
            <input type="number" step="0.1" value={data[p.key]} onChange={e => onChange(p.key, Number(e.target.value))}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 focus:border-orange-500 outline-none" />
          </div>
        ))}
      </div>

      <h4 className="text-orange-400 font-semibold mb-3">Толерантности (отрицательная = инвертированная)</h4>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Эмоциональность', key: 'toleranceEmotional' },
          { label: 'Безопасность', key: 'toleranceSafety' },
          { label: 'Структурность', key: 'toleranceStructural' },
        ].map(p => (
          <div key={p.key}>
            <label className="block text-xs text-gray-400 mb-1">{p.label}</label>
            <input type="number" step="0.1" value={data[p.key]} onChange={e => onChange(p.key, Number(e.target.value))}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 focus:border-orange-500 outline-none" />
          </div>
        ))}
      </div>

      <h4 className="text-orange-400 font-semibold mb-3">Веса важности (сумма = 1)</h4>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Эмоциональность', key: 'weightEmotional' },
          { label: 'Безопасность', key: 'weightSafety' },
          { label: 'Структурность', key: 'weightStructural' },
        ].map(p => (
          <div key={p.key}>
            <label className="block text-xs text-gray-400 mb-1">{p.label}</label>
            <input type="number" step="0.01" min="0" max="1" value={data[p.key]} onChange={e => onChange(p.key, Number(e.target.value))}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 focus:border-orange-500 outline-none" />
          </div>
        ))}
      </div>
    </>
  );
}