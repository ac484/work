// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
// 極簡主義：僅提供 mock 資料查詢
import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace.model';
import { MOCK_WORKSPACES } from '../mock-workspace.data';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  getWorkspaces(): Workspace[] {
    return MOCK_WORKSPACES;
  }

  getWorkspaceById(id: string): Workspace | undefined {
    return MOCK_WORKSPACES.find(w => w.id === id);
  }
}
