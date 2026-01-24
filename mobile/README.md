<h1 align="center">
  <img alt="logo" src="./assets/icon.png" width="124px" style="border-radius:10px"/><br/>
Mobile App </h1>

> This Project is based on [Obytes starter](https://starter.obytes.com)

## Requirements

- [React Native dev environment ](https://reactnative.dev/docs/environment-setup)
- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS or Linux users
- [Pnpm](https://pnpm.io/installation)
- [Cursor](https://www.cursor.com/) or [VS Code Editor](https://code.visualstudio.com/download) ⚠️ Make sure to install all recommended extension from `.vscode/extensions.json`

## 👋 Quick start

Clone the repo to your machine and install deps :

```sh
git clone https://github.com/user/repo-name

cd ./repo-name

pnpm install
```

To run the app on ios

```sh
pnpm ios
```

To run the app on Android

```sh
pnpm android
```

## ✍️ Documentation

- [Rules and Conventions](https://starter.obytes.com/getting-started/rules-and-conventions/)
- [Project structure](https://starter.obytes.com/getting-started/project-structure)
- [Environment vars and config](https://starter.obytes.com/getting-started/environment-vars-config)
- [UI and Theming](https://starter.obytes.com/ui-and-theme/ui-theming)
- [Components](https://starter.obytes.com/ui-and-theme/components)
- [Forms](https://starter.obytes.com/ui-and-theme/Forms)
- [Data fetching](https://starter.obytes.com/guides/data-fetching)
- [Contribute to starter](https://starter.obytes.com/how-to-contribute/)

## 🚀 Optimistic Updates Pattern

This app uses an advanced concurrent-safe optimistic updates pattern for smooth, instant user interactions. This is critical for medication and task actions where users expect immediate feedback.

### Why This Pattern?

Standard invalidation causes jarring UX:
- User clicks "Take" → loading spinner → full list refresh → show new state
- Fast clicks cause flickering and state inconsistencies
- Network delays make app feel sluggish

### The Solution: Concurrent-Safe Optimistic Updates

Our pattern handles:
1. **Instant UI updates** - Optimistic cache updates before API call
2. **Error rollback** - Revert to previous state if mutation fails
3. **Concurrent mutations** - Multiple clicks don't overwrite each other
4. **Query cancellation** - Prevents race conditions with in-flight queries
5. **Smart invalidation** - Only refetch after last mutation settles (prevents flicker)

### Key Components

**mutationKey**: Groups related mutations for tracking concurrent mutations
```typescript
useMutation({
  mutationKey: ['medications'], // Track all medication mutations together
  ...
})
```

**onMutate**: Update cache immediately, cancel queries, snapshot for rollback
```typescript
onMutate: async ({ id, status }) => {
  // Cancel any in-flight queries to prevent race conditions
  await queryClient.cancelQueries({ queryKey: medicationKeys.today() });

  // Snapshot current state for rollback on error
  const previousMeds = queryClient.getQueryData(medicationKeys.today());

  // Optimistically update cache
  queryClient.setQueryData(
    medicationKeys.today(),
    (old = []) => old.map(med => med.id === id ? { ...med, todayStatus: status } : med)
  );

  return { previousMeds };
}
```

**onError**: Rollback on API failure
```typescript
onError: (error, variables, context) => {
  if (context?.previousMeds) {
    queryClient.setQueryData(medicationKeys.today(), context.previousMeds);
  }
}
```

**onSettled**: Smart invalidation (only when last mutation finishes)
```typescript
onSettled: () => {
  // ONLY invalidate if this is the last medication mutation running
  // This prevents flicker when user clicks multiple items quickly
  if (queryClient.isMutating({ mutationKey: ['medications'] }) === 1) {
    queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
  }
}
```

### Why This Matters: The Race Condition Problem

Without smart invalidation, here's what happens with quick clicks:

**Problem Scenario:**
1. User clicks "Take" on Med A → Mutation A starts
2. User immediately clicks "Take" on Med B → Mutation B starts
3. Mutation A finishes → Invalidates → Refetch → **Overwrites Med B's optimistic update**
4. Result: Med B flickers back to old state, then updates again

**With Our Pattern:**
1. User clicks "Take" on Med A → Mutation A starts
2. User immediately clicks "Take" on Med B → Mutation B starts
3. Mutation A finishes → Checks `isMutating()` → Sees Mutation B running → **Skips invalidation**
4. Mutation B finishes → Checks `isMutating()` → Only one left → **Does one invalidation**
5. Result: Both updates show instantly, no flicker, one clean refetch

### What This Fixes

| Scenario | Without Pattern | With Pattern |
|----------|----------------|--------------|
| Single click | Loading delay, full refresh | Instant update ✅ |
| Quick clicks on multiple items | Flickering, wrong state | Smooth, correct state ✅ |
| Rapid double-click on same item | Back-and-forth toggle | Final state wins ✅ |
| Network error | Shows wrong state until refresh | Automatic rollback ✅ |
| Window focus during mutation | Optimistic update gets overwritten | Query cancellation prevents this ✅ |

### Implementation

See `src/features/medications/mutations.ts` for production-ready optimistic mutations. Apply this pattern to any user action for instant, reliable feedback.

**Critical:** Always use `mutationKey` and check `isMutating()` in `onSettled` to prevent concurrent mutation issues.
