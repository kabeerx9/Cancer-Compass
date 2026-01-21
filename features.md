# Cancer Compass - Features & Requirements

## 🎯 Project Overview

**Cancer Compass** is a cancer treatment management app designed to help patients and caregivers organize medications, track treatment cycles, manage tasks, and store important medical documents.

**Target Users:** Cancer patients and their caregivers
**Primary Platform:** Mobile (Expo/React Native)
**Secondary Platform:** Web (React + Vite)

---

## 👥 User Model

- **Single user type** - No role-based permissions (patient and caregiver are treated the same)
- **Multi-device support** - Same account can be logged in on multiple devices
- **Shared notifications** - Both devices receive the same reminders
- **Authentication:** Email/password

---

## 📋 Core Features

### 💊 1. Medication Management
**Priority: HIGH - Start with this feature**

Manage daily medications and treatment schedules with custom reminders.

**Features:**
- Add medications with:
  - Medication name
  - Purpose/description (e.g., "For blood pressure", "Immunotherapy")
  - Custom time + label (user-defined, e.g., "7:30 AM - Before breakfast", "After lunch")
  - Dosage information
- **Push notifications** for medication reminders
  - Customizable timing
  - Snooze option
- Daily medication view (what to take today)
- Medication history/log
- Mark as taken/skipped

**Why start here:**
- Immediately useful (daily need)
- Relatively simple to build
- Establishes notification infrastructure
- Can be used right away while building other features

---

### 📅 2. Day Templates System
**Priority: HIGH**

Create reusable "Day Type" templates for common treatment-related days.

**Features:**
- Create custom day type templates (e.g., "Infusion Day", "Discharge Day", "Travel Day", "Pre-Infusion Day")
- Each template contains a default task list
- Edit templates → updates apply to all future uses
- No limit on number of templates
- Color-code each template type for visual differentiation

**Example Templates:**
- **Pre-Infusion Day**: Get bloodwork, confirm bed availability, pack medications
- **Travel Day**: Book hotel, pack bags, check car/fuel
- **Infusion Day**: Arrive at hospital 9 AM, submit admission papers, bring comfort items
- **Discharge Day**: Collect medical certificate, get doctor signatures on bills, submit insurance forms

---

### 📆 3. Calendar & Day Assignment
**Priority: HIGH**

Visual calendar for assigning day templates to specific dates.

**Features:**
- Calendar view (month/week)
- **Manually assign** day templates to specific dates
- **Multiple templates per day** supported (e.g., "Travel Day" + "Pre-Infusion Day")
- Color-coded calendar based on assigned day types
- Easy reassignment when dates change
- Visual countdown to next important dates

**Workflow:**
1. User selects a date on calendar
2. Assigns one or more day templates to that date
3. Tasks from templates automatically populate as subsection for that day
4. User can add additional custom tasks beyond template tasks

---

### ✅ 4. Task Management
**Priority: HIGH**

Daily task lists combining template tasks and custom tasks.

**Features:**
- **Two types of tasks per day:**
  1. **Template tasks** - Auto-added from assigned day templates (shown as subsection)
  2. **Custom tasks** - User adds manually for specific days
- Task details:
  - Task title
  - Optional description/notes
  - Checkbox (complete/incomplete)
  - Optional link to documents
- **Task completion is per-instance** - Checking off a task on one day doesn't affect the same task on another day
- View tasks by:
  - Today's tasks
  - Upcoming tasks
  - Calendar view
- Optional task notifications/reminders

**Important:** No automatic task date adjustments. User has full manual control.

---

### 📄 5. Document Storage
**Priority: MEDIUM**

Store and organize medical documents with easy retrieval.

**Features:**
- Upload documents (photo from camera or PDF)
- Document categories:
  - **Medical Records** - Test results, scan reports, doctor notes
  - **Insurance/Billing** - Claims, approvals, bills, receipts
  - **Prescriptions** - Medication prescriptions, refill records
  - **Hospital Admin** - Consent forms, admission papers
- Document metadata:
  - Title
  - Date
  - Category
  - Optional notes
- View/browse by:
  - Date (chronological)
  - Category
  - Search (by title/notes)
- **Optional:** Link documents to tasks

**Storage:** Cloud-based (Supabase Storage or Cloudflare R2)

---

### 🩺 6. Treatment Cycle Tracking
**Priority: MEDIUM**

