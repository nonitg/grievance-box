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