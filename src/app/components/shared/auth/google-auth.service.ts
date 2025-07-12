// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Google Auth
import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  user$: Observable<import('firebase/auth').User | null>;
  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
  }
  loginWithGoogle(): Promise<void> {
    return signInWithPopup(this.auth, new GoogleAuthProvider()).then(() => {});
  }
  logout(): Promise<void> {
    return signOut(this.auth);
  }
} 