// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PermissionMonitorService } from './permission-monitor.service';
import { UserService, AppUser } from '../users/user.service';
import { CrudOperation } from '../../../constants/permissions';

// HTTP 方法到 CRUD 操作的映射
const HTTP_METHOD_TO_CRUD: Record<string, CrudOperation> = {
  'GET': 'read',
  'POST': 'create',
  'PUT': 'update',
  'PATCH': 'update',
  'DELETE': 'delete'
};

// URL 路徑到資源類型的映射
const URL_TO_RESOURCE_TYPE: Array<{ pattern: RegExp; resourceType: string }> = [
  { pattern: /\/contracts/i, resourceType: 'contract' },
  { pattern: /\/payments/i, resourceType: 'payment' },
  { pattern: /\/roles/i, resourceType: 'role' },
  { pattern: /\/users/i, resourceType: 'user' }
];

// 提取資源 ID 的正則表達式
const RESOURCE_ID_PATTERNS = [
  /\/contracts\/([^/?]+)/i,
  /\/payments\/([^/?]+)/i,
  /\/roles\/([^/?]+)/i,
  /\/users\/([^/?]+)/i
];

export const permissionMonitoringInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const permissionMonitor = inject(PermissionMonitorService);
  const userService = inject(UserService);

  // 只監控 Firestore 和應用 API 請求
  if (!shouldMonitorRequest(req)) {
    return next(req);
  }

  const operation = HTTP_METHOD_TO_CRUD[req.method];
  const resourceType = extractResourceType(req.url);
  const resourceId = extractResourceId(req.url);

  if (!operation || !resourceType) {
    return next(req);
  }

  // 獲取當前用戶並檢查權限
  return from(getCurrentUser()).pipe(
    switchMap(user => {
      // 檢查 CRUD 權限
      return from(permissionMonitor.checkCrudPermission(
        resourceType,
        operation,
        user as AppUser | null,
        resourceId || undefined
      )).pipe(
        switchMap(permissionResult => {
          if (!permissionResult.granted) {
            console.warn(`API 權限檢查失敗: ${req.method} ${req.url}`, {
              reason: permissionResult.reason,
              user: (user as AppUser)?.uid || 'anonymous',
              operation,
              resourceType,
              resourceId
            });
            
            // 可以選擇阻止請求或僅記錄
            // 這裡選擇記錄但不阻止，因為 Firebase Security Rules 會處理實際的安全
          }

          return next(req).pipe(
            tap(event => {
              // 記錄成功的 API 請求
              if (event.type === 4) { // HttpEventType.Response
                console.log(`API 請求成功: ${req.method} ${req.url}`, {
                  user: (user as AppUser)?.uid || 'anonymous',
                  operation,
                  resourceType,
                  resourceId,
                  granted: permissionResult.granted
                });
              }
            }),
            catchError(error => {
              // 記錄失敗的 API 請求
              console.error(`API 請求失敗: ${req.method} ${req.url}`, {
                user: (user as AppUser)?.uid || 'anonymous',
                operation,
                resourceType,
                resourceId,
                error: error.message,
                granted: permissionResult.granted
              });
              throw error;
            })
          );
        })
      );
    })
  );

  function getCurrentUser(): Promise<AppUser | null> {
    return new Promise(resolve => {
      userService.currentUser$.subscribe(user => resolve(user)).unsubscribe();
    });
  }
};

// 判斷是否應該監控此請求
function shouldMonitorRequest(req: HttpRequest<unknown>): boolean {
  const url = req.url.toLowerCase();
  
  // 監控 Firebase Firestore 請求
  if (url.includes('firestore.googleapis.com')) {
    return true;
  }
  
  // 監控應用 API 請求
  if (url.includes('/api/')) {
    return true;
  }
  
  // 監控本地開發 API
  if (url.includes('localhost') && (url.includes('/contracts') || url.includes('/payments') || url.includes('/roles'))) {
    return true;
  }
  
  return false;
}

// 從 URL 提取資源類型
function extractResourceType(url: string): string | null {
  for (const mapping of URL_TO_RESOURCE_TYPE) {
    if (mapping.pattern.test(url)) {
      return mapping.resourceType;
    }
  }
  return null;
}

// 從 URL 提取資源 ID
function extractResourceId(url: string): string | null {
  for (const pattern of RESOURCE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
} 