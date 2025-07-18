// 本檔案為應用程式全域設定
// 功能：提供 PrimeNG、Firebase、路由、動畫、攔截器等全域 providers
// 用途：應用啟動與全域依賴注入
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeuix/themes/aura';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { permissionMonitoringInterceptor } from '../services/iam/permissions/permission-monitoring.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.p-dark' },
      },
      inputVariant: 'filled', // context7: 全域 input 現代化
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([permissionMonitoringInterceptor])
    ),
    provideFirebaseApp(() => initializeApp({ projectId: "lin-in", appId: "1:387803341154:web:a8e5216dfb18b4d7a78c3b", storageBucket: "lin-in.firebasestorage.app", apiKey: "AIzaSyCX4rENtBHJAxypxNpx5YrFU-gHZl3L2-s", authDomain: "lin-in.firebaseapp.com", messagingSenderId: "387803341154", measurementId: "G-20Y88DSFFS" })), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideAppCheck(() => {
      // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
      const provider = new ReCaptchaEnterpriseProvider('6LfZgXwrAAAAABMJ0e0Ym-ZbBuoJU5AFdXJa90am');
      return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
    }), provideFirestore(() => getFirestore()), provideFunctions(() => getFunctions()), provideMessaging(() => getMessaging()), providePerformance(() => getPerformance()), provideStorage(() => getStorage()), provideRemoteConfig(() => getRemoteConfig()), provideVertexAI(() => getVertexAI()),
  ],
};
