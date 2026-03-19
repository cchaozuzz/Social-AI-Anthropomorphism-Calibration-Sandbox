export interface CprConfig {
  appearance: number; // 0-100
  behavior: number; // 0-100
  identity: number; // 0-100
  warmth: number; // 0-100
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
