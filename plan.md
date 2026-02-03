# Cancer Compass - UI/UX Issues & Improvements

A comprehensive list of UI/UX issues identified in the app, prioritized by severity.

---

## 🔴 CRITICAL (Fix Immediately)

### 1. Non-functional Settings Screen
**File:** `mobile/src/app/(app)/settings.tsx`
**Lines:** 64-89
**Issue:** All menu items have empty `onPress={() => {}}` - users tap expecting action but nothing happens
**Status:** [ ]
**Priority:** Critical
**Labels:** bug, settings, accessibility

### 2. Important Features Hidden Deep
**File:** `mobile/src/app/(app)/profile.tsx`
**Issue:** Templates, Calendar, Patient Info are buried in Profile menu - users might never discover them
**Status:** [x] COMPLETED
**Priority:** Critical
**Labels:** navigation, discoverability, ux

**Changes Made:**
1. **Templates** → Added "Templates" button (gear icon) in Plan screen header (tasks.tsx)
2. **Patient Info** → Added prominent indigo gradient card in Home screen (index.tsx)
3. **Calendar** → Added labeled "Calendar" button next to date navigator in Plan screen (tasks.tsx)

**Result:** All three features now have quick access from their relevant screens, no longer buried in Profile menu.

### 3. Inconsistent Color Schemes
**Issue:**
- Home/Insights use teal (#14B8A6)
- Tasks uses blue (#2563EB)
- Settings uses random colors per item
**Status:** [x] COMPLETED
**Priority:** Critical
**Labels:** design-system, consistency, colors

**Changes Made:**
1. **tasks.tsx** - Changed all `primary-50`, `primary-600`, `#2563EB` to `teal-50`, `teal-600`, `#14B8A6`
2. **TaskItem.tsx** - Changed template badge colors from blue to teal
3. **manage-templates.tsx** - Changed all blue colors to teal
4. **ApplyTemplateModal.tsx** - Changed all blue colors to teal
5. **MedicationDetailModal.tsx** - Changed its own blue theme to teal

**Result:** All screens now use teal (#14B8A6) as the primary color, providing consistent visual identity across the app.

### 4. Small Touch Targets
**Files:** `tasks.tsx`, `cabinet.tsx`, `index.tsx`, `sos-medicines.tsx`
**Issue:** Many buttons below 44x44px recommended minimum (date arrows 22-24px, calendar icons 22px, toggle buttons 8px padding, edit/delete icons 8px padding)
**Status:** [x] COMPLETED
**Priority:** Critical
**Labels:** accessibility, touch-target, mobile

**Changes Made:**
1. **tasks.tsx** - Increased date navigator padding from `p-2` (8px) to `p-3` (12px) for prev/next arrows
2. **tasks.tsx** - Increased "Log Today's Symptoms" and "Calendar" button padding from `py-2` to `py-3` for better touch targets
3. **cabinet.tsx** - Increased toggle button padding from 8px to 12px for medication active/inactive switch
4. **index.tsx** - Increased skip/take buttons from 36x36px to 44x44px (minimum accessible size)
5. **sos-medicines.tsx** - Increased edit/delete icon buttons padding from 8px to 12px for better touch targets

**Result:** All critical touch targets now meet or exceed the 44x44px minimum for better accessibility and usability on mobile.

---

## 🟠 HIGH PRIORITY

### 5. No Keyboard Handling in Modals
**Files:** `cabinet.tsx`, `sos-medicines.tsx`, `tasks.tsx`, `insights.tsx`
**Issue:** Modals don't use KeyboardAvoidingView - keyboard covers form fields
**Status:** [ ]
**Priority:** High
**Labels:** bug, accessibility, forms, keyboard

### 6. Missing Feedback on Actions
**Issue:** No success toast/feedback when:
- Medication is logged
- SOS medicine is taken
- Task is completed
- Any mutation completes
**Status:** [x] COMPLETED
**Priority:** High
**Labels:** ux, feedback, usability

**Changes Made:**
Added `react-native-toast-message` to all mutation handlers across the app:
1. **Home (index.tsx)** - Toast when medication is taken/skipped
2. **Tasks (tasks.tsx)** - Toast for create/edit/delete/complete tasks and template assignments
3. **Cabinet (cabinet.tsx)** - Toast for add/edit/delete/toggle medications
4. **SOS Medicines (sos-medicines.tsx)** - Toast for add/edit/delete/log SOS medicines
5. **Manage Templates (manage-templates.tsx)** - Toast for create/delete templates

**Toast Types Used:**
- `success` - For successful completions (medication taken, task added, etc.)
- `info` - For neutral actions (medication skipped, deleted)
- `error` - For failed operations

**Position:** All toasts appear at the bottom of the screen

### 7. Confusing Toggle Design
**File:** `cabinet.tsx`
**Issue:** Medication toggle is custom-built, not native Switch - no label indicating what "on/off" means
**Status:** [x] COMPLETED
**Priority:** High
**Labels:** ux, clarity, components

**Changes Made:**
1. Added text label "Active" or "Paused" next to the toggle on each medication card
2. Label is teal color when Active, muted gray when Paused
3. Label appears to the left of the sliding toggle in a horizontal row layout
4. Combined with the existing toast notifications, users now get both immediate visual feedback and confirmation messages

**Result:** Users can now clearly understand what the toggle state means without confusion. The toggle clearly shows "Active" when the medication is being tracked and "Paused" when it's temporarily disabled.

### 8. Poor Empty States
**Issue:** Some empty states lack clear CTAs, stats cards disappear when empty causing layout shift
**Status:** [x] COMPLETED
**Priority:** High
**Labels:** ux, empty-states, layout

**Changes Made:**

**Layout Shift Fixes:**
1. **Home (index.tsx)** - Progress card now always visible, shows "0 of 0" and "0%" when no medications
2. **Cabinet (cabinet.tsx)** - Stats card now always visible, shows "0 Active / 0 Total" when empty

**CTA Button Additions:**
1. **Home (index.tsx)** - Empty state now has "Add Medication" button that navigates to cabinet
2. **Manage Templates (manage-templates.tsx)** - Empty state now has "Create Template" button
3. **Calendar (calendar.tsx)** - "No templates created yet" empty state now has "Create Template" button that navigates to manage-templates

**Empty State Text Improvements:**
1. **Home (index.tsx)** - Changed from "All caught up!" (confusing) to "No medications yet" (clear) with subtitle "Add your medications to start tracking them"

**Result:**
- No more layout shifts when data becomes empty
- Users always have a clear next action (CTA button) in empty states
- Better messaging that actually describes the empty state

### 9. Settings Menu Items Not Categorized
**File:** `settings.tsx`
**Issue:** All items in flat list - no grouping by function (account, preferences, etc.)
**Status:** [ ]
**Priority:** Medium
**Labels:** ux, settings, information-architecture

### 10. No Indication of Active Tab
**File:** `_layout.tsx`
**Issue:** Tab bar only changes color - no visual indicator (underline, icon change) of active screen
**Status:** [ ]
**Priority:** Medium
**Labels:** ux, navigation, tabs

---

## 🟡 MEDIUM PRIORITY

### 11. Inconsistent Spacing & Typography
**Issue:**
- Headers vary padding (16-24px horizontal)
- Card padding varies (12-16px)
- Title font sizes differ (24px vs 28px)
**Status:** [ ]
**Priority:** Medium
**Labels:** design-system, consistency

### 12. Modal Inconsistencies
**Issue:** Some modals use `slide`, some use `fade` animation - no standard pattern
**Status:** [ ]
**Priority:** Medium
**Labels:** ux, consistency, modals

### 13. Labeling Issues
**Issue:**
- "Plan" tab title unclear (vs "Tasks" or "To-Do")
- "Cabinet" metaphor might confuse users
- "SOS" might not be understood
- "Frequency Label" is technical
**Status:** [ ]
**Priority:** Medium
**Labels:** ux, clarity, terminology

### 14. Missing Context in UI
**Issue:**
- No breadcrumbs or navigation context
- No explanation of what "Active" means for medications
- Time label chips have no tooltips
**Status:** [ ]
**Priority:** Medium
**Labels:** ux, clarity, help-text

### 15. Back Button Inconsistencies
**Issue:** Some screens have back buttons, some don't - inconsistent navigation experience
**Status:** [ ]
**Priority:** Medium
**Labels:** navigation, consistency

### 16. Calendar & SOS History View Clarity
**File:** `sos-medicines.tsx`
**Issue:** Calendar AND logs in history view - confusing what primary interaction is
**Status:** [ ]
**Priority:** Medium
**Labels:** ux, clarity, layout

### 17. AI Summary Button Unclear
**File:** `insights.tsx`
**Issue:** "Generate AI Summary" doesn't explain what data will be analyzed or what it generates
**Status:** [ ]
**Priority:** Medium
**Labels:** ux, clarity, ai

### 18. Date Navigator Clarity
**File:** `tasks.tsx`
**Issue:** Date navigator shows day name but not which day is today
**Status:** [ ]
**Priority:** Low
**Labels:** ux, clarity, date-picker

---

## 🔧 QUICK WINS (Easy Fixes)

### 19. Fix Settings Screen
**Action:** Either implement the settings functionality or disable the items with explanatory text
**Est. Time:** 2-4 hours
**Status:** [ ]

### 20. Add Quick-Access Cards
**Action:** Add visible cards/buttons for Templates, Calendar, Patient Info on Home or Profile screen
**Est. Time:** 1-2 hours
**Status:** [ ]

### 21. Standardize Primary Color
**Action:** Use teal (#14B8A6) consistently across all screens, remove blue from Tasks
**Est. Time:** 30 min
**Status:** [ ]

### 22. Increase Touch Targets
**Action:** Add padding to small buttons (date arrows, toggle, edit/delete icons)
**Est. Time:** 1-2 hours
**Status:** [ ]

### 23. Add KeyboardAvoidingView
**Action:** Wrap all modal forms in KeyboardAvoidingView
**Est. Time:** 2-3 hours
**Status:** [ ]

### 24. Add Toast Feedback
**Action:** Add react-native-flash-message for success/error feedback
**Est. Time:** 2-3 hours
**Status:** [ ]

### 25. Add Active Tab Indicator
**Action:** Add underline or highlight to active tab in _layout.tsx
**Est. Time:** 1 hour
**Status:** [ ]

---

## 📋 QUICK WINS PROGRESS

| Task | Status | Notes |
|------|--------|-------|
| Fix Settings Screen | [ ] | |
| Add Quick-Access Cards | [ ] | |
| Standardize Primary Color | [ ] | |
| Increase Touch Targets | [ ] | |
| Add KeyboardAvoidingView | [ ] | |
| Add Toast Feedback | [ ] | |
| Add Active Tab Indicator | [ ] | |

---

## 🎯 IMPROVEMENT CATEGORIES

### Design System
- [ ] Standardize colors (use teal as primary)
- [ ] Standardize spacing (create constants)
- [ ] Standardize typography (font sizes, weights)
- [ ] Create component library (buttons, cards, modals)

### Navigation
- [ ] Fix active tab indicator
- [ ] Unhide important features (Templates, Calendar, Patient Info)
- [ ] Standardize back buttons
- [ ] Fix settings menu

### Forms & Input
- [ ] Add KeyboardAvoidingView to all modals
- [ ] Use native Switch component for toggles
- [ ] Add validation indicators
- [ ] Add progress to long forms

### Feedback
- [x] Add toast messages for all actions
- [ ] Add loading states to buttons
- [ ] Add success animations
- [x] Improve empty states

### Accessibility
- [ ] Increase all touch targets to 44px minimum
- [ ] Add accessibility labels to all interactive elements
- [ ] Improve color contrast
- [ ] Add screen reader support

---

## 📝 NOTES

- Many issues stem from no formal design system being established
- The app functions correctly but feels inconsistent
- Quick wins should be prioritized for immediate improvement
- Design system work will prevent future inconsistencies

---

Last Updated: February 2, 2026
