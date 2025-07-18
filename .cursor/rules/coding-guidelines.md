# Coding Guidelines

> This project follows Angular best practices with a focus on minimalism: clear, concise, and maintainable code.

## Core Principles

- **Readability First**: Self-explanatory code with minimal comments
- **Consistency**: Unified naming and formatting conventions
- **Simplicity**: Avoid over-engineering, keep code concise
- **Maintainability**: Consider future maintenance needs

```typescript
// ✅ Good design
interface UserService {
  getUser(id: string): Signal<User | null>;
  updateUser(user: User): Promise<void>;
}

// ❌ Avoid
interface UserService {
  getUserByIdentifierAndReturnUserObjectOrNullIfNotFound(id: string): Signal<User | null>;
  updateUserWithValidationAndErrorHandling(user: User): Promise<void>;
}
```

## Naming Conventions

### File Naming
```
user-profile.component.ts
user.service.ts
user.model.ts
user-role.enum.ts
```

### Variable Naming
```typescript
// Use camelCase
const userName = 'John Doe';
const userList = signal<User[]>([]);

// Boolean values use is/has/can prefix
const isAuthenticated = signal(false);
const hasPermission = signal(true);

// Constants use UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
```

## Component Structure

```typescript
@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule],
  template: `
    @if (user(); as userData) {
      <mat-card>
        <mat-card-title>{{ userData.name }}</mat-card-title>
        <mat-card-content>{{ userData.email }}</mat-card-content>
      </mat-card>
    }
  `
})
export class UserProfileComponent {
  // State management with signals
  user = signal<User | null>(null);
  
  // Dependency injection with inject()
  private userService = inject(UserService);
  
  // Computed properties
  canEdit = computed(() => this.user()?.role === 'admin');
}
```

## Template Guidelines

```html
<!-- Use new control flow syntax -->
@if (user(); as userData) {
  <div>{{ userData.name }}</div>
} @else {
  <div>Loading...</div>
}

<!-- List rendering with track -->
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

## Type Safety

```typescript
// Always define interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Use enums for fixed values
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}
```

## Best Practices

### State Management
```typescript
// Use signals for state management
export class UserState {
  private users = signal<User[]>([]);
  
  // Public readonly signals
  readonly users$ = this.users.asReadonly();
  
  // Computed properties
  readonly activeUsers = computed(() => 
    this.users().filter(user => user.isActive)
  );
}
```

### Security
```typescript
// Always validate inputs
userForm = new FormGroup({
  name: new FormControl('', [
    Validators.required,
    Validators.maxLength(50)
  ]),
  email: new FormControl('', [
    Validators.required,
    Validators.email
  ])
});

// Use Angular's built-in XSS protection
// ✅ Do this
<div [innerHTML]="sanitizedContent"></div>

// ❌ Never do this
<div [innerHTML]="userInput"></div>
```

## Code Review Checklist

- Use OnPush change detection
- Manage state with signals
- Ensure type safety (no any types)
- Implement proper error handling
- Write unit tests for critical logic
- Check for security vulnerabilities

> **Core Principle**: Create high-quality, maintainable code that follows Angular best practices.