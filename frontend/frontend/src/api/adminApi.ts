import client from './client';
import type { Format, ScenarioListItem, ScenarioFull, AdminStats, PhraseFull } from '../types/admin';

const api = client; // используем настроенный клиент
const base = 'http://localhost:5081/api/admin';

export interface UserAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  totalSessions: number;
  completedSessions: number;
}

export interface FormatFull {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  idealEmotional: number;
  idealSafety: number;
  idealStructural: number;
  toleranceEmotional: number;
  toleranceSafety: number;
  toleranceStructural: number;
  weightEmotional: number;
  weightSafety: number;
  weightStructural: number;
  sortOrder: number;
}

export const adminApi = {
  getFormats: () => client.get<Format[]>(`${base}/formats`).then(r => r.data),
  getScenarios: () => client.get<ScenarioListItem[]>(`${base}/scenarios`).then(r => r.data),
  getScenario: (id: number) => client.get<ScenarioFull>(`${base}/scenarios/${id}`).then(r => r.data),
  createScenario: (data: { title: string; situationText: string; recipientName: string; recipientFormatId: number; hintText: string }) =>
    client.post<ScenarioFull>(`${base}/scenarios`, data).then(r => r.data),
  updateScenario: (id: number, data: { title: string; situationText: string; recipientName: string; recipientFormatId: number; hintText: string; isActive: boolean }) =>
    client.put<ScenarioFull>(`${base}/scenarios/${id}`, data).then(r => r.data),
  deleteScenario: (id: number) => client.delete(`${base}/scenarios/${id}`),
  updatePhrase: (id: number, data: { text: string; emotionalScore: number; safetyScore: number; structuralScore: number }) =>
    client.put<PhraseFull>(`${base}/phrases/${id}`, data).then(r => r.data),
  getStats: () => client.get<AdminStats>(`${base}/stats`).then(r => r.data),
  getUsers: () => client.get<UserAdmin[]>(`${base}/users`).then(r => r.data),
  updateUserRole: (userId: string, role: string) =>
    client.put<UserAdmin>(`${base}/users/${userId}/role`, { role }).then(r => r.data),
  deleteUser: (userId: string) => client.delete(`${base}/users/${userId}`),
  getFormatsFull: () => client.get<FormatFull[]>(`${base}/formats/full`).then(r => r.data),
  updateFormat: (id: number, data: Partial<FormatFull>) =>
    client.put<FormatFull>(`${base}/formats/${id}`, data).then(r => r.data),
  resetPhraseScores: (scenarioId: number) =>
    client.post(`${base}/scenarios/${scenarioId}/reset-phrases-scores`),
};