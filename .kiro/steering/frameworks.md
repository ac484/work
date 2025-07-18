# Frameworks Guide

> This project uses **Angular with Angular Material** to create efficient enterprise applications, following modern development principles.

## Core Frameworks

### Angular
- **Key Features**: Signals for state management, new control flow (@if/@for), Zoneless change detection, standalone components
- **Advantages**: Performance improvements, better developer experience, enterprise support

### Angular Material
- **Key Features**: Material Design, responsive layouts, accessibility support, theming system
- **Advantages**: Official Google support, design consistency, rich component library

### TypeScript
- **Key Features**: Strict type checking, decorators, generics, ES2022 support
- **Advantages**: Compile-time error checking, better IDE support, safer refactoring

## Package Management

```json
{
  "dependencies": {
    "@angular/core": "^20.0.0",
    "@angular/material": "^20.0.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@angular/cli": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

## Configuration Best Practices

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### ESLint Rules
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@angular-eslint/prefer-on-push-component-change-detection": "error"
  }
}
```

## Development Workflow

```bash
# Create new project
ng new my-app --routing --style=scss --standalone

# Add Angular Material
ng add @angular/material

# Generate component
ng generate component user-profile --standalone --change-detection=OnPush

# Build for production
ng build --configuration=production
```

## Performance Optimization

- Use OnPush change detection
- Manage state with signals
- Implement lazy loading for routes
- Use pure pipes for calculations
- Track items in loops with @for

## Testing Strategy

```typescript
// Component test example
describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Framework Usage Checklist

- Use signals for state management
- Use new control flow syntax (@if/@for)
- Enable strict TypeScript mode
- Implement lazy loading
- Follow Angular Material design patterns

> **Core Principle**: Use modern Angular features and best practices to create high-quality, maintainable applications.