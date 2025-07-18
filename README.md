# Angular 企業級管理平台

基於 Angular 20 + PrimeNG + Firebase 構建的現代化企業管理平台，採用模組化架構設計，提供合約管理、權限控制、工作區管理等核心功能。

## 🚀 技術棧

- **前端框架**: Angular 20
- **UI 組件庫**: PrimeNG 20.0.0-rc.3 + PrimeIcons 7.0.0
- **主題系統**: @primeuix/themes 1.2.0 + Material Color Utilities
- **樣式框架**: TailwindCSS 4.1.4 + TailwindCSS PrimeUI 0.6.1
- **後端服務**: Firebase 11.10.0 + @angular/fire 20.0.1
- **圖表庫**: Chart.js 4.4.8
- **PDF 處理**: PDF-lib 1.17.1
- **富文本編輯**: Quill 2.0.3
- **開發工具**: Angular CLI 20, TypeScript 5.8.3

## 📁 專案架構

### 核心架構設計
採用**分層模組化架構**，實現高內聚、低耦合的現代化設計：

```
src/app/
├── core/                    # 核心模組 - 應用基礎設施
│   ├── config/             # 應用配置
│   │   ├── app.config.ts   # 主應用配置
│   │   └── layout.config.ts # 佈局配置
│   ├── constants/          # 全域常數
│   │   └── permissions.ts  # 權限常數定義
│   └── services/           # 核心服務
│       ├── iam/           # 身份認證與授權
│       └── layout/        # 佈局管理服務
├── features/               # 功能模組 - 業務邏輯
│   ├── contract/          # 🎯 合約管理模組 (已重構)
│   ├── dashboard/         # 儀表板模組
│   ├── hub/              # 中心樞紐模組
│   ├── permission-management/ # 權限管理模組
│   ├── role-management/   # 角色管理模組
│   └── workspace/         # 工作區管理模組
├── shared/                # 共用模組 - 可重用組件
│   ├── components/        # 共用組件
│   │   └── google-auth/   # Google 認證組件
│   ├── modules/           # 共用模組
│   │   └── prime-ng.module.ts # PrimeNG 統一匯出
│   └── utils/             # 工具函數
│       └── global-message-store.ts # 全域訊息管理
└── shell/                 # 應用外殼 - 佈局框架
    └── layout.sidebar.ts  # 側邊欄佈局
```

## 🎯 核心功能模組

### 📄 合約管理模組 (Contract) - 已完成重構 ✅
採用**門面模式 (Facade Pattern)** 的現代化架構：

**架構特色**:
- 🎯 **ContractFacadeService**: 統一業務邏輯入口
- 📁 **分層組織**: models/components/services/utils 清晰分層
- 🔄 **集中式狀態管理**: RxJS Observable 響應式設計
- 📦 **三層匯出系統**: 統一匯入介面

**功能完整性**:
- 合約建立與編輯 (ContractCreationService)
- PDF 文件處理與上傳
- 合約狀態追蹤與時間軸
- 金額變更管理 (追加/追減)
- 請款流程處理
- 合約分析與統計
- 訊息與備註系統

### 🏢 工作區管理 (Workspace)
- 多工作區支援與切換
- 工作區權限控制
- 資源配置管理
- Mock 資料支援開發

### 👥 權限管理系統
- **角色管理**: 自定義角色與權限配置
- **權限監控**: 即時權限狀態追蹤與儀表板
- **存取控制**: 細粒度權限控制機制

### 📊 儀表板 (Dashboard)
- 數據視覺化展示
- 即時統計資訊
- 快速操作入口

### 🔗 中心樞紐 (Hub)
- 統一入口管理
- 快速導航
- 系統整合中心

## 🛠️ 開發環境設置

### 前置需求
- Node.js 18+
- npm 或 pnpm (推薦)
- Angular CLI 20

### 安裝與啟動
```bash
# 安裝依賴
npm install
# 或使用 pnpm
pnpm install

# 啟動開發伺服器 (含熱重載)
npm start
# 或
ng serve --hmr
```

