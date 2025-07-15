# 合約模組架構文檔

## 🎯 架構概覽

合約模組採用**門面模式 (Facade Pattern)** 和**分層架構設計**，實現結構化、模組化、服務化的現代架構。

## 📁 目錄結構

```
src/app/features/contract/
├── index.ts                           # 統一匯出入口
├── contract.module.ts                 # Angular 模組定義
├── contract.routes.ts                 # 路由配置
├── models/                           # 資料模型層
│   ├── contract.model.ts             # 合約相關型別定義
│   └── index.ts
├── components/                       # UI 元件層
│   ├── list/                         # 合約清單畫面用元件
│   ├── detail/                       # 合約詳情畫面用元件
│   ├── payment/                      # 合約請款區塊用元件
│   ├── analytics/                    # 合約統計與分析區塊用元件
│   ├── actions/                      # 合約操作按鈕/彈窗等功能元件
│   ├── shared/                       # 合約模組內共用元件
│   └── index.ts
├── services/                         # 業務邏輯層
│   ├── core/                         # 與合約主資料 CRUD 相關的核心服務
│   │   ├── contract.service.ts       # 核心資料服務
│   │   ├── contract-creation.service.ts # 合約建立服務
│   │   ├── contract-facade.service.ts   # 🎯 門面服務 (核心)
│   │   └── index.ts
│   ├── analytics/                    # 合約統計資料取得與處理服務
│   ├── payment/                      # 處理請款流程的後端互動服務
│   ├── management/                   # 合約審核、編輯、角色權限等管理服務
│   └── index.ts
└── utils/                            # 合約模組中用到的純函數、工具程式
    ├── contract-calculations.util.ts # 計算相關工具
    ├── contract-validators.util.ts   # 驗證相關工具
    ├── contract-analytics.util.ts    # 分析相關工具
    └── index.ts
```

## 🏗️ 核心設計

### 1. 門面模式 (Facade Pattern)
**ContractFacadeService** 作為統一的業務邏輯入口：

```typescript
@Injectable({ providedIn: 'root' })
export class ContractFacadeService {
  // 整合各專門服務
  private contractService = inject(ContractService);
  private analyticsService = inject(ContractAnalyticsService);
  private summaryService = inject(ContractSummaryService);
  private filterService = inject(ContractFilterService);
  private timelineService = inject(ContractTimelineService);

  // 集中式狀態管理
  private selectedContractId$ = new BehaviorSubject<string | null>(null);
  private contracts$ = this.contractService.getContracts().pipe(shareReplay(1));

  // 統一 API 方法
  getContracts(): Observable<Contract[]>
  setSelectedContract(id: string | null): void
  getSelectedContract(): Observable<Contract | undefined>
  getContractAnalytics(): Observable<any>
  // ... 其他業務方法
}
```

### 2. 分層架構
- **模型層** (models): TypeScript 介面和型別定義
- **元件層** (components): 按功能領域分組的 UI 元件
- **服務層** (services): 按職責分組的業務邏輯
- **工具層** (utils): 可重用的純函數

### 3. 三層匯出系統
```typescript
// 1. 子目錄匯出
export * from './contract-list.component';

// 2. 分類匯出
export * from './list';
export * from './detail';

// 3. 統一匯出
export * from './models';
export * from './components';
export * from './services';
export * from './utils';
```

## 🔄 狀態管理

### 集中式狀態管理
```typescript
// 在 ContractFacadeService 中實現
private selectedContractId$ = new BehaviorSubject<string | null>(null);
private contracts$ = this.contractService.getContracts().pipe(shareReplay(1));

// 狀態操作
setSelectedContract(id: string | null): void {
  this.selectedContractId$.next(id);
}

getSelectedContract(): Observable<Contract | undefined> {
  return combineLatest([this.contracts$, this.selectedContractId$]).pipe(
    map(([contracts, selectedId]) => 
      selectedId ? contracts.find(c => c.id === selectedId) : undefined
    ),
    distinctUntilChanged()
  );
}
```

## 🔗 使用方式

### 外部模組整合
```typescript
// 簡潔的統一匯入
import {
  ContractListComponent,
  TimelineComponent,
  PaymentDetailsComponent,
  ContractFacadeService,
  Contract
} from '../contract';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [ContractListComponent, TimelineComponent, PaymentDetailsComponent],
})
export class HubComponent {
  // 只依賴門面服務
  contracts$ = this.contractFacade.getContracts();
  selectedContract$ = this.contractFacade.getSelectedContract();
  
  constructor(private contractFacade: ContractFacadeService) {}
  
  onContractRowClick(contract: { id: string }): void {
    this.contractFacade.setSelectedContract(contract.id);
  }
}
```

### 功能擴展
```typescript
// 1. 在對應目錄建立新服務
@Injectable({ providedIn: 'root' })
export class ContractNewFeatureService { ... }

// 2. 在門面服務中整合
private newFeatureService = inject(ContractNewFeatureService);

// 3. 提供統一方法
getNewFeature(): Observable<any> {
  return this.newFeatureService.getFeature();
}
```

## ✅ 架構優勢

- **低耦合**: 外部模組只依賴 `ContractFacadeService`
- **高內聚**: 相關功能集中在合約模組內
- **可維護**: 結構化的目錄組織和清晰的依賴關係
- **可擴展**: 支援在對應目錄添加新功能
- **可測試**: 門面服務易於 Mock，各服務可獨立測試

## 📋 技術規範

- **Angular v20** + **PrimeNG 20.0.0-rc.3** + **@angular/fire**
- **極簡主義**代碼風格
- **TypeScript**完整型別安全
- **PrimeNG**元件從 `prime-ng.module.ts` 引用
- **響應式設計**使用 RxJS Observable

## 🔮 擴展指南

1. **新增元件**: 在對應的 `components/` 子目錄中添加
2. **新增服務**: 在對應的 `services/` 子目錄中添加  
3. **新增工具**: 在 `utils/` 目錄中添加純函數
4. **整合功能**: 在 `ContractFacadeService` 中提供統一 API

---

**架構模式**: 門面模式 + 分層架構  
**設計原則**: 低耦合、高內聚、單一職責  
**重構成果**: ✅ 結構化 ✅ 模組化 ✅ 服務化