export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
}

export interface Grievance {
  id?: string;
  content: string;
  createdAt: number;
  senderUid: string;
  senderName: string | null;
  recipientUid: string;
  isAnonymous: boolean;
  read: boolean;
}

export interface GrievanceFormData {
  content: string;
  recipientUid: string;
  isAnonymous: boolean;
}

export interface TeaPost {
  id?: string;
  content: string;
  createdAt: number;
  authorUid: string;
  authorName: string | null;
  isAnonymous: boolean;
  upvotes: number;
  upvotedBy: string[]; // Array of user IDs who have upvoted
}

export interface TeaPostFormData {
  content: string;
  isAnonymous: boolean;
}