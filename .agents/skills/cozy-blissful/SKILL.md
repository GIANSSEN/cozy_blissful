---
name: cozy-blissful
description: Architecture, end-to-end booking workflows, scalability rules, and UI/UX guidelines for the Cozy Blissful Spa & Salon system.
disable-model-invocation: false
---

# Cozy Blissful — Spa & Salon Booking Management System

Cozy Blissful is an enterprise-grade, luxury Spa and Salon appointment booking and management platform. It integrates customer self-service scheduling with back-office operations for receptionists/staff, therapists, and administrators.

---

## 1. System Architecture & Tech Stack

### Backend
- **Framework**: Laravel 12 (PHP 8.2+)
- **Database**: MySQL / MariaDB (InnoDB engine with transactions)
- **Authentication**: Laravel Sanctum (token-based Bearer auth)
- **Role & Permissions**: Spatie Laravel-Permission (`admin`, `staff`, `therapist`, `client`)
- **Rate Limiting**: Custom throttles on `/register`, `/login`, `/auth/google`, `/auth/facebook`
- **Mailers & Notifications**: Laravel Mail (`BookingConfirmationMail`, `BookingApprovedMail`, reminders)

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS custom themes
- **Animations**: Framer Motion & GSAP for luxury micro-interactions
- **Routing**: React Router v7 (`/`, `/client/*`, `/staff/*`, `/therapist/*`, `/admin/*`)
- **Icons**: Lucide React
- **Linter**: Oxlint (strict 0-error / clean standards)

---

## 2. Core Domain & Business Rules

### Salon Operating Hours & Scheduling
- **Daily Operating Hours**: 9:00 AM – 9:00 PM (12 hours daily).
- **Slot Granularity**: Candidate slots start every 30 minutes (09:00, 09:30, 10:00, etc.).
- **Service Durations**: Variable per service (e.g., 30m, 45m, 60m, 90m, 120m).
- **Multi-Therapist Concurrency**:
  - The salon does **not** lock out an entire time window upon a single booking.
  - Salon capacity at any minute equals the number of available active therapists on that date.
  - A time slot is only unavailable if **all** working therapists are booked, OR if a client requested a specific therapist who is already engaged during that window.
- **Buffer & Overlap Calculation**:
  - A slot `[S_start, S_end]` overlaps with an existing appointment `[E_start, E_end]` if:
    `S_start < E_end && S_end > E_start`.

### Appointment State Machine
```
[Client Submits] 
       │
       ▼
   (Pending) ─── Staff/Admin Rejects ───► (Cancelled)
       │
   Staff Assigns Therapist
       │
       ▼
  (Confirmed) ─── Client Cancels (Before cutoff) ───► (Cancelled)
       │
   Therapist Begins Session
       │
       ▼
 (In Progress) 
       │
   Session Concluded
       │
       ▼
  (Completed) ──► Audit Logged + Payment Recorded
```

---

## 3. End-to-End Role Workflows

### A. Client Workflow (Self-Service Booking)
1. **Browse & Select Service**: View categorized services (Massages, Facials, Nail Care, Hair Treatments) with pricing, duration, and details.
2. **Specialist Preference**: Select "Any Available Specialist" or request a preferred therapist.
3. **Date & Slot Selection**:
   - Query `/api/booking/available-slots?date=YYYY-MM-DD&service_id=X&therapist_id=Y`.
   - Real-time capacity computation returns available and filled slots.
4. **Checkout / Confirmation**:
   - Submit `/api/booking/store`.
   - Atomic transaction creates `Appointment` with `Pending` status.
   - Client receives booking confirmation email.
   - Admin/Staff receive real-time dashboard notification.
5. **Manage Existing Bookings**:
   - Reschedule: `/api/booking/{id}/reschedule` (validates future slot availability, resets reminder flags).
   - Cancel: `/api/booking/{id}/cancel` (restricted to `Pending` and `Confirmed` statuses).

### B. Staff Workflow (Front-Desk Operations)
1. **Queue Review**: View real-time pending appointment requests (`/api/staff/appointments`).
2. **Therapist Assignment**:
   - Inspect therapist schedules and assign specialist (`/api/staff/appointments/{id}/assign`).
   - Transition status to `Confirmed`.
   - Automatic dispatch of `BookingApprovedMail` to client.
3. **Schedule & Shift Management**:
   - Toggle therapist day availability (`/api/staff/availability/toggle`).
4. **Walk-ins & Status Overrides**:
   - Mark sessions `In Progress`, `Completed`, or `Cancelled` with audit notes.

### C. Therapist Workflow (Service Provider)
1. **Daily Schedule View**: View assigned clients, service specifications, and customer preferences.
2. **Availability Roster**: Set working days and duty slots (`/api/therapist/availability`).
3. **Session Updates**: Acknowledge assignments and update progress in real time.

### D. Admin Workflow (Management & Governance)
1. **Executive Dashboard**: Revenue metrics, booking volume, therapist workload, and client acquisition.
2. **Service Catalog CRUD**: Create, edit, activate/deactivate services, pricing, and durations.
3. **User & Staff Directory**: Manage staff accounts, therapist profiles, and customer maintenance.
4. **Audit Logs & Security**: Exportable audit trail tracking all state mutations and access events.

---

## 4. Scalability & Engineering Standards

### Database & Concurrency
- Always execute state-changing operations within `DB::transaction(...)`.
- Avoid N+1 queries by eager-loading relations: `with(['client', 'therapist', 'service'])`.
- Index foreign keys and search columns: `(datetime, status)`, `(client_id, datetime)`, `(therapist_id, datetime)`.

### Error Handling & API Responses
- All API endpoints return consistent JSON structures:
  - Success: `{ "message": "...", "data": { ... } }` or `{ "message": "...", "appointments": [...] }`
  - Validation: Standard HTTP 422 with `{ "message": "...", "errors": { ... } }`
  - Server Error: HTTP 500 with logged stack trace and clean user-safe message.

### Frontend UI/UX Standards
- **Palette**: Luxury Spa Deep Emerald (`#062c22`, `#0a3d30`), Warm Gold Accent (`#bfa15f`, `#d4b87a`), and Crisp Cream (`#fdfcfa`, `#f5f0e8`).
- **Tactile Feedback**: Neumorphic soft shadows, glassmorphism modals, and smooth micro-animations.
- **Accessibility**: High contrast text ratios, descriptive ARIA attributes, semantic button elements.
- **Zero Console / Lint Errors**: All React hooks must properly declare dependencies; unused imports or variables must be eliminated.
