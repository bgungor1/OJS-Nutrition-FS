export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface QuickTopic {
  id: string;
  label: string;
  response: string;
}
