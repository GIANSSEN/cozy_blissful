# SYSTEM USER ACCESS & OPERATIONAL SPECIFICATION
## Module: Staff & Front Desk Coordinator Access Specification
**System Name:** Cozy Blissful Spa & Salon Management System  
**Document Code:** CB-SOP-SEC-004  
**Version:** 1.0  
**Classification:** Internal Documentation / Technical Specification  
**Effective Date:** September 2026  

---

### DOCUMENT CONTROL

| Field | Detail |
| :--- | :--- |
| **System** | Cozy Blissful Spa & Salon Management System |
| **Module** | Staff Operations & Role-Based Access Control (RBAC) |
| **Target Role** | `staff` (Staff Coordinator, Front Desk, Operations Lead, Nail Techs) |
| **Document Purpose** | Comprehensive definition of staff access rights, interface scopes, business workflows, and security boundaries. |
| **Status** | Approved & Production-Ready |

---

## 1. PURPOSE AND SCOPE

This document provides a formal specification of the **Staff User Role** within the Cozy Blissful Spa & Salon system. It outlines:
- All functional modules accessible to staff members.
- Security boundaries, authentication protocols, and limitations.
- API endpoints permitted for the role.
- Standard Operating Procedures (SOP) regarding booking management, shift administration, and post-service payment settlement.

---

## 2. ROLE DEFINITION & PROFILE

### 2.1 Role Description
The **Staff Coordinator** represents the front-line management role at Cozy Blissful. Personnel assigned to this role are responsible for day-to-day front desk operations, walk-in customer intake, assigning treatments to available therapists, managing shift schedules, and completing point-of-sale counter settlements.

### 2.2 Seeded User Profiles (System Defaults)

| Full Name | System Email | Initial Password | Assigned Specialty / Sub-Role | Account Status |
| :--- | :--- | :--- | :--- | :--- |
| **Staff Coordinator** | `staff@example.com` | `password` | Front Desk & Operations Lead | Active |
| **Jade Ferrer** | `jade@example.com` | `password` | Gel Nails & Nail Art Specialist | Active |
| **Allysa Banlaoi** | `allysa@example.com` | `password` | Manicure & Pedicure Spa Specialist | Active |

---

## 3. AUTHENTICATION & SESSION ARCHITECTURE

1. **Authentication Protocol:** Laravel Sanctum stateful token-based authentication (`auth:sanctum`).
2. **Access Control Check:** Middleware guard `role:staff` evaluates Spatie RBAC role assignment on every API call.
3. **Frontend Guarding:** React client-side route protection via `<ProtectedRoute allowedRoles={['staff']}>`.
4. **Portal Navigation:** Upon successful login at `/login`, staff users are automatically routed to the Staff Operations Dashboard at `/staff/dashboard`.

---

## 4. AUTHORIZED FUNCTIONAL MODULES (FRONTEND INTERFACES)

Staff users have exclusive or shared operational privileges across three primary frontend views:

### 4.1 Staff Operations Dashboard (`/staff/dashboard`)
* **Daily Metric Cards:**
  * Real-time count of total therapists registered in the system.
  * Count of therapists currently available on duty for the active calendar date.
  * Pending bookings queue needing confirmation or therapist allocation.
  * Confirmed bookings count for the day.
* **Therapist On-Duty Status Widget:**
  * View current day's active roster.
  * Live availability indicator per therapist.
  * Direct toggle button allowing staff to mark a therapist as on-shift or off-shift.
* **Today's Operational Schedule:**
  * Chronological queue of all client appointments scheduled for today.
  * Displays client name, requested service, assigned therapist, time slot, and operational status.

### 4.2 Booking & Appointment Manager (`/staff/appointments`)
* **Filtering & Search:**
  * Tabbed filters: **Today**, **Upcoming**, and **All Appointments**.
  * Filter appointments by status (`Pending`, `Confirmed`, `In Progress`, `Completed by Therapist`, `Completed`, `Cancelled`).
* **Therapist Dispatching & Assignment:**
  * Capability to assign any unassigned appointment to an available therapist.
  * Assigning a therapist automatically transitions status from `Pending` to `Confirmed`.
  * Triggers automated customer notification email (`BookingApprovedMail`).
* **Lifecycle State Transitions:**
  * Update appointment statuses in accordance with the system state machine.
  * Cancellation with mandatory recorded reason note.
* **Appointment Rescheduling:**
  * Update appointment date and time for customers requiring schedule adjustments.
  * Automatically resets automated 24-hour and 2-hour reminder flags.
* **Point-of-Sale Payment Settlement:**
  * Cash and counter payment collection module.
  * Settlement enabled once a therapist finishes treatment (`Completed by Therapist`).
  * Supports multiple payment channels: **Cash**, **GCash**, **Maya**, **QR Ph**, and **Online**.
  * Cash change calculator (Cash Tendered minus Total Due).
  * Automatically sets payment status to `paid` and records the transaction timestamp.

