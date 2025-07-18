# Memory Server

> **Memory Server** manages runtime cache, context state, and real-time collaboration data with millisecond-level access.

## Core Functions

### 1. Entity Management

```typescript
// Create entities
mcp_memory_create_entities({
  entities: [
    {
      name: "UserProfileComponent",
      entityType: "Angular Component",
      observations: [
        "Uses Angular signals for state management",
        "Implements OnPush change detection",
        "Features responsive form validation"
      ]
    }
  ]
});

// Create entity relationships
mcp_memory_create_relations({
  relations: [
    {
      from: "UserProfileComponent",
      to: "AuthService",
      relationType: "depends on"
    }
  ]
});
```

### 2. Knowledge Graph Query

```typescript
// Search nodes
mcp_memory_search_nodes({
  query: "Angular signals state management"
});

// Open specific nodes
mcp_memory_open_nodes({
  names: ["UserProfileComponent", "AuthService"]
});

// Read complete graph
mcp_memory_read_graph();
```

### 3. Observation Management

```typescript
// Add observations
mcp_memory_add_observations({
  observations: [
    {
      entityName: "UserProfileComponent",
      contents: [
        "Added form validation logic",
        "Integrated Angular Material components"
      ]
    }
  ]
});
```

## Entity Types

```typescript
// Entity types
const entityTypes = {
  // Angular related
  "Angular Component": "Component",
  "Angular Service": "Service",
  "Angular Pipe": "Pipe",
  
  // Technical concepts
  "Design Pattern": "Pattern",
  "Best Practice": "Best Practice",
  
  // Project structure
  "Feature": "Feature",
  "Configuration": "Config"
};
```

## Relationship Types

```typescript
// Relationship types
const relationTypes = {
  "depends on": "Dependency",
  "uses": "Usage",
  "implements": "Implementation",
  "contains": "Composition"
};
```

## Usage Examples

### Code Generation Workflow

```typescript
const codeGenerationWorkflow = async () => {
  // 1. Create component entity
  await mcp_memory_create_entities({
    entities: [
      {
        name: "UserListComponent",
        entityType: "Angular Component",
        observations: ["Displays user list", "Supports pagination"]
      }
    ]
  });
  
  // 2. Establish dependencies
  await mcp_memory_create_relations({
    relations: [
      {
        from: "UserListComponent",
        to: "UserService",
        relationType: "depends on"
      }
    ]
  });
  
  // 3. Query related knowledge
  const relatedKnowledge = await mcp_memory_search_nodes({
    query: "Angular Material table best practices"
  });
};
```

## Usage Checklist

- Use clear entity names
- Choose appropriate entity types
- Provide detailed observations
- Establish correct relationships
- Use specific query keywords
- Clean up unused knowledge

> **Core Principle**: Provide real-time, accurate knowledge caching to support efficient AI collaboration.