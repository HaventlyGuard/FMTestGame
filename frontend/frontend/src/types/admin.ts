export interface Format {
  id: number;
  code: string;
  name: string;
  color: string;
}

export interface ScenarioListItem {
  id: number;
  title: string;
  recipientName: string;
  recipientFormatName: string;
  isActive: boolean;
  filledPhrases: number;
  totalPhrases: number;
}

export interface PhraseFull {
  id: number;
  partCode: string;
  partName: string;
  formatCode: string;
  formatName: string;
  formatColor: string;
  text: string;
  emotionalScore: number;
  safetyScore: number;
  structuralScore: number;
}

export interface ScenarioFull {
  id: number;
  title: string;
  situationText: string;
  recipientName: string;
  recipientFormatId: number;
  hintText: string;
  isActive: boolean;
  phrases: PhraseFull[];
}

export interface AdminStats {
  activeScenarios: number;
  totalSessions: number;
  completedSessions: number;
  filledPhrases: number;
  totalPhrases: number;
}