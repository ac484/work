# 程式碼規範 (Coding Guidelines)

> **本專案遵循 Angular 20 極簡主義開發規範**，強調代碼品質、可讀性與一致性。
> 
> 核心原則：**清晰重於聰明，簡單重於複雜**。

---

## 📝 命名規範 (Naming Conventions)

### 檔案命名 (File Naming)
```typescript
// ✅ 正確命名
user-profile.component.ts      // 元件
user-data.service.ts          // 服務
user.model.ts                 // 模型
user-role.enum.ts             // 枚舉
currency-format.pipe.ts       // 管道
auth.guard.ts                 // 守衛
http.interceptor.ts           // 攔截器

// ❌ 錯誤命名
UserProfile.component.ts      // 不使用 PascalCase
userdata.service.ts          // 缺少連字符
user_model.ts                // 不使用底線
```

### 變數與函數命名 (Variable & Function Naming)
```typescript
// ✅ 正確命名
const userName = signal('');           // camelCase
const isLoading = signal(false);       // 布林值使用 is/has/can 前綴
const userList = computed(() => []);   // 複數形式表示陣列

// 函數命名
function getUserById(id: string) {}    // 動詞開頭
function validateEmail(email: string) {} // 描述性命名

// ❌ 錯誤命名
const user_name = '';                  // 不使用底線
const loading = false;                 // 布林值不清晰
const data = [];                       // 命名過於泛泛
```

### 元件與類別命名 (Component & Class Naming)
```typescript
// ✅ 正確命名
export class UserProfileComponent {}   // PascalCase + Component 後綴
export class UserDataService {}       // PascalCase + Service 後綴
export interface User {}              // PascalCase 介面
export enum UserRole {}               // PascalCase 枚舉

// ❌ 錯誤命名
export class userProfile {}           // 不使用 PascalCase
export class UserProfileComp {}       // 縮寫不清晰
```

---

## 🎨 代碼風格 (Code Style)

### TypeScript 嚴格模式
```typescript
// tsconfig.json 必須啟用嚴格模式
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}

// ✅ 正確使用類型
function processUser(user: User): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

// ❌ 禁止使用 any
function processData(data: any): any {  // 嚴禁使用
  return data;
}
```

### Angular 20 最佳實踐
```typescript
// ✅ 使用 signals 和新控制流
@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (users(); as userList) {
      @for (user of userList; track user.id) {
        <div>{{ user.name }}</div>
      }
    } @else {
      <div>沒有用戶數據</div>
    }
  `
})
export class UserListComponent {
  users = signal<User[]>([]);
  filteredUsers = computed(() => 
    this.users().filter(user => user.active)
  );
}

// ❌ 避免舊式寫法
@Component({
  template: `
    <div *ngIf="users.length > 0; else noData">
      <div *ngFor="let user of users; trackBy: trackByFn">
        {{ user.name }}
      </div>
    </div>
    <ng-template #noData>沒有用戶數據</ng-template>
  `
})
export class OldUserListComponent {
  users: User[] = [];  // 避免傳統陣列
}
```

### 代碼格式化
```typescript
// ✅ 正確格式化
const userConfig = {
  name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.ADMIN,
  permissions: [
    'read:users',
    'write:users',
    'delete:users'
  ]
};

// 函數參數過多時換行
function createUser(
  name: string,
  email: string,
  role: UserRole,
  permissions: string[]
): User {
  return { name, email, role, permissions };
}
```

---

## 🚫 常見反模式 (Anti-Patterns)

### 禁止的寫法
```typescript
// ❌ 使用 any 類型
function processData(data: any): any {
  return data.someProperty;
}

// ❌ 過度抽象
class UserFormatterService {
  formatUserName(user: User): string {
    return user.name;  // 單行邏輯不需要服務
  }
}

// ❌ 不必要的 Wrapper 元件
@Component({
  template: `<user-profile [user]="user"></user-profile>`
})
export class UserProfileWrapperComponent {
  @Input() user!: User;
}

// ❌ 使用舊式控制流
<div *ngIf="condition">...</div>
<div *ngFor="let item of items">...</div>

// ❌ 未使用 OnPush 策略
@Component({
  changeDetection: ChangeDetectionStrategy.Default  // 避免使用
})
```

### 推薦的替代方案
```typescript
// ✅ 使用具體類型
function processUser(user: User): UserProfile {
  return {
    id: user.id,
    displayName: user.name,
    email: user.email
  };
}

// ✅ 直接在元件中實現簡單邏輯
@Component({
  template: `<div>{{ formatUserName(user) }}</div>`
})
export class UserComponent {
  formatUserName(user: User): string {
    return user.name.toUpperCase();
  }
}

// ✅ 使用新控制流
@if (condition) {
  <div>內容</div>
}
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}
```

---

## 🛠️ 開發工具配置 (Development Tools)

### ESLint 配置
```json
// .eslintrc.json
{
  "extends": [
    "@angular-eslint/recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@angular-eslint/prefer-on-push-component-change-detection": "error",
    "@angular-eslint/prefer-standalone-component": "error"
  }
}
```

### Prettier 配置
```json
// .prettierrc
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### VS Code 設定
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## 📋 代碼審查檢查清單 (Code Review Checklist)

### ✅ 基本檢查
- [ ] 沒有使用 `any` 類型
- [ ] 使用 Angular 20 新控制流 (`@if`, `@for`, `@switch`)
- [ ] 元件使用 `OnPush` 變更檢測策略
- [ ] 使用 `signals` 管理狀態
- [ ] 遵循命名規範

### ✅ 架構檢查
- [ ] 單一職責原則
- [ ] 避免過度抽象
- [ ] 沒有不必要的 Wrapper 元件
- [ ] 適當的模組劃分

### ✅ 效能檢查
- [ ] 使用 `trackBy` 函數（在 `@for` 中）
- [ ] 避免在模板中使用複雜計算
- [ ] 適當使用 `computed()` 和 `effect()`

### ✅ 測試檢查
- [ ] 單元測試覆蓋率 > 80%
- [ ] 測試命名清晰描述測試意圖
- [ ] 使用適當的測試工具和模擬

---

## 🎯 極簡主義原則 (Minimalism Principles)

### 代碼簡潔性
```typescript
// ✅ 簡潔明瞭
const activeUsers = computed(() => 
  users().filter(user => user.active)
);

// ❌ 過度複雜
const activeUsers = computed(() => {
  const allUsers = users();
  const filteredUsers: User[] = [];
  for (let i = 0; i < allUsers.length; i++) {
    if (allUsers[i].active === true) {
      filteredUsers.push(allUsers[i]);
    }
  }
  return filteredUsers;
});
```

### 檔案大小控制
- **單檔案 < 100 行**：超過時考慮拆分
- **函數 < 20 行**：保持函數簡潔
- **元件職責單一**：一個元件只做一件事

---

> **核心理念**: 寫出清晰、簡潔、可維護的代碼，讓團隊成員能夠輕鬆理解和協作。
> 
> **品質保證**: 通過工具自動化和代碼審查，確保代碼品質的一致性。
