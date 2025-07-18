// 本服務用於處理 Google 與信箱登入/註冊/登出/密碼重設
// 功能：串接 Firebase Auth 與 Firestore，維護用戶資料
// 用途：供登入元件與全域認證調用
// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Authentication 與 Cloud Firestore
import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, UserCredential, createUserWithEmailAndPassword, User, sendPasswordResetEmail } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Firestore, doc, setDoc, serverTimestamp, getDoc } from '@angular/fire/firestore';
import { AppUser } from '../../../core/services/iam/users/user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  user$: Observable<User | null> = authState(this.auth);

  private async saveUserProfile(user: User) {
    if (!user || !user.uid) return;
    const userRef = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(userRef);
    let roles = ['user'];
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data['roles'])) roles = data['roles'];
    }
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      roles,
      lastLoginAt: serverTimestamp(),
      createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : serverTimestamp(),
    }, { merge: true });
  }

  async loginWithGoogle(): Promise<UserCredential> {
    const cred = await signInWithPopup(this.auth, new GoogleAuthProvider());
    await this.saveUserProfile(cred.user);
    return cred;
  }

  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    await this.saveUserProfile(cred.user);
    return cred;
  }

  async registerWithEmail(email: string, password: string): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.saveUserProfile(cred.user);
    return cred;
  }

  async changePassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
} 