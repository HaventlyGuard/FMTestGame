import axios from 'axios';
import type { StartResponse, SelectResponse, EvaluateResponse } from '../types/training';

const api = axios.create({ baseURL: 'http://localhost:5081/api/training' });

export const trainingApi = {
  start: (scenarioId?: number) =>
    api.post<StartResponse>('/start', scenarioId ?? null).then(r => r.data),

  select: (sessionId: string, optionId: number) =>
    api.post<SelectResponse>('/select', { sessionId, optionId }).then(r => r.data),

  evaluate: (sessionId: string) =>
    api.post<EvaluateResponse>('/evaluate', { sessionId }).then(r => r.data),
};