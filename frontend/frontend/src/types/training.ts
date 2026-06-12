export interface Scenario {
  id: number;
  title: string;
  situationText: string;
  recipientName: string;
  recipientFormatCode: string;
  recipientFormatName: string;
  hintText: string;
}

export interface Part {
  code: string;
  name: string;
  stepNumber: number;
  totalSteps: number;
}

export interface PhraseOption {
  id: number;
  text: string;
  formatCode: string;
  formatName: string;
  formatColor: string;
}

export interface SelectedPhraseInfo {
  partCode: string;
  partName: string;
  text: string;
  formatCode: string;
  formatColor: string;
}

export interface EffectivenessResult {
  formatCode: string;
  formatName: string;
  color: string;
  percent: number;
  isNative: boolean;
}

export interface StartResponse {
  sessionId: string;
  scenario: Scenario;
  currentPart: Part;
  options: PhraseOption[];
}

export interface SelectResponse {
  nextAction: 'next_part' | 'evaluate';
  nextPart: Part | null;
  options: PhraseOption[] | null;
  selectedPhrases: SelectedPhraseInfo[];
}

export interface EvaluateResponse {
  scenarioId: number;
  selectedPhrases: SelectedPhraseInfo[];
  results: EffectivenessResult[];
  bestMatch: EffectivenessResult | null;
}