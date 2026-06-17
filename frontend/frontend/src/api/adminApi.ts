import client from './client';
import type { Format, ScenarioListItem, ScenarioFull, AdminStats, PhraseFull } from '../types/admin';

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

export interface AdminSession {
  id: string;
  userEmail: string;
  userName: string;
  status: string;
  totalScenarios: number;
  completedScenarios: number;
  avgPercent: number;
  startedAt: string;
  completedAt: string | null;
}
export interface AdminScenarioResult {
  scenarioId: number;
  title: string;
  recipientName: string;
  recipientFormatName: string;
  results: { formatCode: string; formatName: string; color: string; percent: number; isNative: boolean }[];
}

export interface AdminSessionDetail {
  id: string;
  userEmail: string;
  userName: string;
  status: string;
  totalScenarios: number;
  completedScenarios: number;
  startedAt: string;
  completedAt: string | null;
  scenarioResults: AdminScenarioResult[];
}

export const adminApi = {
  getFormats: () => client.get<Format[]>(`${base}/formats`).then(r => r.data),
  getScenarios: () => client.get<ScenarioListItem[]>(`${base}/scenarios`).then(r => r.data),
  getScenario: (id: number) => client.get<ScenarioFull>(`${base}/scenarios/${id}`).then(r => r.data),
  createScenario: (data: { title: string; situationText: string; recipientName: string; recipientFormatId: number; hintText: string }) =>
    client.post<ScenarioFull>(`${base}/scenarios`, data).then(r => r.data),
  deleteScenario: (id: number) => client.delete(`${base}/scenarios/${id}`),
  updatePhrase: (id: number, data: { text: string; emotionalScore: number; safetyScore: number; structuralScore: number }) =>
    client.put<PhraseFull>(`${base}/phrases/${id}`, data).then(r => r.data),
  getStats: () => client.get<AdminStats>(`${base}/stats`).then(r => r.data),
  getUsers: (search?: string) =>
  client.get<UserAdmin[]>(`${base}/users`, { params: search ? { search } : {} }).then(r => r.data),
  updateUserRole: (userId: string, role: string) =>
    client.put<UserAdmin>(`${base}/users/${userId}/role`, { role }).then(r => r.data),
  deleteUser: (userId: string) => client.delete(`${base}/users/${userId}`),
  getFormatsFull: () => client.get<FormatFull[]>(`${base}/formats/full`).then(r => r.data),
  createFormat: (data: any) => client.post<FormatFull>(`${base}/formats`, data).then(r => r.data),
  updateFormat: (id: number, data: any) => client.put<FormatFull>(`${base}/formats/${id}`, data).then(r => r.data),
  deleteFormat: (id: number) => client.delete(`${base}/formats/${id}`),
  resetPhraseScores: (scenarioId: number) => client.post(`${base}/scenarios/${scenarioId}/reset-phrases-scores`),
  getSessions: () => client.get<AdminSession[]>(`${base}/sessions`).then(r => r.data),
  getSessionDetail: (id: string) => client.get<AdminSessionDetail>(`${base}/sessions/${id}`).then(r => r.data),
  
};