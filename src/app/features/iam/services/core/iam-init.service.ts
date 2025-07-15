// IAM 系統初始化服務
import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { ensureAllRoles, getRoleStats } from '../../utils/role-init.util';

@Injectable({ providedIn: 'root' })
export class IamInitService {
  private firestore = inject(Firestore);
  private initialized = false;

  /**
   * 初始化 IAM 系統
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('🚀 IAM 系統初始化開始...');

    try {
      // 1. 初始化系統角色
      await this.initializeRoles();

      // 2. 顯示初始化統計
      await this.showInitStats();

      this.initialized = true;
      console.log('✅ IAM 系統初始化完成');
    } catch (error) {
      console.error('❌ IAM 系統初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 初始化系統角色
   */
  private async initializeRoles(): Promise<void> {
    await ensureAllRoles(this.firestore);
  }

  /**
   * 顯示初始化統計資訊
   */
  private async showInitStats(): Promise<void> {
    const stats = await getRoleStats(this.firestore);
    console.log('📊 IAM 系統統計:', {
      '總角色數': stats.totalRoles,
      '系統角色': stats.systemRoles,
      '自定義角色': stats.customRoles
    });
  }

  /**
   * 檢查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 強制重新初始化
   */
  async forceReinitialize(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }
}