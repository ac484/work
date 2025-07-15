// 認證服務 - 處理用戶登入登出和認證狀態
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user, User as FirebaseUser } from '@angular/fire/auth';
import { AuthUser, AuthState, LoginCredentials, RegisterData } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private authState$ = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  constructor() {
    // 監聽 Firebase Auth 狀態變化
    user(this.auth).subscribe({
      next: (firebaseUser) => {
        const authUser = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
        this.authState$.next({
          user: authUser,
          isAuthenticated: !!authUser,
          isLoading: false,
          error: null
        });
      },
      error: (error) => {
        this.authState$.next({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.message
        });
      }
    });
  }

  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.authState$.pipe(map(state => state.user));
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState$.pipe(map(state => state.isAuthenticated));
  }

  isLoading(): Observable<boolean> {
    return this.authState$.pipe(map(state => state.isLoading));
  }

  async login(email: string, password: string): Promise<void> {
    try {
      this.setLoading(true);
      await signInWithEmailAndPassword(this.auth, email, password);
      this.clearError();
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    try {
      this.setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      // 可以在這裡更新用戶資料到 Firestore
      this.clearError();
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.clearError();
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser): AuthUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      isAnonymous: firebaseUser.isAnonymous
    };
  }

  private setLoading(loading: boolean): void {
    const currentState = this.authState$.value;
    this.authState$.next({ ...currentState, isLoading: loading });
  }

  private setError(error: string): void {
    const currentState = this.authState$.value;
    this.authState$.next({ ...currentState, error, isLoading: false });
  }

  private clearError(): void {
    const currentState = this.authState$.value;
    this.authState$.next({ ...currentState, error: null });
  }
}