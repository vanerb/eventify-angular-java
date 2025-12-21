export interface Chat{

}

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp?: string;
  eventId?: number;
  userId?: number;
  local?: boolean
}
