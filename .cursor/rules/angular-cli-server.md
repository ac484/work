# Angular CLI Server

> **Angular CLI Server** is an MCP tool that provides Angular project scaffolding, building, and testing capabilities through a simple interface.

## Core Functions

### 1. Component Generation

```typescript
// Generate Angular component
mcp_angular_cli_ng_generate({
  appRoot: ".",  // Current project root
  schematic: "component",
  name: "user-profile",
  path: "src/app/features/user",
  options: {
    standalone: true,
    changeDetection: "OnPush",
    style: "scss"
  }
});

// Generate service
mcp_angular_cli_ng_generate({
  appRoot: ".",
  schematic: "service",
  name: "user-data",
  path: "src/app/core/services",
  options: {
    providedIn: "root"
  }
});
```

### 2. Package Management

```typescript
// Add Angular Material
mcp_angular_cli_ng_add({
  appRoot: ".",
  package: "@angular/material",
  options: {
    theme: "indigo-pink",
    typography: true,
    animations: true
  }
});
```

### 3. Build & Run

```typescript
// Development build
mcp_angular_cli_ng_run({
  appRoot: ".",
  target: "build",
  options: {
    configuration: "development",
    watch: true
  }
});

// Production build
mcp_angular_cli_ng_run({
  appRoot: ".",
  target: "build",
  options: {
    configuration: "production"
  }
});

// Run tests
mcp_angular_cli_ng_run({
  appRoot: ".",
  target: "test",
  options: {
    watch: false
  }
});
```

### 4. Project Updates

```typescript
// Update Angular packages
mcp_angular_cli_ng_update({
  appRoot: ".",
  packages: ["@angular/core", "@angular/cli"]
});
```

## Best Practices

### Component Generation

```typescript
// Component defaults
const componentDefaults = {
  standalone: true,
  changeDetection: "OnPush",
  style: "scss",
  skipTests: false
};

// Service defaults
const serviceDefaults = {
  providedIn: "root"
};
```

### Common Issues & Solutions

```typescript
// Memory issues during build
// Solution: Increase Node.js memory limit
// node --max-old-space-size=8192 node_modules/@angular/cli/bin/ng build
```

## Usage Checklist

- Ensure project root contains angular.json
- Verify target paths exist
- Run tests after generation
- Check build output for errors

> **Core Principle**: Generate, build, and test in one workflow to ensure code quality.