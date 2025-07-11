import { Injectable, inject, Signal } from '@angular/core';
import { Auth as FirebaseAuth, GoogleAuthProvider, signInWithPopup, user, User } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private auth: FirebaseAuth = inject(FirebaseAuth);
  public user: Signal<User | null | undefined> = toSignal(user(this.auth));

  /**
   * Google 登入
   */
  async loginWithGoogle(): Promise<void> {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
