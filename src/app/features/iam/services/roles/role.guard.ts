// 角色守衛 - 基於角色的路由保護
import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { IamFacadeService } from '../core/iam-facade.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private iamFacade = inject(IamFacadeService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return new Observable(observer => observer.next(true));
    }

    return this.iamFacade.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // 這裡需要獲取用戶的角色資訊
        // 簡化實現，實際應該從用戶服務獲取完整用戶資料
        const hasRequiredRole = requiredRoles.some(role => {
          // 需要實現角色檢查邏輯
          return true; // 暫時返回 true
        });

        if (!hasRequiredRole) {
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}