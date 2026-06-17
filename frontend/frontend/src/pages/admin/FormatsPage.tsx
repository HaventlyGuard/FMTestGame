// src/pages/admin/FormatsPage.tsx
import { useState, useEffect } from 'react';
import { adminApi, type FormatFull } from '../../api/adminApi';

const defaultFormat = { code: '', name: '', description: '', color: '#6366f1', idealEmotional: 3, idealSafety: 3, idealStructural: 3, toleranceEmotional: 1, toleranceSafety: 1, toleranceStructural: 1, weightEmotional: 0.33, weightSafety: 0.33, weightStructural: 0.34 };

export function FormatsPage() {
  const [formats, setFormats] = useState<FormatFull[]>([]);
  const [editing, setEditing] = useState<FormatFull | null>(null);
  const [creating, setCreating] = useState(false);
  const [newFormat, setNewFormat] = useState({ ...defaultFormat });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => { const data = await adminApi.getFormatsFull(); setFormats(data); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => { if (!editing) return; setSaving(true); await adminApi.updateFormat(editing.id, editing); setFormats(prev => prev.map(f => f.id === editing.id ? editing : f)); setEditing(null); setSaving(false); setMessage('Формат сохранён'); setTimeout(() => setMessage(''), 2000); };
  const handleCreate = async () => { if (!newFormat.code || !newFormat.name) { setMessage('Код и название обязательны'); return; } setSaving(true); try { const created = await adminApi.createFormat(newFormat); setFormats(prev => [...prev, created]); setCreating(false); setNewFormat({ ...defaultFormat }); setMessage('Формат создан'); } catch (e: any) { setMessage(e.response?.data || 'Ошибка'); } setSaving(false); setTimeout(() => setMessage(''), 2000); };
  const handleDelete = async (id: number, name: string) => { if (!confirm(`Удалить "${name}"?`)) return; try { await adminApi.deleteFormat(id); setFormats(prev => prev.filter(f => f.id !== id)); setMessage('Формат удалён'); } catch (e: any) { setMessage(e.response?.data || 'Ошибка'); } setTimeout(() => setMessage(''), 2000); };
  const resetScores = async () => { const scenarioId = prompt('ID сценария?'); if (!scenarioId) return; await adminApi.resetPhraseScores(Number(scenarioId)); setMessage('Баллы сброшены'); setTimeout(() => setMessage(''), 2000); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extralight text-slate-800">Форматы ({formats.length})</h2>
        <div className="flex gap-2">
          <button onClick={resetScores} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm transition">Сбросить баллы</button>
          <button onClick={() => setCreating(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-medium text-sm transition">+ Новый формат</button>
        </div>
      </div>

      {message && <div className={`p-3 rounded-xl mb-4 text-sm ${message.includes('Ошибка') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>{message}</div>}

      {creating && (
        <div className="glass p-6 mb-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Новый формат</h3>
          <FormatForm data={newFormat} onChange={(k, v) => setNewFormat(prev => ({ ...prev, [k]: v }))} showCode />
          <div className="flex gap-3 mt-6">
            <button onClick={handleCreate} disabled={saving} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm">{saving ? '...' : 'Создать'}</button>
            <button onClick={() => setCreating(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm">Отмена</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {formats.map(f => (
          <div key={f.id} className="glass overflow-hidden">
            <button onClick={() => setEditing({ ...f })} className="text-left p-5 hover:bg-white/60 transition w-full">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: f.color }} />
                <span className="text-lg font-medium text-slate-800">{f.name}</span>
                <span className="text-sm text-slate-400">({f.code})</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm text-slate-500">
                <div>Идеалы: Э={f.idealEmotional} Б={f.idealSafety} С={f.idealStructural}</div>
                <div>Толер: Э={f.toleranceEmotional} Б={f.toleranceSafety} С={f.toleranceStructural}</div>
                <div>Веса: Э={f.weightEmotional} Б={f.weightSafety} С={f.weightStructural}</div>
              </div>
            </button>
            <div className="px-5 pb-3 flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); setEditing({ ...f }); }} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-xs font-medium transition">Редактировать</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id, f.name); }} className="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-medium transition">Удалить</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="glass p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-medium text-slate-800 mb-6">Редактирование: {editing.name} ({editing.code})</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><label className="block text-xs text-slate-400 mb-1">Название</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full bg-white/50 rounded-xl px-3 py-2 text-slate-800 text-sm border border-white/80 focus:border-blue-300 outline-none" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">Цвет</label><div className="flex gap-2"><input type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" /><input value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} className="flex-1 bg-white/50 rounded-xl px-3 py-2 text-slate-800 text-sm border border-white/80 outline-none" /></div></div>
            </div>
            <div className="mb-4"><label className="block text-xs text-slate-400 mb-1">Описание</label><textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full bg-white/50 rounded-xl px-3 py-2 text-slate-800 text-sm border border-white/80 outline-none resize-none" /></div>
            <FormatForm data={editing} onChange={(k, v) => setEditing({ ...editing, [k]: v })} />
            <div className="mb-4"><label className="block text-xs text-slate-400 mb-1">Порядок</label><input type="number" value={editing.sortOrder} onChange={e => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className="w-24 bg-white/50 rounded-xl px-3 py-2 text-slate-800 text-sm border border-white/80 outline-none" /></div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm">{saving ? '...' : 'Сохранить'}</button>
              <button onClick={() => setEditing(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormatForm({ data, onChange, showCode = false }: { data: any; onChange: (key: string, value: any) => void; showCode?: boolean }) {
  return (
    <>
      {showCode && <div className="mb-4"><label className="block text-xs text-slate-400 mb-1">Код</label><input value={data.code} onChange={e => onChange('code', e.target.value.toUpperCase())} maxLength={3} className="w-24 bg-white/50 rounded-xl px-3 py-2 text-slate-800 text-sm border border-white/80 outline-none" /></div>}
      <h4 className="text-slate-700 font-medium mb-3 mt-6">Идеальные значения</h4>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {['idealEmotional', 'idealSafety', 'idealStructural'].map((key, i) => (
          <div key={key}><label className="block text-xs text-slate-400 mb-1">{['Эмоциональность', 'Безопасность', 'Структурность'][i]}</label><input type="number" step="0.1" value={data[key]} onChange={e => onChange(key, Number(e.target.value))} className="w-full bg-white/50 rounded-xl px-3 py-2 text-slate-800 text-sm border border-white/80 outline-none" /></div>
        ))}
      </div>
      <h4 className="text-slate-700 font-medium mb-3">Толерантности</h4>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {['toleranceEmotional', 'toleranceSafety', 'toleranceStructural'].map((key, i) => (
          <div key={key}><label className="block text-xs text-slate-400 mb-1">{['Эмоциональность', 'Безопасность', 'Структурность'][i]}</label><input type="number" step="0.1" value={data[key]} onChange={e => onChange(key, Number(e.target.value))} className="w-full bg-white/50 rounded-xl px-3 py-2 text-slate-800 text-sm border border-white/80 outline-none" /></div>
        ))}
      </div>
      <h4 className="text-slate-700 font-medium mb-3">Веса</h4>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {['weightEmotional', 'weightSafety', 'weightStructural'].map((key, i) => (
          <div key={key}><label className="block text-xs text-slate-400 mb-1">{['Эмоциональность', 'Безопасность', 'Структурность'][i]}</label><input type="number" step="0.01" min="0" max="1" value={data[key]} onChange={e => onChange(key, Number(e.target.value))} className="w-full bg-white/50 rounded-xl px-3 py-2 text-slate-800 text-sm border border-white/80 outline-none" /></div>
        ))}
      </div>
    </>
  );
}