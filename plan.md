


# Cancer Compass - Development Plan
## 🎯 Build Strategy
**Philosophy:** Start with features you can use **immediately** and build incrementally. Each phase should deliver usable functionality.
**Timeline Goal:** Get MVP running before Cycle 2 (~21 days from Jan 21)
---
## 📅 Phase 1: Foundation & Medication Management (Week 1)
**Goal:** Set up project infrastructure and build the medication feature (most immediately useful)
### Step 1: Project Setup (Day 1)
- [ ] Create new Turborepo project for Cancer Compass
- [ ] Set up mobile app (Expo)
- [ ] Set up web app (React + Vite) - minimal for now
- [ ] Configure Supabase project:
  - [ ] Database
  - [ ] Storage
- [ ] Set up Clerk account:
  - [ ] Create Clerk application
  - [ ] Get publishable keys for web and mobile
  - [ ] Configure Clerk webhooks (for user sync)
- [ ] Set up shared packages (`@cancer-compass/types`, `@cancer-compass/utils`)
- [ ] Configure TypeScript, ESLint, Prettier
**Deliverable:** Clean monorepo with mobile and web apps running
---
### Step 2: Authentication (Day 1-2)
**Frontend (Web & Mobile):**
- [ ] Set up Clerk in web app (already partially done)
- [ ] Set up Clerk in mobile app (`@clerk/clerk-expo`)
- [ ] Configure ClerkProvider in both apps
- [ ] Login/sign-up screens using Clerk components
- [ ] Auth state management (use Clerk hooks)
- [ ] Token storage (expo-secure-store for mobile)

**Backend:**
- [ ] Install `@clerk/express` or use Clerk's token verification
- [ ] Create auth middleware to validate Clerk tokens from Authorization header
- [ ] Middleware extracts Clerk user ID from validated token
- [ ] Set up user sync endpoint (webhook or on-first-login)
- [ ] Store users in database with Clerk user ID (`clerk_user_id`)
- [ ] Update existing auth middleware to use Clerk token validation
- [ ] Add `req.userId` (database user ID) and `req.clerkUserId` (Clerk user ID) to request

**Auth Flow:**
1. Frontend sends Clerk session token in `Authorization: Bearer <token>` header
2. Backend middleware validates token with Clerk
3. Backend looks up or creates user record with Clerk user ID
4. Backend attaches user info to `req` object for route handlers

**Deliverable:** Users can create account and log in via Clerk on both platforms, backend validates tokens and syncs users
---
### Step 3: Basic App Shell (Day 2)
- [ ] Bottom tab navigation (Home, Medications, Calendar, Documents, More)
- [ ] Basic home screen with placeholder
- [ ] Navigation structure
- [ ] Design system basics (colors, typography, spacing)
**Deliverable:** App navigation works, clean UI foundation
---
### Step 4: Medication Management - Part 1 (Days 3-4)
**Database Schema:**
```sql
users table:
- id (uuid, primary key)
- clerk_user_id (text, unique) - Clerk's user ID
- email (text)
- created_at (timestamp)
- updated_at (timestamp)

medications table:
- id (uuid)
- user_id (uuid, foreign key to users.id)
- name (text)
- purpose (text)
- dosage (text)
- time (time)
- time_label (text) - e.g., "Before breakfast"
- is_active (boolean)
- created_at (timestamp)
```

**Features to build:**
- Medications screen UI
- Add medication form (name, purpose, dosage, time, label)
- List all medications
- Edit medication
- Delete medication
- Mark medication as inactive (stop taking)

**Deliverable:** Can add, view, edit, and manage medications
---
### Step 5: Medication Management - Part 2 (Day 5)
**Features to build:**
- Today's medications view on home screen
- Mark medication as taken/skipped
- Medication log/history
- Set up Expo push notifications
- Schedule daily notifications for each medication

**Deliverable:** Full medication management with working reminders

**End of Week 1:** You have a working medication tracker you can use daily!
---
## 📅 Phase 2: Day Templates & Tasks (Week 2)
**Goal:** Build the day template system and task management

### Step 6: Day Templates - Part 1 (Days 6-7)
**Database Schema:**
```sql
day_templates table:
- id (uuid)
- user_id (uuid, foreign key to users.id)
- name (text) - e.g., "Infusion Day"
- color (text) - hex color code
- created_at (timestamp)

template_tasks table:
- id (uuid)
- template_id (uuid, foreign key to day_templates.id)
- task_title (text)
- task_description (text, nullable)
- order (integer) - for sorting
- created_at (timestamp)
```

**Features to build:**
- Day templates screen
- Create new template (name, color)
- Add tasks to template
- Edit template name/color
- Reorder template tasks
- Delete template
- View all templates

