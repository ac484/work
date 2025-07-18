# Context7 Server

> **Context7** is a knowledge hub that provides authoritative documentation and semantic search capabilities for technical information.

## Core Functions

### 1. Library Resolution

```typescript
// Resolve library ID
mcp_context7_resolve_library_id({
  libraryName: "Angular"
});
// Returns: /angular/angular or /angular/angular/v20
```

### 2. Documentation Query

```typescript
// Get official documentation
mcp_context7_get_library_docs({
  context7CompatibleLibraryID: "/angular/angular/v20",
  topic: "signals",
  tokens: 10000
});
```

### 3. Supported Libraries

- **Angular**: `/angular/angular`
- **Angular Material**: `/angular/material`
- **RxJS**: `/reactivex/rxjs`
- **TypeScript**: `/microsoft/typescript`

## Query Best Practices

### Effective Queries

```typescript
// ✅ Good queries
"Angular signals state management best practices"
"Angular Material table optimization"
"Angular control flow syntax examples"

// ❌ Avoid
"Angular"  // Too general
"How to code"  // Not specific
"Fix bug"  // Lacks context
```

### Topic Focus

```typescript
// Use topic parameter to focus query
mcp_context7_get_library_docs({
  context7CompatibleLibraryID: "/angular/angular/v20",
  topic: "signals",  // Focus on signals
  tokens: 5000
});
```

### Token Management

```typescript
// Adjust token count based on needs
const tokenStrategy = {
  quickReference: 2000,    // Quick reference
  detailedGuide: 10000,    // Detailed guide
  comprehensiveDoc: 20000  // Comprehensive documentation
};
```

## Usage Guide

### What is Context7?

Context7 is an AI-driven knowledge query system that provides real-time access to official documentation, APIs, and best practices. It supports semantic search to help find relevant information quickly.

### Main Uses

- Query official APIs (signals, control flow, etc.)
- Search for best practices and anti-patterns
- Support code generation and technical design

### Query Examples

- "Angular signals state management best practices"
- "Angular control flow with track usage examples"
- "Angular Material responsive design breakpoints"

> **Core Principle**: For any technical question, first seek authoritative answers through Context7.