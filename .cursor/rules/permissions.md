# Permission Management System

> This project uses **Role-Based Access Control (RBAC)** with Firebase Auth and Firestore security rules for fine-grained permission management.
> 
> Design principles: **Least privilege, separation of duties, security first, ease of management**.

## System Roles

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  DEVELOPER = 'developer',
  USER = 'user',
  GUEST = 'guest'
}

enum Permission {
  // User management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // System management
  SYSTEM_CONFIG = 'system:config',
  
  // Project management
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  
  // Code generation
  CODE_GENERATE = 'code:generate',
  
  // Knowledge management
  KNOWLEDGE_READ = 'knowledge:read',
  KNOWLEDGE_WRITE = 'knowledge:write'
}
```

## Authentication Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private userRole = signal<UserRole | null>(null);
  
  constructor(private auth: Auth, private firestore: Firestore) {
    // Listen for auth state changes
    authState(this.auth).subscribe(async (user) => {
      if (user) {
        this.currentUser.set(user);
        await this.loadUserRole(user.uid);
      } else {
        this.currentUser.set(null);
        this.userRole.set(null);
      }
    });
  }
  
  // Get user role
  getUserRole(): Signal<UserRole | null> {
    return this.userRole.asReadonly();
  }
}
```

## Permission Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private authService: AuthService) {}
  
  // Check if user has specific permission
  hasPermission(permission: Permission): boolean {
    const role = this.authService.getUserRole()();
    if (!role) return false;
    
    return rolePermissions[role].includes(permission);
  }
  
  // Check if user has any of the permissions
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }
}
```

## Route Guards

```typescript
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermissions = route.data['permissions'] as Permission[];
    
    if (!requiredPermissions?.length) {
      return true;
    }
    
    const hasPermission = this.permissionService.hasAnyPermission(requiredPermissions);
    
    if (!hasPermission) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    
    return true;
  }
}
```

## Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User document rules
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Admins can read all user data
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    // Project document rules
    match /projects/{projectId} {
      // Authenticated users can read projects
      allow read: if request.auth != null;
      
      // Developers and above can create and update projects
      allow create, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['developer', 'manager', 'admin', 'super_admin'];
    }
  }
}
```

## Template Usage

```html
<!-- Only show to users with create permission -->
<button 
  *hasPermission="Permission.USER_CREATE"
  (click)="createUser()">
  Create User
</button>

<!-- Conditionally show table column -->
<th *hasPermission="[Permission.USER_UPDATE, Permission.USER_DELETE]">Actions</th>
```

## Permission Checklist

- Define clear role hierarchy
- Design granular permission system
- Implement authentication and authorization services
- Configure Firestore security rules
- Implement frontend permission checks
- Test role permissions correctness
- Set up permission monitoring and auditing

> **Core Principle**: Ensure system security through least privilege principle and multi-layered protection.