Track treatment cycles with flexible scheduling.

**Features:**
- Track current cycle number (Cycle 1, 2, 3...)
- **Flexible scheduling** - NOT rigid 21-day cycles
  - Manually set next infusion date
  - Easy reschedule (dates can shift based on bed availability, etc.)
- Countdown to next infusion
- History of past cycles with dates
- Visual timeline of all scheduled dates

**Important:** Cycles are approximate (20-22 days), not fixed. User controls all dates manually.

---

### 📞 7. Quick Reference Info
**Priority: MEDIUM**

Essential patient information at your fingertips.

**Features:**
- Patient information card:
  - Name, DOB, blood type, allergies
  - Current medications list
  - Primary oncologist contact
  - Hospital information
  - Insurance details
- **Doctor/Hospital contacts** with quick dial/message
- **Shareable** as text or PDF (for emergency situations)

---

### 📝 8. Notes/Journal
**Priority: LOW**

Daily notes and symptom tracking.

**Features:**
- Daily journal entries
- Free-form text
- Date-stamped
- Optional: Symptom tracking (how patient felt, side effects, pain level)
- Browse by date

---

### 🔔 9. Notifications & Reminders
**Priority: HIGH** (built into other features)

Smart notifications to keep treatment on track.

**Features:**
- **Medication reminders** - Daily, at custom times
- **Task reminders** - For important upcoming tasks
- **Day-based alerts** - "Today is Discharge Day - check your tasks"
- Customizable notification preferences
- Snooze/dismiss options

---

## 🎨 Design Principles

- ✅ **Simple & calming** - Not clinical and cold
- ✅ **Easy to use when stressed/tired** - Large touch targets, clear hierarchy
- ✅ **Visual clarity** - Color-coding, icons, clear labels
- ✅ **Empathy-first design** - No expense tracking (emotionally sensitive)
- ✅ **Progress celebration** - Acknowledge completed cycles and milestones

---

## 🚫 Out of Scope (For Now)

- ❌ Role-based permissions (admin/patient/family roles)
- ❌ Offline-first (can add later if needed)
- ❌ Home vs Hospital context modes
- ❌ Expense tracking
- ❌ AI features
- ❌ Family update portal (Phase 2)
- ❌ Auto-adjusting task dates (manual control only)

---

## 🛠️ Technology Stack

### Mobile App (Primary)
- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **Notifications:** Expo Notifications

### Web App (Secondary)
- **Framework:** React + Vite
- **Language:** TypeScript
- **UI:** TailwindCSS (or component library TBD)

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage (or Cloudflare R2)
- **API:** Supabase (or Express if custom backend needed)

### Monorepo
- **Tool:** Turborepo
- **Package Manager:** pnpm
- **Structure:**

```
Cancer-Compass/
├── apps/
│   ├── mobile/ (Expo app)
│   ├── web/ (React + Vite)
│   └── server/ (Optional if using custom backend)
└── packages/
    ├── types/ (Shared TypeScript types)
    ├── utils/ (Shared utilities)
    └── ui/ (Shared components if needed)
```



---

## 📱 Platform Priority

1. **Mobile app** - Primary focus, most useful daily
2. **Web app** - Secondary, for easier data entry and future family portal

---

## 🚀 Development Phases

### Phase 1 - MVP (Most Critical)
**Goal:** Get basic functionality working before Cycle 2

**Features:**
1. ✅ Medication management with reminders
2. ✅ Basic day templates creation
3. ✅ Calendar with day assignment
4. ✅ Task lists (template + custom)
5. ✅ Simple document upload

### Phase 2 - Refinement
**Based on real usage feedback from Cycle 2**

**Features:**
1. ✅ Enhanced document organization
2. ✅ Treatment cycle tracking
3. ✅ Quick reference info
4. ✅ Better notifications
5. ✅ Notes/journal

### Phase 3 - Polish & Expansion
**Make it shareable for other patients**

**Features:**
1. ✅ Multi-user improvements
2. ✅ Template library (common treatments)
3. ✅ Web app enhancements
4. ✅ Family portal (optional)
5. ✅ Analytics/insights

---

## 📅 Next Steps

1. **Prioritize features** - Agree on build order
2. **Create implementation plan** - Technical design doc
3. **Set up project** - Initialize Turborepo monorepo
4. **Start building** - Begin with Medication Management (Phase 1)

---

*Last Updated: January 21, 2026*
