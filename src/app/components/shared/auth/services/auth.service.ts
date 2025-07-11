// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { Injectable, inject, Signal } from '@angular/core';
import { Auth as FirebaseAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, user, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserProfile } from '../types/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: FirebaseAuth = inject(FirebaseAuth);
  private firestore: Firestore = inject(Firestore);
  public user: Signal<User | null | undefined> = toSignal(user(this.auth));

  async loginWithGoogle(): Promise<void> {
    const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
    if (result.user) {
      await this.saveUserProfile(result.user);
    }
  }

  async loginWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async registerWithEmail(email: string, password: string): Promise<void> {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    if (result.user) {
      await this.saveUserProfile(result.user);
    }
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  // 新增：將用戶資訊存入 Firestore
  private async saveUserProfile(user: User): Promise<void> {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: user.providerData[0]?.providerId,
      createdAt: Date.now()
    };
    const ref = doc(this.firestore, 'users', user.uid);
    await setDoc(ref, profile, { merge: true });
  }
} 