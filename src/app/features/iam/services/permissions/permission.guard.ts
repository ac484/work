// 權限守衛 - 基於權限的路由保護
import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PermissionService } from './permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  private permissionService = inject(PermissionService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredPermissions = route.data['permissions'] as string[];
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return new Observable(observer => observer.next(true));
    }

    // 檢查所有必要權限
    const permissionChecks = requiredPermissions.map(permission =>
      this.permissionService.checkPermission(permission)
    );

    return new Observable(observer => {
      Promise.all(permissionChecks).then(results => {
        const hasAllPermissions = results.every(result => result);
        
        if (!hasAllPermissions) {
          this.router.navigate(['/unauthorized']);
          observer.next(false);
        } else {
          observer.next(true);
        }
        observer.complete();
      }).catch(() => {
        this.router.navigate(['/unauthorized']);
        observer.next(false);
        observer.complete();
      });
    });
  }
}