### 4.3 Therapist Roster & Availability Administration (`/staff/therapists`)
* **Therapist Directory:**
  * Complete list of registered wellness and massage therapists.
  * Displays therapist name, email contact, and specialty qualifications.
* **Multi-Day Schedule Management:**
  * 7-day lookahead calendar grid for each therapist.
  * Interactive date toggle enabling staff to schedule shifts or remove availability when a therapist calls in sick or requests time off.

---

## 5. BACKEND API ACCESS SPECIFICATION

All endpoints are hosted under the `/api/staff/` prefix and require authorization headers with a valid Bearer token possessing the `staff` role.

| HTTP Method | Route Endpoint | Action Description | Required Payload / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/staff/dashboard` | Fetches daily KPIs, therapist roster status, and today's appointment list. | None |
| `GET` | `/api/staff/therapists` | Fetches therapist directory with multi-day availability dates. | None |
| `POST` | `/api/staff/availability/toggle` | Adds or removes therapist working availability for a specific date. | `therapist_id` (integer), `date` (YYYY-MM-DD) |
| `GET` | `/api/staff/appointments` | Retrieves appointments with optional filter parameters. | Query param: `?filter=today\|upcoming\|all` |
| `POST` | `/api/staff/appointments/{id}/assign` | Assigns an available therapist and auto-confirms booking. | `therapist_id` (integer) |
| `POST` | `/api/staff/appointments/{id}/status` | Advances appointment lifecycle status according to guard rules. | `status` (string), `reason` (optional string) |
| `POST` | `/api/staff/appointments/{id}/settle-payment` | Finalizes payment settlement and closes out appointment. | `amount_paid` (decimal), `payment_method` (string), `cash_tendered` (optional), `change` (optional), `notes` (optional) |
| `POST` | `/api/staff/appointments/{id}/reschedule` | Modifies scheduled appointment date and time. | `datetime` (YYYY-MM-DD HH:mm:ss), `notes` (optional string) |

---

## 6. STANDARD OPERATING PROCEDURES & STATE MACHINE RULES

Staff members must adhere to strict status transitions enforced in `StaffController.php`:

```
[Pending]
   │
   ├──► [Confirmed] (Staff assigns therapist or approves)
   │       │
   │       └──► [In Progress] (Client arrives, treatment begins)
   │               │
   │               └──► [Completed by Therapist] (Therapist concludes session)
   │                       │
   │                       └──► [Completed] (Staff collects payment & settles)
   │
   └──► [Cancelled] (Staff cancels with mandatory reason)
```

### Critical Security & Operational Guards:
1. **In-Progress Protection:** Staff **cannot** force-complete or cancel an appointment marked `In Progress`. The attending therapist must officially conclude the clinical/wellness session by moving it to `Completed by Therapist`.
2. **Settlement Guard:** Staff can only execute payment settlement when the status is `Completed by Therapist`. This guarantees that services are never prematurely billed before clinical delivery.

---

## 7. ACCESS BOUNDARIES & LIMITATIONS (WHAT STAFF CANNOT ACCESS)

To safeguard system integrity and prevent unauthorized organizational changes, the `staff` role has explicit restrictions:

| Restricted Domain | Access Level | Description |
| :--- | :---: | :--- |
| **System Settings** (`/admin/settings`) | ❌ No Access | Cannot modify operating hours, spa configuration, or payment keys. |
| **Service Catalog CRUD** (`/admin/services`) | ❌ No Access | Cannot add, edit, or delete services, massage types, or prices. |
| **User & Team Management** (`/admin/users`) | ❌ No Access | Cannot create new staff, edit staff roles, or delete users. |
| **Financial Revenue Analytics** (`/admin/dashboard`) | ❌ No Access | Cannot view total revenue charts, 7-day gross sales, or profit margins. |
| **System Audit Logs** (`/admin/audit-logs`) | ❌ No Access | Cannot inspect or export administrative audit logs or delete security trails. |
| **Admin Privilege Escalation** | ❌ Blocked | Staff cannot assign or grant administrative privileges to any account. |

---

## 8. AUDIT LOGGING & ACCOUNTABILITY

Every administrative action executed by a staff account generates an immutable audit record in the system audit repository:
* **Log Properties Recorded:** `timestamp`, `actor` (Staff user name), `actor_role` (`staff`), `module` (`Appointments` / `Payments`), `action` (`update`), `severity` (`info`), and change metadata.
* **Logged Operations:**
  * Therapist reassignments.
  * Appointment cancellations with client-provided reasons.
  * Rescheduling operations with previous and updated date-times.
  * Payment settlements recording amount received, channel used, and invoice closure.

---
**End of Document**
