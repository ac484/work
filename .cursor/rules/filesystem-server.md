# Filesystem Server

> **Filesystem Server** provides secure file system operations for source code files, project resources, and directory management.

## Core Functions

### 1. File Reading

```typescript
// Read a single file
mcp_filesystem_read_file({
  path: "src/app/core/services/auth.service.ts"
});

// Read multiple files
mcp_filesystem_read_multiple_files({
  paths: [
    "src/app/shared/models/user.model.ts",
    "src/app/features/user/user.component.ts"
  ]
});

// Read first 20 lines of a file
mcp_filesystem_read_file({
  path: "src/app/app.component.ts",
  head: 20
});
```

### 2. File Writing & Editing

```typescript
// Create a new file
mcp_filesystem_write_file({
  path: "src/app/shared/models/product.model.ts",
  content: `export interface Product {
  id: string;
  name: string;
  price: number;
}`
});

// Edit an existing file
mcp_filesystem_edit_file({
  path: "src/app/shared/models/user.model.ts",
  edits: [
    {
      oldText: "export interface User {\n  id: string;\n  name: string;\n}",
      newText: "export interface User {\n  id: string;\n  name: string;\n  email: string;\n}"
    }
  ]
});
```

### 3. Directory Management

```typescript
// Create directory
mcp_filesystem_create_directory({
  path: "src/app/features/reports"
});

// List directory contents
mcp_filesystem_list_directory({
  path: "src/app/features"
});

// Get directory tree structure
mcp_filesystem_directory_tree({
  path: "src/app/shared"
});
```

### 4. File Search & Info

```typescript
// Search files
mcp_filesystem_search_files({
  path: "src/app",
  pattern: "*.component.ts",
  excludePatterns: ["*.spec.ts"]
});

// Get file info
mcp_filesystem_get_file_info({
  path: "src/app/app.component.ts"
});
```

## Project Structure

### Angular Project Structure
```
src/app/
├── core/           # Services, guards, interceptors
├── shared/         # Shared components, directives, pipes
├── features/       # Feature modules
├── layout/         # Layout components
└── routes/         # Routing modules
```

### File Naming Conventions
```
user-profile.component.ts
user.service.ts
user.model.ts
user-role.enum.ts
```

## Usage Examples

### Component Generation
```typescript
// Generate a new Angular component
const generateComponent = async () => {
  // 1. Create directory
  await mcp_filesystem_create_directory({
    path: "src/app/features/user-profile"
  });
  
  // 2. Create component file
  await mcp_filesystem_write_file({
    path: "src/app/features/user-profile/user-profile.component.ts",
    content: componentTemplate
  });
  
  // 3. Create template and styles
  await mcp_filesystem_write_file({
    path: "src/app/features/user-profile/user-profile.component.html",
    content: htmlTemplate
  });
};
```

## Usage Checklist

- Ensure paths are within allowed directories
- Verify file/directory existence before operations
- Back up important files before modifications
- Follow project structure conventions
- Use standard naming conventions

> **Core Principle**: Ensure file operations are safe, controlled, and maintain project structure consistency.