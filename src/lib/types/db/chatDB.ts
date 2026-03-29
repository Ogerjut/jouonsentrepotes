import type { ObjectId } from 'mongodb';

export interface ChatMessageDB {
  _id: ObjectId;
  date: Date;
  author: string;
  content: string;
  fontColor: string;
}

