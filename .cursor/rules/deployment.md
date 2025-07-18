# Deployment Guide

> This project uses Firebase for frontend deployment with a staged approach: **Local Development → Testing Environment → Production**.

## Deployment Workflow

```
Local Development → Code Commit → Automated Tests → 
Test Environment Deployment → Validation → Production Deployment → Monitoring
```

## Environment Setup

```bash
# Required tools
node --version        # Node.js >= 18.0.0
ng version            # Angular CLI
firebase --version    # Firebase CLI

# Environment variables
# .env.development, .env.staging, .env.production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
```

## Deployment Steps

### 1. Local Development
```bash
npm install
ng serve
firebase emulators:start --only firestore
```

### 2. Test Environment
```bash
ng build --configuration=staging
npm run test
firebase use staging
firebase deploy --only hosting
```

### 3. Production Environment
```bash
ng build --configuration=production
npm run test:full
firebase use production
firebase deploy
```

## Key Commands

```bash
# Angular build commands
ng build                                  # Development build
ng build --configuration=production       # Production build
ng build --stats-json                     # Analyze build output

# Firebase commands
firebase deploy                           # Full deployment
firebase deploy --only hosting            # Deploy frontend only
firebase deploy --only firestore:rules    # Deploy Firestore rules
```

## Verification Checklist

- Application loads correctly
- Routes work properly
- Firebase services connect successfully
- Authentication works
- Page load time < 3 seconds
- No JavaScript errors in console

## Common Issues & Solutions

```bash
# TypeScript compilation errors
ng build --verbose

# Memory issues
node --max-old-space-size=8192 node_modules/@angular/cli/bin/ng build

# Dependency conflicts
npm ci
```

## CI/CD Integration

```yaml
# GitHub Actions example
name: Deploy to Firebase
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
    - name: Install dependencies
      run: npm ci
    - name: Build application
      run: ng build --configuration=production
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
```

> **Core Principle**: Automate deployment processes with strict validation to ensure safe, reliable, and reversible deployments.