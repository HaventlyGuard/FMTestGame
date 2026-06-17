import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import type { ScenarioFull, PhraseFull } from '../../types/admin';

const PART_NAMES: Record<string, string> = {
  opening: 'Вступление',
  middle: 'Основная часть',
  closing: 'Завершение',
};

export function ScenarioEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<ScenarioFull | null>(null);
  const [editingPhrase, setEditingPhrase] = useState<PhraseFull | null>(null);
  const [saving, setSaving] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  useEffect(() => {
    if (id) adminApi.getScenario(Number(id)).then(setScenario);
  }, [id]);

  const handleSave = async () => {
    if (!editingPhrase) return;
    setSaving(true);
    const updated = await adminApi.updatePhrase(editingPhrase.id, {
      text: editingPhrase.text,
      emotionalScore: editingPhrase.emotionalScore,
      safetyScore: editingPhrase.safetyScore,
      structuralScore: editingPhrase.structuralScore,
    });
    setScenario(prev => prev ? { ...prev, phrases: prev.phrases.map(p => p.id === updated.id ? updated : p) } : null);
    setEditingPhrase(null);
    setSaving(false);
  };

  if (!scenario) return <div className="text-center py-12 text-gray-400">Загрузка...</div>;

  const parts = ['opening', 'middle', 'closing'] as const;

  return (
    <div>
      <button onClick={() => navigate('/admin/scenarios')} className="text-gray-400 hover:text-white mb-4 text-sm">← Назад</button>
      
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-bold">{scenario.title}</h2>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input type="checkbox" checked={showEmpty} onChange={e => setShowEmpty(e.target.checked)} className="rounded accent-orange-500" />
          Показывать пустые
        </label>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Адресат: {scenario.recipientName} | Заполнено: {scenario.phrases.filter(p => p.text.trim()).length}/{scenario.phrases.length}
      </p>

      {parts.map(partCode => {
        const phrases = scenario.phrases
          .filter(p => p.partCode === partCode)
          .filter(p => showEmpty || p.text.trim() !== '');

        if (phrases.length === 0) return null;

        return (
          <div key={partCode} className="mb-6">
            <h3 className="text-lg font-semibold text-orange-400 mb-3">{PART_NAMES[partCode]}</h3>
            <div className="grid gap-2">
              {phrases.map(phrase => (
                <button
                  key={phrase.id}
                  onClick={() => setEditingPhrase(phrase)}
                  className={`text-left border rounded-xl p-4 transition w-full ${
                    phrase.text.trim()
                      ? 'bg-gray-800 hover:bg-gray-750 border-gray-700 hover:border-gray-500'
                      : 'bg-gray-800/50 border-dashed border-gray-600 hover:border-orange-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: phrase.formatColor }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-500">{phrase.formatName}</span>
                      <p className="text-white mt-1">
                        {phrase.text || <span className="text-gray-600 italic">Пусто — нажмите, чтобы заполнить</span>}
                      </p>
                    </div>
                    <div className="text-xs text-gray-600 text-right flex-shrink-0">
                      <div>Э: {phrase.emotionalScore}</div>
                      <div>Б: {phrase.safetyScore}</div>
                      <div>С: {phrase.structuralScore}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {editingPhrase && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditingPhrase(null)}>
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{PART_NAMES[editingPhrase.partCode]} — {editingPhrase.formatName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Текст</label>
                <textarea value={editingPhrase.text} onChange={e => setEditingPhrase({ ...editingPhrase, text: e.target.value })} rows={3}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-orange-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Эмоциональность</label>
                  <input type="number" step="0.001" value={editingPhrase.emotionalScore}
                    onChange={e => setEditingPhrase({ ...editingPhrase, emotionalScore: Number(e.target.value) })}
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Безопасность</label>
                  <input type="number" step="0.001" value={editingPhrase.safetyScore}
                    onChange={e => setEditingPhrase({ ...editingPhrase, safetyScore: Number(e.target.value) })}
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Структурность</label>
                  <input type="number" step="0.001" value={editingPhrase.structuralScore}
                    onChange={e => setEditingPhrase({ ...editingPhrase, structuralScore: Number(e.target.value) })}
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white text-sm border border-gray-600 focus:border-orange-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-5 py-2.5 rounded-lg font-semibold text-sm">
                {saving ? '...' : 'Сохранить'}
              </button>
              <button onClick={() => setEditingPhrase(null)} className="bg-gray-600 hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}