應用將在 `http://localhost:4200/` 啟動，支援熱重載 (HMR)。

## 🔧 可用指令

```bash
# 開發相關
npm start           # 啟動開發伺服器 (含 HMR)
npm run build       # 建置生產版本
npm run watch       # 監控模式建置
npm test            # 執行單元測試

# 程式碼生成
ng generate component feature-name    # 生成組件
ng generate service service-name      # 生成服務
ng generate module module-name        # 生成模組
```

## 🔥 Firebase 整合

完整的 Firebase 服務整合：

- **Authentication**: 使用者認證 (Google Auth 支援)
- **Firestore**: NoSQL 資料庫

- **Storage**: 檔案儲存 (PDF 上傳)
- **Analytics**: 使用分析
- **Performance**: 效能監控

## 🎨 UI/UX 設計特色

### 現代化設計系統
- **PrimeNG Aura 主題**: 現代化 UI 組件
- **Material Design**: 色彩系統整合
- **TailwindCSS**: 原子化 CSS 框架
- **響應式佈局**: 支援各種螢幕尺寸

### 使用者體驗
- **深色模式**: 內建主題切換
- **無障礙支援**: 符合 WCAG 標準
- **動畫效果**: 流暢的使用者體驗
- **觸控友善**: 行動裝置優化

## 🏗️ 架構設計原則

### 模組化設計
- **功能模組**: 按業務領域組織
- **共用模組**: 可重用組件與服務
- **核心模組**: 應用基礎設施
- **外殼模組**: 佈局與導航

### 設計模式應用
- **門面模式**: 統一業務邏輯入口 (Contract 模組)
- **依賴注入**: Angular DI 系統
- **觀察者模式**: RxJS Observable
- **單例模式**: 核心服務管理

### 程式碼品質
- **TypeScript 嚴格模式**: 完整型別安全
- **Standalone 組件**: 現代化 Angular 架構
- **Signal 狀態管理**: 響應式狀態更新
- **中文註解**: 核心邏輯說明

## 📈 效能優化策略

- **懶載入路由**: 按需載入功能模組
- **Tree-shaking**: 移除未使用程式碼
- **程式碼分割**: 優化載入效能
- **快取策略**: HTTP 攔截器與資料快取
- **Bundle 大小控制**: 4MB 初始載入限制

## 🔒 安全性措施

- **Firebase App Check**: 應用安全檢查
- **reCAPTCHA Enterprise**: 機器人防護
- **HTTP 攔截器**: 請求監控與處理
- **權限驗證**: 多層級權限控制
- **路由守衛**: 認證與授權檢查

## 🚀 部署配置

### 建置生產版本
```bash
npm run build
```
建置檔案輸出至 `dist/primeng-quickstart/` 目錄

### Firebase 部署
```bash
firebase deploy
```

## 📊 專案狀態

### 模組完成度
- ✅ **合約管理模組**: 已完成重構，採用門面模式
- ✅ **權限管理系統**: 角色與權限控制完整
- ✅ **工作區管理**: 多工作區支援
- ✅ **核心基礎設施**: 認證、佈局、配置完成
- 🔄 **儀表板模組**: 基礎功能完成，持續優化
- 🔄 **中心樞紐**: 整合中

### 技術債務
- Firebase 配置檔案需要完善
- 單元測試覆蓋率待提升
- 國際化支援待實作

## 🤝 開發規範

- 遵循 Angular 風格指南
- 使用 TypeScript 嚴格模式
- 組件採用 Standalone 架構
- 使用 Signal 進行狀態管理
- 中文註解說明核心邏輯
- 模組化匯出與匯入

## 📄 授權

本專案採用私有授權，僅供內部使用。

---

**最後更新**: 2025年1月  
**架構版本**: v2.0 (合約模組重構完成)  
**技術棧版本**: Angular 20 + PrimeNG 20.0.0-rc.3