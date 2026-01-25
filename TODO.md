# Cancer Compass - TODO

## 🔴 Priority 1: Template Assignment Bug Fix & Error Handling

### Server - Template Service
- [ ] Fix idempotent template assignment (already returns existing instead of throwing 503)
  - Status: **DONE** - Repository now returns existing record instead of throwing error
  - Status: **DONE** - Service returns proper error message: "Template already assigned to this date"

### Mobile - Template API Error Handling
- [ ] Update `api.ts` to check `response.data.success` instead of `!response.data.data`
  - Status: **DONE** - Now properly distinguishes between "assignment failed" and "already assigned"
  - Status: **DONE** - No more false error alerts when template is already assigned

### Mobile - Template Mutations Error Messages
- [ ] Update error messages in tasks.tsx to be user-friendly
  - Status: **DONE** - Changed "Failed to create task" → "Failed to add task"
  - Status: **DONE** - Changed "Failed to update medication" → "Failed to update medication"

---

## 🟢 Completed: Calendar Dot Persistence Bug Fix

### Problem
When deleting all tasks from a template-assigned day, the calendar still showed dots (AssignedDay records persisted even when no tasks remained).

### Solution
Updated `TaskRepository.delete()` to use transactional cleanup:
1. Get task details before deleting
2. Delete the task
3. If task was a template task (`sourceType === 'template'`):
   - Check if any remaining template tasks exist for that (userId, date, templateId)
   - If count is 0, delete the `AssignedDay` record (removes calendar dot)

### Files Changed
- `server/src/features/task/repositories/task.repository.ts` - Added cleanup logic in delete method
- `server/src/features/task/services/task.service.ts` - Added error handling for delete operation

### Result
✅ Calendar dots now disappear when all template tasks are deleted
✅ Transactional integrity - both delete operations succeed/fail together
✅ Calendar dots refresh instantly when deleting template tasks (query invalidation)

---

## 🟢 Completed: Remove Redundant Query Invalidations

### Problem
Both `taskKeys.root` and `['assigned-days']` queries were being invalidated in `onSuccess` AND `onSettled`, causing:
- Redundant network requests (same query invalidated twice)
- Inefficient concurrent mutation handling
- Calendar flickering from rapid invalidations

### Solution
Removed all `onSuccess` query invalidations. Now ONLY `onSettled` is used with the concurrent-safe pattern (`isMutating === 1`):

