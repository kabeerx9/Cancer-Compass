# @cancer-compass/types

Shared TypeScript types for Cancer Compass - used by mobile, web, and server apps.

## Usage

```typescript
import { User, Medication, ApiResponse } from '@cancer-compass/types';

// Type an API response
const response: ApiResponse<Medication[]> = await fetchMedications();

// Use entity types
const user: User = {
  id: '123',
  email: 'patient@example.com',
  firstName: 'John',
  lastName: 'Doe',
  // ...
};
```

## Structure

```
src/
├── index.ts       # Main export (re-exports all)
├── entities.ts    # Database entity types
└── api.ts         # API request/response types
```

## Adding New Types

1. Add types to appropriate file (`entities.ts` or `api.ts`)
2. Export from `index.ts` if in a new file
3. Types are immediately available in all apps (no install needed)

## How It Works

- Uses TypeScript path aliases (not npm package resolution)
- Each app's `tsconfig.json` has a path mapping to this folder
- Mobile's `metro.config.js` watches this folder for changes
