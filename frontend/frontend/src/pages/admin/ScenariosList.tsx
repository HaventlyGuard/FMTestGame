// src/pages/admin/ScenariosList.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import type { ScenarioListItem, Format } from '../../types/admin';

export function ScenariosList() {
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, f] = await Promise.all([adminApi.getScenarios(), adminApi.getFormats()]);
    setScenarios(s); setFormats(f); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (data: { title: string; situationText: string; recipientName: string; recipientFormatId: number; hintText: string }) => {
    await adminApi.createScenario(data); setShowCreate(false); load();
  };
  const handleDelete = async (id: number) => {
    if (!confirm('Удалить сценарий?')) return;
    await adminApi.deleteScenario(id); load();
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Загрузка...</div>;

  const visibleScenarios = showEmpty ? scenarios : scenarios.filter(s => s.filledPhrases > 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-extralight text-slate-800">Сценарии ({visibleScenarios.length})</h2>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={showEmpty} onChange={e => setShowEmpty(e.target.checked)} className="rounded" />
            Показывать пустые
          </label>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition">+ Новый</button>
      </div>

      {showCreate && <CreateForm formats={formats} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />}

      <div className="space-y-3">
        {visibleScenarios.map(s => (
          <div key={s.id} className="glass p-5">
            <div className="flex justify-between items-center">
              <div>
                <Link to={`/admin/scenarios/${s.id}`} className="text-lg font-medium text-slate-800 hover:text-blue-500 transition">{s.title}</Link>
                <p className="text-sm text-slate-400">{s.recipientName} ({s.recipientFormatName}) — {s.filledPhrases}/{s.totalPhrases} фраз</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/scenarios/${s.id}`} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium transition">Фразы</Link>
                <button onClick={() => handleDelete(s.id)} className="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition">Удалить</button>
              </div>
            </div>
          </div>
        ))}
        {visibleScenarios.length === 0 && (
          <p className="text-center py-12 text-slate-400">{showEmpty ? 'Нет сценариев.' : 'Нет заполненных.'}</p>
        )}
      </div>
    </div>
  );
}

function CreateForm({ formats, onSubmit, onCancel }: {
  formats: Format[];
  onSubmit: (data: { title: string; situationText: string; recipientName: string; recipientFormatId: number; hintText: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [situationText, setSituationText] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientFormatId, setRecipientFormatId] = useState(formats[0]?.id ?? 0);
  const [hintText, setHintText] = useState('');

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ title, situationText, recipientName, recipientFormatId, hintText }); };

  return (
    <form onSubmit={handleSubmit} className="glass p-6 mb-6 space-y-4">
      <h3 className="text-lg font-medium text-slate-800">Новый сценарий</h3>
      <div><label className="block text-sm text-slate-400 mb-1">Название</label><input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-white/50 rounded-xl px-4 py-3 text-slate-800 border border-white/80 focus:border-blue-300 outline-none" /></div>
      <div><label className="block text-sm text-slate-400 mb-1">Ситуация</label><textarea value={situationText} onChange={e => setSituationText(e.target.value)} required rows={3} className="w-full bg-white/50 rounded-xl px-4 py-3 text-slate-800 border border-white/80 focus:border-blue-300 outline-none resize-none" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-slate-400 mb-1">Имя адресата</label><input value={recipientName} onChange={e => setRecipientName(e.target.value)} required className="w-full bg-white/50 rounded-xl px-4 py-3 text-slate-800 border border-white/80 focus:border-blue-300 outline-none" /></div>
        <div><label className="block text-sm text-slate-400 mb-1">Формат</label><select value={recipientFormatId} onChange={e => setRecipientFormatId(Number(e.target.value))} className="w-full bg-white/50 rounded-xl px-4 py-3 text-slate-800 border border-white/80 focus:border-blue-300 outline-none">{formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
      </div>
      <div><label className="block text-sm text-slate-400 mb-1">Подсказка</label><input value={hintText} onChange={e => setHintText(e.target.value)} className="w-full bg-white/50 rounded-xl px-4 py-3 text-slate-800 border border-white/80 focus:border-blue-300 outline-none" /></div>
      <div className="flex gap-3">
        <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-xl font-medium text-sm transition">Создать</button>
        <button type="button" onClick={onCancel} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2 rounded-xl text-sm transition">Отмена</button>
      </div>
    </form>
  );
}