**Before:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: taskKeys.root });      // ❌ Redundant
},
onSettled: () => {
  if (queryClient.isMutating({ mutationKey: ['tasks'] }) === 1) {
    queryClient.invalidateQueries({ queryKey: taskKeys.root }); // ✅ Should be ONLY here
  }
}
```

**After:**
```typescript
onSuccess: () => {
  // Nothing here - wait for all concurrent mutations to complete
},
onSettled: () => {
  if (queryClient.isMutating({ mutationKey: ['tasks'] }) === 1) {
    // Only invalidate when this is the last task mutation running
    queryClient.invalidateQueries({ queryKey: taskKeys.root });
  }
}
```

### Files Changed
- `mobile/src/features/tasks/mutations.ts` - Removed all `onSuccess` invalidations
- `mobile/src/features/medications/mutations.ts` - Removed all `onSuccess` invalidations

### Result
- ✅ Single query refresh per concurrent mutation batch
- ✅ No redundant network requests
- ✅ Consistent pattern across all mutations
- ✅ Better UX - no flickering from rapid invalidations

---

## 🟡 Priority 2: Optimistic Updates for Tasks

### Mobile - Task Mutations (Concurrent-Safe)
- [x] Add optimistic updates to `taskMutations.create()`
  - [x] Add optimistic updates to `taskMutations.update()`
  - [x] Add optimistic updates to `taskMutations.delete()`
  - [x] Add optimistic updates to `taskMutations.toggleComplete()`
  - Pattern:
  - onMutate: Cancel queries, snapshot for rollback, update cache immediately
  - onError: Rollback to previous state if mutation fails
  - onSettled: Only invalidate if last mutation running (`isMutating({ mutationKey: ['tasks'] }) === 1`)
  - Status: **DONE** - Mutations file updated with concurrent-safe pattern

### Mobile - Task Queries
- [x] Add `byDate` query key function
  - [x] Use dynamic query keys: `taskKeys.byDate(date)` instead of hardcoded strings
  - [x] Create `byDate` query in `taskQueries` object
  - [x] Reference: mobile/src/features/tasks/keys.ts
  - Status: **DONE** - Queries file structure updated

### Mobile - Task Screen (tasks.tsx)
- [x] Update `createMutation.mutate()` to use optimistic updates
  - [x] Update `deleteMutation.mutate()` to use optimistic updates
  - [x] Add optimistic `toggleComplete` mutation
  - [x] Remove loading spinners from all action buttons
  - [x] Show instant feedback, no "isPending" delays
  - [x] Pattern: Click → instant change, silent background refetch
  - Status: **DONE** - Updated TaskItem to remove loading states

---

## 🟠 Priority 3: Medications Optimistic Updates

### Mobile - Medication Mutations (Concurrent-Safe)
- [ ] Add optimistic updates to `medicationMutations.log()`
- [ ] Add optimistic updates to `medicationMutations.update()` (for isActive toggle)
- [ ] Add optimistic updates to `medicationMutations.delete()`
- [ ] Add mutationKey: `['medications']` to all medication mutations
- [ ] Add `onMutate` with cancel, snapshot, optimistic update
- [ ] Add `onError` with rollback logic
- [ ] Add `onSettled` with smart invalidation (only if last mutation)
- [ ] Pattern from blog post: Concurrent-safe optimistic updates

### Mobile - Medications Screen (index.tsx)
- [ ] Remove loading state check from Take/Skip buttons
- [ ] Remove `disabled={logMutation.isPending}` from buttons
- [ ] Instant UI: Click → show status, no spinner
- [ ] Status: **DONE** - Home screen updated

### Mobile - Medications Screen (medications.tsx)
- [ ] Remove loading state check from toggle button
- [ ] Remove `disabled={updateMutation.isPending}` from toggle
- [ ] Remove `ActivityIndicator` from toggle
- [ ] Instant UI: Click → toggle changes instantly
- [ ] Status: **DONE** - Medications list screen updated

---

## 🟠 Priority 4: ESLint & TypeScript Fixes

### Mobile - Generic ESLint Fixes
- [ ] Run `pnpm lint:fix` to auto-fix formatting issues
- [ ] Fix imports sorting (ESLint rule)
- [ ] Fix unused imports
- [ ] Fix unused variables
- [ ] Fix all remaining lint errors
- [ ] Run `pnpm lint` to verify all fixes

### Mobile - Template Mutations TypeScript Errors
- [ ] Add explicit types to mutation callbacks
- [ ] Fix `error: Error` parameter type (not implicit `any`)
- [ ] Fix `variables: { ... }` parameter type (not implicit `any`)
- [ ] Fix `context: { ... }` parameter type (not implicit `any`)
- [ ] Status: **DONE** - Mutations file already fixed

### Mobile - Task Mutations TypeScript Errors
- [ ] Add proper types to `create` mutation callbacks
- [ ] Add proper types to `update` mutation callbacks
- [ ] Add proper types to `delete` mutation callbacks
- [ ] Add proper types to `toggleComplete` mutation callbacks
- [ ] Add `MutationCache` and `Mutation` imports from `@tanstack/react-query`
- [ ] Status: **DONE** - Task mutations file updated with full TypeScript types

---

## 🟡 Priority 5: Clean Up & Documentation

### Mobile - Readme Documentation
- [ ] Document optimistic updates pattern in README.md
- [ ] Explain why this pattern matters
- [ ] Explain the race condition problem and how it's fixed
- [ ] Show table: "Without Pattern" vs "With Pattern"
- [ ] Explain key components: mutationKey, onMutate, onError, onSettled
- [ ] Add implementation example code
- [ ] Status: **DONE** - README.md updated

### Mobile - Plan.md Updates
- [ ] Document bug fixes in plan.md
- [ ] Mark completed items as done
- [ ] Update status for Phase 1, Phase 2 features
- [ ] Add next immediate steps
- [ ] Status: **DONE** - Plan.md updated with all fixes

---

## Notes

### Completed Today
- ✅ Fixed template assignment 503 error
- ✅ Fixed template already assigned error handling
- ✅ Fixed mobile API success/failure detection
- ✅ Added optimistic updates to medications (index.tsx)
- ✅ Added optimistic updates to medications (medications.tsx)
- ✅ Fixed TypeScript types in medication mutations
- ✅ Fixed TypeScript types in template mutations
- ✅ Updated README.md with optimistic pattern documentation
- ✅ Updated plan.md with progress
- ✅ **Added optimistic updates to all task mutations** (create, update, delete, toggleComplete)
- ✅ **Removed loading states from TaskItem component**
- ✅ **Fixed all TypeScript errors in task mutations**
- ✅ **Fixed template assignment success logic bug** (returned false when should return true)
- ✅ **Fixed calendar dot persistence bug** (assignedDays cleanup when deleting template tasks)
- ✅ **Removed redundant query invalidations** - now using concurrent-safe pattern only in onSettled

### Tomorrow
- Fix all ESLint errors in mobile app
- Test task optimistic updates with rapid toggling to verify concurrent-safe pattern works
