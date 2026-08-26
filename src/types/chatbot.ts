export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp?: number;
}

export interface ChatState {
  isOpen: boolean;
  isLoading: boolean;
}