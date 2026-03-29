export interface ChatMessage {
    _id: string;
    date: Date;
    author: string;
    content: string;
    fontColor: string;
  }

export type ChatMessages = ChatMessage[]