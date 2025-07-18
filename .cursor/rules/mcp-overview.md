# MCP Collaboration Hub

> This document defines the collaboration architecture between MCP servers, following minimalist principles: clear layering, defined responsibilities, and efficient collaboration.

## Architecture Overview

```
Knowledge Layer: context7-server (semantic knowledge retrieval)
Cache Layer: memory-server (runtime cache), redis-mcp-server (persistent cache)
Resource Layer: filesystem-server (file system management)
Build Layer: angular-cli-server (Angular project building)
```

## Core Collaboration Principles

### Knowledge Query Priority
```
context7 (authoritative) → redis (project cache) → memory (temporary) → filesystem (file resources)
```

### Code Generation Flow
```
context7 query best practices → redis get project standards → 
memory manage generation state → filesystem read/write files → angular-cli validate build
```

### Data Consistency
- **memory-server**: Temporary state, session level
- **redis-mcp-server**: Persistent configuration, project level
- **filesystem-server**: Source code state, version control level

## Server Roles

### context7-server
- **Role**: Authoritative knowledge query and semantic retrieval
- **Functions**: Official documentation, API specifications, best practices
- **Data Flow**: context7 → redis (cache results) → memory (temporary storage)

### memory-server
- **Role**: High-speed temporary state management
- **Functions**: Session state, generation context, user preferences
- **Data Flow**: Receives temporary data from all servers, provides fast read/write

### redis-mcp-server
- **Role**: Project configuration and rule storage
- **Functions**: Team standards, code templates, permission settings
- **Data Flow**: redis ↔ filesystem (sync config) ↔ memory (cache hot data)

### filesystem-server
- **Role**: Source code and resource authority
- **Functions**: Read/write project files, manage directory structure
- **Data Flow**: Final output destination for all servers

### angular-cli-server
- **Role**: Angular project building and immediate feedback
- **Functions**: CLI command execution, hot updates, build validation
- **Data Flow**: Reads from filesystem, provides build results to memory/redis

## Best Practices Checklist

### Before Code Generation
- Query context7 for latest best practices
- Load project-specific standards from redis
- Check existing code structure in filesystem
- Initialize generation context in memory

### During Code Generation
- Use memory to manage generation state
- Follow team standards in redis
- Perform file operations through filesystem
- Update progress in memory in real-time

### After Code Generation
- Validate generated code with angular-cli
- Run tests to ensure code quality
- Update project state in redis
- Clean up temporary data in memory

> **Core Philosophy**: Simple architecture, clear responsibilities, efficient collaboration.