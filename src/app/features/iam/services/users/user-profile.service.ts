// 用戶資料服務 - 處理用戶個人資料管理
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { UserProfile } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private firestore = inject(Firestore);

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const profileDoc = doc(this.firestore, 'userProfiles', uid);
    const docSnap = await getDoc(profileDoc);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  }

  async createUserProfile(profile: UserProfile): Promise<void> {
    const profileDoc = doc(this.firestore, 'userProfiles', profile.uid);
    await setDoc(profileDoc, profile);
  }

  async updateUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
    const profileDoc = doc(this.firestore, 'userProfiles', uid);
    await updateDoc(profileDoc, profileData);
  }

  async updateAvatar(uid: string, photoURL: string): Promise<void> {
    await this.updateUserProfile(uid, { photoURL });
  }

  async updateContactInfo(uid: string, phone?: string, department?: string, position?: string): Promise<void> {
    await this.updateUserProfile(uid, { phone, department, position });
  }
}