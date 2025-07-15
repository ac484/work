// 認證攔截器 - 自動添加認證 token 到 HTTP 請求
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Auth, user } from '@angular/fire/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(Auth);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return user(this.auth).pipe(
      take(1),
      switchMap((firebaseUser) => {
        if (firebaseUser) {
          return from(firebaseUser.getIdToken()).pipe(
            switchMap(token => {
              const authReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
              return next.handle(authReq);
            })
          );
        }
        return next.handle(req);
      })
    );
  }
}