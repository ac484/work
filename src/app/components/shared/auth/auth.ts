import { Injectable } from '@angular/core';
import { Auth as FirebaseAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { inject } from '@angular/core';
import { Auth as AngularFireAuth } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private afAuth = inject(AngularFireAuth);

  /**
   * 取得目前登入使用者 Observable
   */
  user$: Observable<User | null> = this.afAuth.authState;

  /**
   * Google 登入
   */
  loginWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.afAuth, provider));
  }

  /**
   * 登出
   */
  logout(): Observable<void> {
    return from(signOut(this.afAuth));
  }
}
