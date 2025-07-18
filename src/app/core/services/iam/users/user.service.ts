// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { Injectable, inject } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, from, switchMap, of } from 'rxjs';

export interface AppUser {
  uid: string;
  email: string;
  roles: string[];
  displayName?: string;
  photoURL?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  currentUser$: Observable<AppUser | null> = authState(this.auth).pipe(
    switchMap(user => {
      console.log('UserService - Firebase Auth 用戶:', user);
      if (!user) return of(null);
      const ref = doc(this.firestore, 'users', user.uid);
      return from(getDoc(ref)).pipe(
        switchMap(snap => {
          const data = snap.data();
          console.log('UserService - Firestore 用戶資料:', data);
          if (!data) return of(null);
          const appUser = { uid: user.uid, email: user.email || '', roles: data['roles'] || [], displayName: user.displayName, photoURL: user.photoURL } as AppUser;
          console.log('UserService - 最終用戶物件:', appUser);
          return of(appUser);
        })
      );
    })
  );
}
