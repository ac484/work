# Project Architecture

> This project uses Angular with Firebase services, following minimalist design principles: clear layering, separation of concerns, and efficient collaboration.

## Module Structure

```
src/app/
├── core/           # Core services, guards, interceptors
├── shared/         # Shared components, pipes, directives
├── features/       # Feature modules (user, product, etc.)
├── layout/         # Layout components (header, sidebar, footer)
└── routes/         # Routing configuration and page components
```

## Design Principles

### Minimalism

- **Single Responsibility**: Each module handles one core function
- **Minimal Dependencies**: Avoid unnecessary packages and complexity
- **Clear Interfaces**: Modules communicate through well-defined APIs

### Layered Architecture

- **Presentation Layer**: Angular UI components
- **Data Layer**: Firebase services for data persistence and authentication
- **Service Layer**: Business logic and application services

## Technology Stack

### Frontend

- **Angular**: Main framework with signals and modern control flow
- **Angular Material**: UI component library
- **TypeScript**: Strict mode, no any types

### Backend

- **Firestore**: NoSQL database
- **Firebase Auth**: Authentication service

### Development Tools

- **ESLint + Prettier**: Code quality control
- **Karma + Jasmine**: Unit testing framework

> **Core Principle**: Create maintainable, modular code that follows established patterns and best practices.