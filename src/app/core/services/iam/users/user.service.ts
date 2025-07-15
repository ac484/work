// 🚨 此服務已遷移至新的 IAM 模組
// 新路徑: src/app/features/iam/services/users/user.service.ts
// 請使用新的 IamFacadeService 進行用戶管理

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
      if (!user) return of(null);
      const ref = doc(this.firestore, 'users', user.uid);
      return from(getDoc(ref)).pipe(
        switchMap(snap => {
          const data = snap.data();
          if (!data) return of(null);
          return of({ uid: user.uid, email: user.email || '', roles: data['roles'] || [], displayName: user.displayName, photoURL: user.photoURL } as AppUser);
        })
      );
    })
  );
}
