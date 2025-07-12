export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string;
  providerId: string;
  createdAt: number;
}
