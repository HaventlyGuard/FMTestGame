import { useState, useCallback } from 'react';
import { trainingApi } from '../api/trainingApi';
import type { Scenario, Part, PhraseOption, SelectedPhraseInfo, EffectivenessResult } from '../types/training';

export function useTrainingSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentPart, setCurrentPart] = useState<Part | null>(null);
  const [options, setOptions] = useState<PhraseOption[]>([]);
  const [selectedPhrases, setSelectedPhrases] = useState<SelectedPhraseInfo[]>([]);
  const [results, setResults] = useState<EffectivenessResult[] | null>(null);
  const [bestMatch, setBestMatch] = useState<EffectivenessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setResults(null);
      setBestMatch(null);
    } catch {
      setError('Ошибка при старте. Бэкенд запущен?');
    }
    setLoading(false);
  }, []);

  const select = useCallback(async (optionId: number) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await trainingApi.select(sessionId, optionId);
      setSelectedPhrases(data.selectedPhrases);

      if (data.nextAction === 'next_part') {
        setCurrentPart(data.nextPart);
        setOptions(data.options!);
      } else {
        const evalData = await trainingApi.evaluate(sessionId);
        setResults(evalData.results);
        setBestMatch(evalData.bestMatch);
        setCurrentPart(null);
        setOptions([]);
      }
    } catch {
      setError('Ошибка при выборе варианта');
    }
    setLoading(false);
  }, [sessionId]);

  return { sessionId, scenario, currentPart, options, selectedPhrases, results, bestMatch, loading, error, start, select };
}