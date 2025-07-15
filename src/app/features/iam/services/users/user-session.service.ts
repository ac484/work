// 用戶會話服務 - 處理用戶登入會話管理
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { UserSession } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserSessionService {
  private firestore = inject(Firestore);
  private sessionsCollection = collection(this.firestore, 'userSessions');

  async createSession(uid: string, sessionData: Partial<UserSession>): Promise<void> {
    const sessionId = this.generateSessionId();
    const sessionDoc = doc(this.firestore, 'userSessions', sessionId);
    
    const session: UserSession = {
      uid,
      sessionId,
      loginAt: new Date(),
      lastActivityAt: new Date(),
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent
    };

    await setDoc(sessionDoc, session);
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    const sessionDoc = doc(this.firestore, 'userSessions', sessionId);
    await updateDoc(sessionDoc, {
      lastActivityAt: new Date()
    });
  }

  getUserSessions(uid: string): Observable<UserSession[]> {
    const q = query(
      this.sessionsCollection,
      where('uid', '==', uid),
      orderBy('loginAt', 'desc'),
      limit(10)
    );
    return collectionData(q, { idField: 'sessionId' }) as Observable<UserSession[]>;
  }

  getActiveSessions(): Observable<UserSession[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const q = query(
      this.sessionsCollection,
      where('lastActivityAt', '>', fiveMinutesAgo),
      orderBy('lastActivityAt', 'desc')
    );
    return collectionData(q, { idField: 'sessionId' }) as Observable<UserSession[]>;
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}