**Deliverable:** Can create and manage reusable day templates
---
### Step 7: Calendar & Day Assignment (Days 8-9)
**Database Schema:**
```sql
assigned_days table:
- id (uuid)
- user_id (uuid, foreign key to users.id)
- date (date)
- template_id (uuid, foreign key to day_templates.id)
- created_at (timestamp)
- unique constraint on (user_id, date, template_id)
```

**Features to build:**
- Calendar view (month view)
- Tap date → show assignment modal
- Assign one or more templates to a date
- Visual: color-coded dates based on templates
- Remove template from date
- View assigned templates for a date

**Deliverable:** Can assign day templates to calendar dates
---
### Step 8: Task Management (Days 10-11)
**Database Schema:**
```sql
daily_tasks table:
- id (uuid)
- user_id (uuid, foreign key to users.id)
- date (date)
- task_title (text)
- task_description (text, nullable)
- is_completed (boolean)
- is_template_task (boolean) - true if from template
- template_id (uuid, nullable, foreign key to day_templates.id) - if from template
- document_id (uuid, nullable, foreign key to documents.id) - optional link to document
- created_at (timestamp)
```

**Features to build:**
- Day view screen (shows all tasks for a specific day)
- Auto-populate template tasks when template is assigned
- Add custom tasks to a day
- Check off tasks (mark complete)
- Edit task
- Delete task
- "Today" view on home screen (today's tasks)

**Deliverable:** Full task management with template tasks + custom tasks
---
### Step 9: Template Updates (Day 12)
**Features to build:**
- When template is edited, show option: "Update all future uses?"
- If yes, update all unfinished template tasks for future dates
- Don't touch past or completed tasks

**Deliverable:** Template edits propagate to future uses

**End of Week 2:** You have day templates, calendar assignment, and task management working!
---
## 📅 Phase 3: Document Storage & Refinements (Week 3)
**Goal:** Add document storage and polish existing features

### Step 10: Document Storage (Days 13-14)
**Database Schema:**
```sql
documents table:
- id (uuid)
- user_id (uuid, foreign key to users.clerk_user_id)
- title (text)
- category (text) - enum: medical_records, insurance_billing, prescriptions, hospital_admin
- file_url (text) - Supabase Storage URL
- file_type (text) - e.g., "image/jpeg", "application/pdf"
- date (date)
- notes (text, nullable)
- created_at (timestamp)
```

**Features to build:**
- Documents screen
- Upload document (camera or file picker)
- Add metadata (title, date, category, notes)
- View documents by category
- View documents by date
- Search documents
- View/download document
- Delete document

**Deliverable:** Can upload and organize medical documents
---
### Step 11: Quick Reference Info (Day 15)
**Database Schema:**
```sql
patient_info table:
- user_id (uuid, primary key, foreign key to users.id)
- name (text)
- date_of_birth (date)
- blood_type (text)
- allergies (text)
- primary_oncologist (text)
- oncologist_phone (text)
- hospital_name (text)
- hospital_phone (text)
- insurance_provider (text)
- insurance_policy_number (text)
- updated_at (timestamp)

contacts table:
- id (uuid)
- user_id (uuid, foreign key to users.id)
- name (text)
- role (text) - e.g., "Doctor", "Hospital"
- phone (text)
- email (text, nullable)
- created_at (timestamp)
```

**Features to build:**
- Patient info screen
- Edit patient details
- Contacts list
- Add/edit/delete contacts
- Quick dial/message from contacts
- "Share info" button → export as text or PDF

**Deliverable:** Essential info accessible and shareable
---
### Step 12: Treatment Cycle Tracking (Day 16)
**Database Schema:**
```sql
treatment_cycles table:
- id (uuid)
- user_id (uuid, foreign key to users.id)
- cycle_number (integer)
- infusion_date (date)
- status (text) - enum: scheduled, completed, cancelled
- notes (text, nullable)
- created_at (timestamp)
```

**Features to build:**
- Home screen cycle widget
- Shows current cycle number
- Countdown to next infusion
- Schedule next cycle (date picker)
- Reschedule cycle
- View cycle history

**Deliverable:** Track treatment cycles with flexible scheduling
---
### Step 13: Notifications & Reminders (Day 17)
**Features to build:**
- Task reminders (e.g., "Tomorrow is Infusion Day")
- Day-based alerts (e.g., "Today is Discharge Day - check tasks")
- Notification settings screen
- Enable/disable notification types
- Customize reminder timing

**Deliverable:** Smart notifications keep treatment on track
---
### Step 14: Polish & UX Improvements (Days 18-19)
**Features to build:**
- Improve UI/UX based on real usage
- Add loading states
- Add error handling
- Add empty states (no medications, no tasks, etc.)
- Add confirmation dialogs (delete actions)
- Improve color scheme and visual design
- Add progress indicators (cycle completion %)
- Celebrate milestones (completed cycles)

**Deliverable:** App feels polished and professional
---
### Step 15: Testing & Bug Fixes (Days 20-21)
**Features to build:**
- Test all core flows
- Fix bugs found during testing
- Test on multiple devices
- Test notifications
- Test offline behavior (graceful degradation)
- Performance optimization

**Deliverable:** Stable, tested MVP ready for real use

**End of Week 3:** Complete MVP ready before Cycle 2!
---
## 📅 Phase 4: Web App & Enhancements (Post-MVP)
**Goal:** Build out web app and add Phase 2 features

### Step 16: Web App - Basic Features (Week 4)
**Features to build:**
- Port core features to web:
  - Authentication
  - Medications management
  - Calendar view
  - Task management
  - Document upload/view
  - Responsive design
  - Shared UI components between mobile and web

**Deliverable:** Web app has feature parity with mobile
---
### Step 17: Notes/Journal (Week 4-5)
**Database Schema:**
```sql
journal_entries table:
- id (uuid)
- user_id (uuid, foreign key to users.id)
- date (date)
- entry_text (text)
- mood (text, nullable)
- symptom_notes (text, nullable)
- created_at (timestamp)
```

**Features to build:**
- Daily journal entry
- Browse entries by date
- Optional symptom tracking fields
- Search entries

**Deliverable:** Daily journaling and symptom tracking
---
### Step 18: Advanced Features (Week 5+)
**Features to build:**
- Link documents to tasks
- Bulk template creation (import common protocols)
- Export calendar/tasks to PDF
- Multi-cycle timeline view
- Analytics/insights (side effect patterns, etc.)
- Family portal (optional view-only access)

**Deliverable:** Advanced features for power users
---
## 🛠️ Technical Decisions

### Authentication: Clerk
**Why:**
- Unified auth across web and mobile
- Handles all auth complexity (email/password, social, etc.)
- Secure token management
- Built-in user management UI
- Easy integration with Express backend
- Free tier sufficient for MVP

**Architecture:**
- Frontend: Clerk handles all auth UI and token management
- Backend: Express middleware validates Clerk tokens
- Database: Stores users with Clerk user ID as foreign key
- User sync: Webhook or on-first-login creates user record

### Database: Supabase (PostgreSQL)
**Why:**
- PostgreSQL (robust, relational)
- Built-in file storage
- Real-time sync across devices
- Generous free tier
- Easy to use with React/React Native

### Mobile: Expo
**Why:**
- Fast development
- Easy push notifications
- Camera/file access built-in
- Hot reload
- Can always eject if needed

### Web: React + Vite
**Why:**
- Fast build times
- Familiar React ecosystem
- Easy to share components with mobile (via shared packages)

### Backend: Express + Prisma
**Why:**
- Full control over API
- Prisma for type-safe database access
- Clerk token validation middleware
- Can scale independently

### Monorepo: Turborepo
**Why:**
- Share code between web/mobile/server
- Efficient caching
- Already familiar from earlier setup
---
## 📊 Success Metrics

### Phase 1 Success (Week 1)
- ✅ Medication reminders working daily
- ✅ You're using it for daily meds

### Phase 2 Success (Week 2)
- ✅ Next infusion scheduled in calendar
- ✅ Day templates created for common days
- ✅ Task lists ready for upcoming cycle

### Phase 3 Success (Week 3)
- ✅ Documents uploaded and organized
- ✅ All features tested and working
- ✅ App feels reliable and useful

### Cycle 2 Success (Week 4+)
- ✅ App genuinely made Cycle 2 easier
- ✅ Nothing forgotten/missed
- ✅ Less stress, more organized
---
## 🚨 Risk Mitigation

**Risk:** Too ambitious timeline
**Mitigation:** Focus on absolute essentials first (medications, tasks). Document storage can wait if needed.

**Risk:** Clerk token validation complexity
**Mitigation:** Use Clerk's official backend SDK, follow their docs for token verification, test thoroughly.

**Risk:** Notification issues
**Mitigation:** Test notifications early and often. Have fallback (in-app reminders).

**Risk:** Real-life doesn't match design
**Mitigation:** Stay flexible, adjust features based on actual usage.
---
## 📝 Next Immediate Steps
- ✅ Review this plan - agree on approach
- ✅ Set up Clerk account and get API keys
- ✅ Set up Supabase project (database + storage)
- ✅ Initialize Cancer Compass Turborepo
- ✅ Start with Step 1: Project Setup

Let's build something that makes a difference. 💙🧭

Last Updated: January 21, 2026
