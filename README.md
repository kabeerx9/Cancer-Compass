# Cancer Compass 🧭

A comprehensive cancer treatment companion app to help manage medications, appointments, documents, and daily tasks throughout treatment cycles.

## Project Structure

```
Cancer_Compass/
├── mobile/          # Expo React Native app
├── web/             # Vite React dashboard
├── server/          # Node.js backend with Prisma
├── packages/
│   └── types/       # Shared TypeScript types
├── plan.md          # Development roadmap
└── features.md      # Feature specifications
```

## Tech Stack

| App | Stack |
|-----|-------|
| Mobile | Expo, React Native, TypeScript |
| Web | Vite, React, TypeScript |
| Server | Node.js, Express, Prisma, PostgreSQL |

## Shared Types

All apps share types from `packages/types` using TypeScript path aliases:

```typescript
import { User, Medication, ApiResponse } from '@cancer-compass/types';
```

### Available Types

**Entities:**
- `User`, `Role`
- `Medication`
- `DayTemplate`, `TemplateTask`, `AssignedDay`, `DailyTask`
- `Document`, `DocumentCategory`
- `PatientInfo`, `Contact`
- `TreatmentCycle`, `CycleStatus`

**API Types:**
- `ApiResponse<T>`, `PaginatedResponse<T>`
- Request/response types for all endpoints

## Getting Started

Each app runs independently:

```bash
# Mobile
cd mobile && pnpm install && pnpm start

# Web
cd web && pnpm install && pnpm dev

# Server
cd server && pnpm install && pnpm dev
```

## Development Notes

- Types are shared via path aliases (not npm packages) to avoid Turborepo/pnpm hoisting issues
- Each app has its own dependencies and lock file
- No monorepo tooling required - just run each app in separate terminals
