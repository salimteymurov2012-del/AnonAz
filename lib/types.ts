export type Gender = "male" | "female" | "other";

export type UserCard = {
  id: number;
  username: string;
  age: number;
  city: string;
  district: string;
  gender: Gender;
  description: string;
  online: boolean;
  lastSeen: string;
  interests: string[];
  avatar: string;
  status: string;
  replyPreview?: string;
};

export type ChatMessage = {
  id: number;
  author: string;
  text: string;
  time: string;
  own?: boolean;
  seen?: boolean;
  replyTo?: string;
  attachment?: string;
};
