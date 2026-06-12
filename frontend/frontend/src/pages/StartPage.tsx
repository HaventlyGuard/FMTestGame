interface Props {
  onStart: () => void;
  loading: boolean;
}

export function StartPage({ onStart, loading }: Props) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
          Тренажёр коммуникации
        </h1>
        <p className="text-gray-400 mb-10 text-lg leading-relaxed">
          Научитесь составлять сообщения, которые точно попадают в цель.
          Выбирайте формулировки под формат мышления собеседника.
        </p>
        <button
          onClick={onStart}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xl px-12 py-4 rounded-xl font-semibold transition"
        >
          {loading ? 'Загрузка...' : 'Начать тренировку'}
        </button>
      </div>
    </div>
  );
}