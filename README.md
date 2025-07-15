# Angular 企業級管理平台

基於 Angular 20 + PrimeNG + Firebase 構建的現代化企業管理平台，提供工作區管理、權限控制、合約管理等核心功能。

## 🚀 技術棧

- **前端框架**: Angular 20
- **UI 組件庫**: PrimeNG 20.0.0-rc.3
- **樣式框架**: TailwindCSS 4.1.4
- **後端服務**: Firebase (Authentication, Firestore, Functions, Storage)
- **圖表庫**: Chart.js 4.4.8
- **PDF 處理**: PDF-lib 1.17.1
- **開發工具**: Angular CLI 20, TypeScript 5.8.3

## 📁 專案結構

```
src/
├── app/
│   ├── components/           # 全域組件
│   │   ├── dashboard.component.ts
│   │   └── workspace.component.ts
│   ├── core/                # 核心模組
│   │   ├── config/          # 應用配置
│   │   ├── constants/       # 常數定義
│   │   ├── guards/          # 路由守衛
│   │   ├── initializers/    # 初始化器
│   │   ├── interceptors/    # HTTP 攔截器
│   │   └── services/        # 核心服務
│   ├── features/            # 功能模組
│   │   ├── contract/        # 合約管理
│   │   ├── dashboard/       # 儀表板
│   │   ├── hub/            # 中心樞紐
│   │   ├── permission-management/  # 權限管理
│   │   ├── role-management/        # 角色管理
│   │   └── workspace/              # 工作區管理
│   ├── services/            # 共用服務
│   ├── shared/              # 共用模組
│   │   ├── components/      # 共用組件
│   │   ├── modules/         # 共用模組
│   │   ├── pipes/          # 管道
│   │   └── utils/          # 工具函數
│   └── shell/              # 應用外殼
│       └── layout.sidebar.ts
├── styles.scss             # 全域樣式
├── tailwind.css            # TailwindCSS 配置
└── main.ts                 # 應用入口
```

## 🎯 核心功能

### 📊 儀表板 (Dashboard)
- 數據視覺化展示
- 即時統計資訊
- 快速操作入口

### 🏢 工作區管理 (Workspace)
- 多工作區支援
- 工作區權限控制
- 資源配置管理

### 👥 權限管理系統
- **角色管理**: 自定義角色與權限
- **權限監控**: 即時權限狀態追蹤
- **存取控制**: 細粒度權限控制

### 📄 合約管理 (Contract)
- 合約建立與編輯
- PDF 文件處理
- 合約狀態追蹤

### 🔗 中心樞紐 (Hub)
- 統一入口管理
- 快速導航
- 系統整合

## 🛠️ 開發環境設置

### 前置需求
- Node.js 18+ 
- pnpm (推薦) 或 npm
- Angular CLI 20

### 安裝依賴
```bash
pnpm install
```

### 啟動開發伺服器
```bash
pnpm start
# 或
ng serve --hmr
```

應用將在 `http://localhost:4200/` 啟動，支援熱重載 (HMR)。

## 🔧 可用指令

### 開發
```bash
pnpm start          # 啟動開發伺服器 (含 HMR)
pnpm build          # 建置生產版本
pnpm watch          # 監控模式建置
pnpm test           # 執行單元測試
```

### 程式碼生成
```bash
ng generate component feature-name    # 生成組件
ng generate service service-name      # 生成服務
ng generate module module-name        # 生成模組
```

## 🔥 Firebase 配置

專案整合了完整的 Firebase 服務：

- **Authentication**: 使用者認證
- **Firestore**: NoSQL 資料庫
- **Functions**: 雲端函數
- **Storage**: 檔案儲存
- **Analytics**: 使用分析
- **Performance**: 效能監控
- **App Check**: 應用安全檢查

## 🎨 UI/UX 特色

- **現代化設計**: 採用 PrimeNG Aura 主題
- **響應式佈局**: 支援各種螢幕尺寸
- **深色模式**: 內建深色主題切換
- **無障礙支援**: 符合 WCAG 標準
- **動畫效果**: 流暢的使用者體驗

## 📱 響應式設計

- 桌面端優先設計
- 平板與手機適配
- 可摺疊側邊欄
- 觸控友善介面

## 🔒 安全性

- Firebase App Check 整合
- reCAPTCHA Enterprise 保護
- HTTP 攔截器監控
- 權限驗證機制

## 📈 效能優化

- 懶載入路由
- Tree-shaking 優化
- 程式碼分割
- 快取策略

## 🚀 部署

### 建置生產版本
```bash
pnpm build
```

建置檔案將輸出至 `dist/primeng-quickstart/` 目錄。

### Firebase 部署
```bash
firebase deploy
```

## 🤝 開發規範

- 使用 TypeScript 嚴格模式
- 遵循 Angular 風格指南
- 組件採用 Standalone 架構
- 使用 Signal 進行狀態管理
- 中文註解說明核心邏輯

## 📄 授權

本專案採用私有授權，僅供內部使用。

## 🆘 支援

如有問題或建議，請聯繫開發團隊。