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
**Status:** [ ]
**Priority:** Critical
**Labels:** navigation, discoverability, ux

### 3. Inconsistent Color Schemes
**Issue:**
- Home/Insights use teal (#14B8A6)
- Tasks uses blue (#2563EB)
- Settings uses random colors per item
**Status:** [ ]
**Priority:** Critical
**Labels:** design-system, consistency, colors

### 4. Small Touch Targets
**Files:** `tasks.tsx`, `cabinet.tsx`, `index.tsx`
**Issue:** Many buttons below 44x44px recommended minimum (date arrows 22-24px, calendar icons 22px, toggle buttons 8px padding)
**Status:** [ ]
**Priority:** Critical
**Labels:** accessibility, touch-target, mobile

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
**Status:** [ ]
**Priority:** High
**Labels:** ux, feedback, usability

### 7. Confusing Toggle Design
**File:** `cabinet.tsx`
**Issue:** Medication toggle is custom-built, not native Switch - no label indicating what "on/off" means
**Status:** [ ]
**Priority:** High
**Labels:** ux, clarity, components

### 8. Poor Empty States
**Issue:** Some empty states lack clear CTAs, stats cards disappear when empty causing layout shift
**Status:** [ ]
**Priority:** High
**Labels:** ux, empty-states, layout

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
- [ ] Add toast messages for all actions
- [ ] Add loading states to buttons
- [ ] Add success animations
- [ ] Improve empty states

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
