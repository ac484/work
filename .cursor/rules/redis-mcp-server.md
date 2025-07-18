# Redis MCP Server

> **Redis MCP Server** provides persistent caching for long-term knowledge storage, project standards management, and team collaboration data.

## Core Functions

### 1. Basic Data Operations

```typescript
// String operations
mcp_redis_mcp_set({
  key: "project:config:angular_version",
  value: "20.0.0",
  expiration: 86400  // 24 hours
});

mcp_redis_mcp_get({
  key: "project:config:angular_version"
});

// Hash operations
mcp_redis_mcp_hset({
  name: "user:profile:123",
  key: "name",
  value: "John Doe"
});

mcp_redis_mcp_hgetall({
  name: "user:profile:123"
});

// List operations
mcp_redis_mcp_lpush({
  name: "project:recent_commits",
  value: "feat: add user management"
});
```

### 2. JSON Data Operations

```typescript
// Store JSON data
mcp_redis_mcp_json_set({
  name: "project:config:angular",
  path: "$",
  value: {
    version: "20.0.0",
    features: ["signals", "control-flow", "standalone"],
    dependencies: {
      "@angular/core": "^20.0.0",
      "@angular/material": "^20.0.0"
    }
  }
});

// Query JSON data
mcp_redis_mcp_json_get({
  name: "project:config:angular",
  path: "$.features"
});
```

### 3. Vector Search

```typescript
// Create vector index
mcp_redis_mcp_create_vector_index_hash({
  index_name: "code_embeddings",
  prefix: "embedding:",
  vector_field: "vector",
  dim: 1536,
  distance_metric: "COSINE"
});

// Store vector
mcp_redis_mcp_set_vector_in_hash({
  name: "embedding:user_component",
  vector: [0.1, 0.2, 0.3, ...],  // 1536-dimensional vector
  vector_field: "vector"
});
```

## Data Structures

### Project Configuration

```typescript
// Project configuration
interface ProjectConfig {
  name: string;
  version: string;
  framework: {
    angular: string;
    material: string;
    typescript: string;
  };
  conventions: {
    naming: string;
    structure: string;
    testing: string;
  };
  dependencies: Record<string, string>;
}
```

### Knowledge Entity

```typescript
// Knowledge entity
interface KnowledgeEntity {
  id: string;
  type: "component" | "service" | "pattern" | "best_practice";
  title: string;
  description: string;
  content: string;
  tags: string[];
  created: number;
  updated: number;
}
```

## Usage Examples

### Project Configuration Management

```typescript
const projectConfigManagement = async () => {
  // 1. Store project configuration
  await mcp_redis_mcp_json_set({
    name: "project:config",
    path: "$",
    value: {
      name: "angular-admin",
      version: "1.0.0",
      framework: "Angular",
      conventions: {
        naming: "kebab-case",
        structure: "feature-based"
      }
    }
  });
  
  // 2. Query configuration
  const config = await mcp_redis_mcp_json_get({
    name: "project:config",
    path: "$.framework"
  });
};
```

### Knowledge Base Management

```typescript
const knowledgeBaseManagement = async () => {
  // 1. Store knowledge entity
  await mcp_redis_mcp_hset({
    name: "knowledge:user-component",
    key: "title",
    value: "User Component Best Practices"
  });
  
  // 2. Query knowledge
  const knowledge = await mcp_redis_mcp_hgetall({
    name: "knowledge:user-component"
  });
};
```

## Usage Checklist

- Use appropriate data structures
- Set reasonable expiration times
- Follow naming conventions
- Monitor memory usage
- Optimize query performance
- Handle concurrent access
- Back up important data

> **Core Principle**: Provide reliable, efficient persistent storage to support long-term knowledge accumulation and team collaboration.