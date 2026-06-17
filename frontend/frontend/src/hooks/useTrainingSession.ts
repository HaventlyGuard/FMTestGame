import { useState, useCallback, useEffect } from 'react';
import { trainingApi } from '../api/trainingApi';
import type {
  Scenario,
  Part,
  PhraseOption,
  SelectedPhraseInfo,
  EffectivenessResult,
  FinalResultsResponse,
} from '../types/training';

export function useTrainingSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentPart, setCurrentPart] = useState<Part | null>(null);
  const [options, setOptions] = useState<PhraseOption[]>([]);
  const [selectedPhrases, setSelectedPhrases] = useState<SelectedPhraseInfo[]>([]);
  const [allOptions, setAllOptions] = useState<Record<string, PhraseOption[]>>({});

  const [scenarioResult, setScenarioResult] = useState<{
    results: EffectivenessResult[];
    bestMatch: EffectivenessResult | null;
  } | null>(null);

  const [pendingScenario, setPendingScenario] = useState<Scenario | null>(null);
  const [pendingOptions, setPendingOptions] = useState<PhraseOption[]>([]);

  const [finalResults, setFinalResults] = useState<FinalResultsResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  return () => {
    if (sessionId) {
      trainingApi.getResults(sessionId).catch(() => {});
    }
  };
}, [sessionId]);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingApi.start();
      setSessionId(data.sessionId);
      setScenario(data.scenario);
      setCurrentPart(data.currentPart);
      setOptions(data.options);
      setSelectedPhrases([]);
      setAllOptions({ [data.currentPart.code]: data.options });
      setScenarioResult(null);
      setFinalResults(null);
      setPendingScenario(null);
      setPendingOptions([]);
    } catch {
      setError('Ошибка. Бэкенд запущен?');
    }
    setLoading(false);
  }, []);

  const select = useCallback(
    async (optionId: number) => {
      if (!sessionId) return;
      setLoading(true);
      try {
        const data = await trainingApi.select(sessionId, optionId);
        setSelectedPhrases(data.selectedPhrases);

        if (data.nextAction === 'next_part') {
          setCurrentPart(data.nextPart);
          const newOpts = data.options!;
          setOptions(newOpts);
          setAllOptions((prev) => ({ ...prev, [data.nextPart!.code]: newOpts }));
        } else if (data.nextAction === 'next_scenario') {
          // Результаты уже в ответе
          setScenarioResult({
            results: data.scenarioResults || [],
            bestMatch: data.scenarioResults?.find(r => r.isNative) || data.scenarioResults?.[0] || null,
          });
          setPendingScenario(data.nextScenario);
          setPendingOptions(data.options!);
          setCurrentPart(null);
          setOptions([]);
        } else if (data.nextAction === 'finished') {
          const final = await trainingApi.getResults(sessionId);
          setFinalResults(final);
          setScenarioResult(null);
          setPendingScenario(null);
          setCurrentPart(null);
          setOptions([]);
        }
      } catch {
        setError('Ошибка при выборе');
      }
      setLoading(false);
    },
    [sessionId]
  );

  const switchPart = useCallback(
    (partCode: string) => {
      const cached = allOptions[partCode];
      if (cached) {
        setOptions(cached);
        const partNames: Record<string, string> = {
          opening: 'Вступление',
          middle: 'Основная часть',
          closing: 'Завершение',
        };
        const stepNumber = ['opening', 'middle', 'closing'].indexOf(partCode) + 1;
        setCurrentPart({ code: partCode, name: partNames[partCode], stepNumber, totalSteps: 3 });
      }
    },
    [allOptions]
  );

  const replayScenario = useCallback(async () => {
    setLoading(true);
    setScenarioResult(null);
    setPendingScenario(null);
    setPendingOptions([]);
    try {
      const data = await trainingApi.start();
      setSessionId(data.sessionId);
      setScenario(data.scenario);
      setCurrentPart(data.currentPart);
      setOptions(data.options);
      setSelectedPhrases([]);
      setAllOptions({ [data.currentPart.code]: data.options });
    } catch {
      setError('Ошибка');
    }
    setLoading(false);
  }, []);

  const finishEarly = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const final = await trainingApi.getResults(sessionId);
      setFinalResults(final);
      setScenarioResult(null);
      setPendingScenario(null);
      setCurrentPart(null);
      setOptions([]);
    } catch {
      setError('Ошибка');
    }
    setLoading(false);
  }, [sessionId]);

  const nextScenario = useCallback(() => {
    setScenario(pendingScenario);
    setCurrentPart({ code: 'opening', name: 'Вступление', stepNumber: 1, totalSteps: 3 });
    setOptions(pendingOptions);
    setSelectedPhrases([]);
    setScenarioResult(null);
    setAllOptions({ opening: pendingOptions });
    setPendingScenario(null);
    setPendingOptions([]);
  }, [pendingScenario, pendingOptions]);

  return {
    sessionId,
    scenario,
    currentPart,
    options,
    selectedPhrases,
    scenarioResult,
    finalResults,
    pendingScenario,
    loading,
    error,
    start,
    select,
    switchPart,
    replayScenario,
    nextScenario,
    finishEarly,
  };
}