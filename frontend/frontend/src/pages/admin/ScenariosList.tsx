import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import type { ScenarioListItem, Format } from '../../types/admin';

export function ScenariosList() {
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, f] = await Promise.all([adminApi.getScenarios(), adminApi.getFormats()]);
    setScenarios(s);
    setFormats(f);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data: { title: string; situationText: string; recipientName: string; recipientFormatId: number; hintText: string }) => {
    await adminApi.createScenario(data);
    setShowCreate(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить сценарий?')) return;
    await adminApi.deleteScenario(id);
    load();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Загрузка...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Сценарии ({scenarios.length})</h2>
        <button onClick={() => setShowCreate(true)} className="bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-lg font-semibold text-sm transition">+ Новый</button>
      </div>

      {showCreate && (
        <CreateForm formats={formats} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      )}

      <div className="grid gap-3">
        {scenarios.map(s => (
          <div key={s.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <Link to={`/admin/scenarios/${s.id}`} className="text-lg font-semibold hover:text-orange-400">{s.title}</Link>
                <p className="text-sm text-gray-400">{s.recipientName} ({s.recipientFormatName}) — {s.filledPhrases}/{s.totalPhrases} фраз</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/scenarios/${s.id}`} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg text-xs">Фразы</Link>
                <button onClick={() => handleDelete(s.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-xs">Удалить</button>
              </div>
            </div>
          </div>
        ))}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, situationText, recipientName, recipientFormatId, hintText });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700 space-y-4">
      <h3 className="text-lg font-bold">Новый сценарий</h3>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Название</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Ситуация</label>
        <textarea value={situationText} onChange={e => setSituationText(e.target.value)} required rows={3} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Имя адресата</label>
          <input value={recipientName} onChange={e => setRecipientName(e.target.value)} required className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Формат</label>
          <select value={recipientFormatId} onChange={e => setRecipientFormatId(Number(e.target.value))} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none">
            {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Подсказка</label>
        <input value={hintText} onChange={e => setHintText(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none" />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg font-semibold text-sm">Создать</button>
        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg text-sm">Отмена</button>
      </div>
    </form>
  );
}