import client from './client';
import type { StartResponse, SelectResponse, EvaluateResponse, FinalResultsResponse } from '../types/training';

const base = 'http://localhost:5081/api/training';

export const trainingApi = {
  start: (scenarioId?: number) =>
    client.post<StartResponse>(`${base}/start`, scenarioId ?? null).then(r => r.data),
  select: (sessionId: string, optionId: number) =>
    client.post<SelectResponse>(`${base}/select`, { sessionId, optionId }).then(r => r.data),
  evaluate: (sessionId: string) =>
    client.post<EvaluateResponse>(`${base}/evaluate`, { sessionId }).then(r => r.data),
  getResults: (sessionId: string) =>
    client.get<FinalResultsResponse>(`${base}/results/${sessionId}`).then(r => r.data),
};