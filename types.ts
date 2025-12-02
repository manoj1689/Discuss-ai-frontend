export interface ContextProfile {
  intent: string;
  tone: string;
  assumptions: string;
  audience: string;
  coreArgument: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: number;
  isAiResponse?: boolean;
  replyToId?: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorHandle: string;
  content: string;
  imageUrl?: string; // Added image support
  timestamp: number;
  contextProfile: ContextProfile;
  likes: number;
  replyCount: number;
  avatarUrl: string;
  isLiked?: boolean; // Added for client-side state
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export enum AppView {
  FEED = 'FEED',
  EXPLORE = 'EXPLORE',
  NOTIFICATIONS = 'NOTIFICATIONS',
  PROFILE = 'PROFILE',
}

export interface User {
  name: string;
  handle: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  website?: string;
  stats?: {
    followers: number;
    following: number;
  }
}

export interface Notification {
  id: string;
  type: 'like' | 'reply' | 'follow' | 'mention';
  user: User;
  postPreview?: string;
  timestamp: number;
  read: boolean;
}
