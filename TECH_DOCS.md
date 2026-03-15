# HRIS Application — Technical Documentation

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Server Actions](#server-actions)
- [State Management](#state-management)
- [Component Architecture](#component-architecture)
- [Custom Hooks](#custom-hooks)
- [Validation](#validation)
- [Real-time Features](#real-time-features)
- [Styling & Theming](#styling--theming)
- [Environment Configuration](#environment-configuration)

---

## Overview

HRIS (Human Resource Information System) is a full-stack web application for managing employees, user accounts, attendance tracking, leave management, and payment processing. It supports two roles — **admin** and **employee** — with role-based access control at both the application and database levels.

---

## Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js 15 (App Router, Turbopack)              |
| Language         | TypeScript 5, React 19                          |
| Database & Auth  | Supabase (PostgreSQL + Auth + Realtime + Storage)|
| State Management | Zustand (global auth), React Query (server state)|
| Forms            | React Hook Form + Zod                           |
| UI Components    | shadcn/ui (new-york style), Radix UI primitives |
| Styling          | Tailwind CSS v4, CSS variables, next-themes     |
| Charts           | Recharts                                        |
| Icons            | Lucide React                                    |
| Notifications    | Sonner (toast)                                  |
| Payment          | Midtrans                                        |
| Fonts            | Geist Sans & Geist Mono                         |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (with Auth, Database, Storage, and Realtime enabled)

### Installation

```bash
git clone <repository-url>
cd hris-app
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

NEXT_PUBLIC_MIDTRANS_API_URL=<midtrans-api-url>
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<midtrans-client-key>
MIDTRANS_SERVER_KEY=<midtrans-server-key>
```

### Database Setup

Apply migrations in order from `src/migrations/`:

```
001-auth-profiles.sql        → Profiles table + auth triggers
002-employee.sql             → Employees table
003-attendance.sql           → Attendance records, RLS, views
004-employee-profile-rls.sql → Employee self-update RLS policies
005-auto-update-timestamps.sql → updated_at trigger functions
006-leave-management.sql     → Leave types, balances, requests + triggers
007-work-time-config.sql     → Singleton work time configuration
008-enable-realtime-attendance.sql → Realtime subscriptions
009-add-flexible-end-date-to-leave-types.sql → Flexible leave end dates
```

### Development

```bash
npm run dev      # Start dev server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   └── login/                    # Login page + actions
│   ├── (dashboard)/
│   │   ├── admin/                    # Admin-only routes
│   │   │   ├── attendance/           # Attendance management
│   │   │   ├── employee/             # Employee CRUD
│   │   │   ├── leave/                # Leave request approval
│   │   │   ├── leave-balance/        # Leave balance assignment
│   │   │   ├── leave-types/          # Leave type configuration
│   │   │   ├── user/                 # User account management
│   │   │   └── work-time/            # Work hours configuration
│   │   ├── employee-attendance/      # Employee clock-in/out
│   │   ├── employee-dashboard/       # Employee personal dashboard
│   │   ├── employee-leave/           # Employee leave requests
│   │   ├── employee-profile/         # Employee profile management
│   │   └── payment/                  # Payment success/failed pages
│   ├── layout.tsx                    # Root layout (providers)
│   └── page.tsx                      # Root redirect
│
├── actions/                          # Global server actions
│   ├── auth-action.ts                # signOut
│   └── storage-action.ts            # File storage operations
│
├── components/
│   ├── ui/                           # shadcn/ui primitives (30+)
│   └── common/                       # Shared components
│       ├── app-sidebar.tsx           # Role-based navigation
│       ├── data-table.tsx            # Generic data table
│       ├── form-input.tsx            # Form field wrappers
│       ├── form-select.tsx
│       ├── form-image.tsx
│       ├── form-phone-input.tsx
│       ├── dialog-delete.tsx         # Reusable delete confirmation
│       └── ...
│
├── configs/
│   └── environment.ts                # Typed environment variable access
│
├── constants/                        # Application constants
│   ├── auth-constant.ts              # Roles, initial states
│   ├── attendance-constant.ts        # Status enums, date presets
│   ├── employee-constant.ts          # Employee table config
│   ├── leave-constant.ts             # Leave status labels
│   ├── sidebar-constant.ts           # Navigation menu items
│   └── general-constant.ts           # Default form states
│
├── hooks/                            # Custom React hooks
│   ├── use-data-table.tsx            # Pagination, search, filter
│   ├── use-attendance-realtime.ts    # Supabase realtime subscription
│   ├── use-debounce.tsx              # Search debounce (500ms)
│   └── use-mobile.ts                 # Responsive breakpoint
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (anon key)
│   │   ├── server.ts                 # Server client (anon / service role)
│   │   ├── middleware.ts             # Session cookie management
│   │   └── default.ts               # Direct client for realtime
│   └── utils.ts                      # cn(), IDR formatting, image utils
│
├── migrations/                       # SQL migration files (applied in order)
│
├── providers/
│   ├── auth-store-provider.tsx       # Hydrates Zustand from cookie
│   ├── react-query-provider.tsx      # QueryClient configuration
│   └── theme-provider.tsx            # next-themes setup
│
├── stores/
│   └── auth-store.ts                 # Zustand auth store
│
├── types/                            # TypeScript type definitions
│   ├── auth.d.ts
│   ├── attendance.d.ts
│   ├── employee.ts
│   ├── employee-profile.d.ts
│   ├── general.d.ts
│   ├── leave.d.ts
│   └── work-time.d.ts
│
├── validations/                      # Zod validation schemas
│   ├── auth-validation.ts
│   ├── attendance-validation.ts
│   ├── employee-validation.ts
│   ├── employee-profile-validation.ts
│   ├── leave-validation.ts
│   └── menu-validation.ts
│
└── middleware.ts                     # Auth middleware (redirect to /login)
```

---

## Architecture

### High-Level Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│   Browser    │────▶│  Middleware   │────▶│   App Router    │────▶│ Supabase │
│  (React 19)  │     │ (auth check) │     │ (Server Actions) │     │   (DB)   │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────┘
       │                                          │                      │
       │  Zustand (auth)                          │  Zod validation      │  RLS
       │  React Query (data)                      │  FormState return    │  Triggers
       │  React Hook Form (forms)                 │                      │  Realtime
       ▼                                          ▼                      ▼
```

### Request Lifecycle

1. **Middleware** intercepts every request → verifies Supabase session → redirects to `/login` if unauthenticated
2. **Layout** reads `user_profile` cookie → passes profile to `AuthStoreProvider` → hydrates Zustand store
3. **Page components** use React Query to fetch data via server actions
4. **Mutations** go through server actions: Zod validation → Supabase operation → return `FormState`
5. **Real-time updates** (attendance) flow through Supabase channels → invalidate React Query caches

### Route Groups

| Group          | Path Prefix           | Purpose                              |
| -------------- | --------------------- | ------------------------------------ |
| `(auth)`       | `/login`              | Authentication (no sidebar layout)   |
| `(dashboard)`  | `/admin/*`            | Admin features (with sidebar layout) |
| `(dashboard)`  | `/employee-*`         | Employee features (with sidebar)     |
| `(dashboard)`  | `/payment/*`          | Payment result pages                 |

---

## Database Schema

### Entity Relationship Diagram

```
auth.users (Supabase Auth)
    │
    ├──── 1:1 ──── profiles
    │                 ├── id (PK, FK → auth.users)
    │                 ├── name
    │                 ├── role (admin | employee)
    │                 └── avatar_url
    │
    └──── 1:1? ──── employees
                      ├── id (PK)
                      ├── user_id (FK → auth.users, nullable)
                      ├── full_name, position, phone_number
                      ├── is_active, join_date
                      │
                      ├──── 1:N ──── attendance_records
                      │                 ├── employee_id (FK)
                      │                 ├── date, clock_in, clock_out
                      │                 ├── status (present|late|half_day|absent)
                      │                 └── UNIQUE(employee_id, date)
                      │
                      ├──── 1:N ──── leave_balances
                      │                 ├── employee_id (FK)
                      │                 ├── leave_type_id (FK → leave_types)
                      │                 ├── year, total_days, used_days
                      │                 ├── remaining_days (GENERATED)
                      │                 └── UNIQUE(employee_id, leave_type_id, year)
                      │
                      └──── 1:N ──── leave_requests
                                        ├── employee_id (FK)
                                        ├── leave_type_id (FK → leave_types)
                                        ├── start_date, end_date, total_days
                                        ├── status (pending|approved|rejected)
                                        └── approved_by, rejection_reason

leave_types
    ├── id (PK)
    ├── name (UNIQUE), max_days_per_year
    ├── requires_approval, allows_flexible_end_date
    └── is_active

work_time_config (singleton — max 1 row)
    ├── work_start_time, work_end_time (TIME)
    ├── late_threshold_minutes
    └── half_day_hours
```

### Key Database Features

| Feature                  | Implementation                                                        |
| ------------------------ | --------------------------------------------------------------------- |
| Auto profile creation    | Trigger `handle_new_user()` on `auth.users` INSERT                    |
| Auto profile deletion    | Trigger `handle_delete_user()` on `auth.users` DELETE                 |
| Auto timestamps          | Trigger `handle_updated_at()` on UPDATE for all tables                |
| Leave balance auto-sync  | Trigger `update_leave_balance_on_approval()` on leave request approval|
| One attendance per day   | `UNIQUE(employee_id, date)` constraint                                |
| Clock-out validation     | `CHECK(clock_out > clock_in)` constraint                              |
| Singleton config         | Unique index on `work_time_config` enforces single row                |
| Cascade deletes          | Employee deletion cascades to attendance and leave records            |

### Row Level Security (RLS)

All data tables have RLS enabled:

- **Employees**: can view and update only their own records
- **Admins**: full CRUD access to all records
- **Attendance**: employees view/update own; admins manage all
- **Leave balances**: employees view own; admins manage all
- **Leave requests**: employees create/view own; admins approve/reject

### Database Views

- `attendance_records_with_employee` — denormalized view joining attendance records with employee data (name, position) for admin dashboards

---

## Authentication & Authorization

### Login Flow

```
User submits email + password
        │
        ▼
login() server action
        │
        ├── Validate with Zod (loginSchemaForm)
        ├── supabase.auth.signInWithPassword()
        ├── Fetch profile from 'profiles' table
        ├── Set 'user_profile' cookie (30-day max-age, httpOnly)
        └── Return { role } for client redirect
                │
                ▼
    Client redirects based on role:
        admin    → /admin
        employee → /employee-dashboard
```

### Session Management

| Layer          | Mechanism                                                  |
| -------------- | ---------------------------------------------------------- |
| Middleware      | `updateSession()` verifies & refreshes Supabase JWT        |
| Cookie          | `user_profile` cookie stores profile data (30-day max-age) |
| Client Store    | Zustand `auth-store` hydrated from cookie via provider     |
| Database        | Supabase RLS enforces row-level access per user            |

### Supabase Client Variants

```typescript
// Browser client — client components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient() // uses ANON key

// Server client — server actions
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()                    // ANON key (regular user)
const supabase = await createClient({ isAdmin: true })   // SERVICE ROLE key (bypass RLS)

// Middleware client — session management
import { updateSession } from '@/lib/supabase/middleware'

// Default client — realtime subscriptions
import { supabase } from '@/lib/supabase/default'
```

### Logout Flow

```
signOut() server action
    ├── supabase.auth.signOut()
    ├── Delete 'user_profile' cookie
    └── Redirect to /login
```

---

## Server Actions

All data mutations use Next.js Server Actions (marked with `'use server'`).

### Pattern

```typescript
'use server'

export async function createEntity(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Parse and validate with Zod
  const validated = entitySchema.safeParse({
    field: formData.get('field'),
  })

  if (!validated.success) {
    return {
      status: 'error',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  // 2. Supabase operation
  const supabase = await createClient({ isAdmin: true })
  const { error } = await supabase
    .from('entities')
    .insert(validated.data)

  if (error) {
    return { status: 'error', errors: { _form: [error.message] } }
  }

  // 3. Return success
  return { status: 'success' }
}
```

### Return Type (`FormState`)

```typescript
type FormState = {
  status: 'success' | 'error'
  errors?: {
    [field: string]: string[]
    _form?: string[]  // general form-level errors
  }
}
```

### Server Action Locations

| Feature            | File                                                   | Actions                                       |
| ------------------ | ------------------------------------------------------ | --------------------------------------------- |
| Auth               | `app/(auth)/login/actions.ts`                          | `login`                                       |
| Global Auth        | `actions/auth-action.ts`                               | `signOut`                                     |
| Employees          | `app/(dashboard)/admin/employee/actions.tsx`            | `create`, `update`, `delete`                  |
| Users              | `app/(dashboard)/admin/user/actions.ts`                | `create`, `update`, `delete`                  |
| Attendance         | `app/(dashboard)/admin/attendance/actions.ts`           | `getAll`, `create`, `update`, `delete`, `clockIn`, `clockOut` |
| Leave Requests     | `app/(dashboard)/admin/leave/actions.ts`                | `approve`, `reject`, etc.                     |
| Leave Types        | `app/(dashboard)/admin/leave-types/actions.ts`          | `create`, `update`, `delete`                  |
| Leave Balance      | `app/(dashboard)/admin/leave-balance/actions.ts`        | `assignLeaveBalance`                          |
| Work Time          | `app/(dashboard)/admin/work-time/actions.ts`            | `updateWorkTimeConfig`                        |
| Employee Leave     | `app/(dashboard)/employee-leave/actions.ts`             | `createLeaveRequest`                          |
| Employee Profile   | `app/(dashboard)/employee-profile/actions.ts`           | `updateProfile`                               |

---

## State Management

### Zustand — Global Auth State

```typescript
// src/stores/auth-store.ts
interface AuthStore {
  user: User | null
  profile: Profile         // { id, name, role, avatar_url }
  setUser: (user) => void
  setProfile: (profile) => void
}
```

Hydrated on mount via `AuthStoreProvider`:
1. Reads `user_profile` cookie (set during login)
2. Calls `supabase.auth.getUser()` for current session
3. Populates Zustand store

### React Query — Server State

```typescript
// Data fetching pattern
const { data, isLoading } = useQuery({
  queryKey: ['admin-attendance', page, limit, search, filter],
  queryFn: () => getAllAttendance({ page, limit, search, filter }),
})

// Mutation pattern
const mutation = useMutation({
  mutationFn: (formData) => createEmployee(formData),
  onSuccess: () => queryClient.invalidateQueries(['employees']),
})
```

Configuration: `refetchOnWindowFocus: false` to reduce unnecessary refetches.

### React Hook Form — Form State

```typescript
const form = useForm<EmployeeFormValues>({
  resolver: zodResolver(employeeFormSchema),
  defaultValues: EMPLOYEE_INITIAL_STATE,
})
```

---

## Component Architecture

### Feature Module Pattern

Each feature follows a consistent file structure:

```
feature/
├── _components/
│   ├── feature.tsx                # Main display (table + toolbar)
│   ├── form-feature.tsx           # Form with validation
│   ├── dialog-create-feature.tsx  # Create dialog wrapping form
│   ├── dialog-update-feature.tsx  # Update dialog wrapping form
│   └── dialog-delete-feature.tsx  # Delete confirmation dialog
├── actions.ts                     # Server actions
├── page.tsx                       # Route entry point
└── layout.tsx                     # Optional nested layout
```

### Shared Components

| Component              | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `app-sidebar.tsx`      | Collapsible sidebar with role-based menu items   |
| `data-table.tsx`       | Generic table with pagination and limit selector |
| `form-input.tsx`       | Input wrapped with label and error display       |
| `form-select.tsx`      | Select wrapped with label and error display      |
| `form-image.tsx`       | Image upload with preview                        |
| `form-phone-input.tsx` | Phone input with +62 (Indonesia) prefix          |
| `form-combobox.tsx`    | Searchable select (combobox)                     |
| `dialog-delete.tsx`    | Reusable delete confirmation dialog              |
| `dropdown-action.tsx`  | Table row action menu (edit, delete)             |
| `attendance-status-badge.tsx` | Color-coded attendance status badge       |
| `darkmode-toggle.tsx`  | Theme switcher (light/dark)                      |

### UI Primitives (shadcn/ui)

30+ components based on Radix UI: Button, Input, Select, Dialog, Table, Card, Badge, Avatar, Popover, Tooltip, Dropdown, Sheet, Skeleton, Form, Tabs, Separator, Command, and more.

---

## Custom Hooks

### `useDataTable`

Manages pagination, search, and filter state for data tables.

```typescript
const {
  currentPage,    handleChangePage,
  currentLimit,   handleChangeLimit,
  currentSearch,  handleChangeSearch,
  currentFilter,  handleChangeFilter,
} = useDataTable()
```

### `useAttendanceRealtime`

Subscribes to Supabase realtime channels for live attendance updates.

```typescript
useAttendanceRealtime({
  onInsert: (record) => { /* new clock-in */ },
  onUpdate: (record) => { /* clock-out or status change */ },
  onDelete: (record) => { /* record removed */ },
})
```

- Listens for INSERT, UPDATE, DELETE on `attendance_records`
- Auto-invalidates React Query caches
- Tracks connection status

### `useDebounce`

Debounces a value (default 500ms) — used for search inputs to avoid excessive queries.

### `useIsMobile`

Returns `true` when viewport width < 768px. Used for responsive sidebar behavior.

---

## Validation

### Dual Validation Strategy

1. **Client-side** — React Hook Form with Zod resolver for instant feedback
2. **Server-side** — Zod validation in server actions for security

### Validation Schemas

| Schema File                      | Schemas                                                     |
| -------------------------------- | ----------------------------------------------------------- |
| `auth-validation.ts`             | `loginSchemaForm`, `createUserSchema`, `updateUserSchema`   |
| `employee-validation.ts`         | `employeeFormSchema`, `employeeSchema`                      |
| `attendance-validation.ts`       | `clockInSchema`, `clockOutSchema`, `createAttendanceSchema`, `updateAttendanceSchema`, `dateRangeSchema` |
| `leave-validation.ts`            | `leaveRequestSchema`, `approveLeaveSchema`, `rejectLeaveSchema`, `leaveTypeSchema` |
| `employee-profile-validation.ts` | `employeeProfileFormSchema`, `employeeProfileSchema`        |

### Notable Validation Rules

- Phone numbers must follow Indonesian format (`+62`)
- `clock_out` must be after `clock_in`
- Leave request dates validated for logical order
- All user-facing error messages are in **Indonesian**

---

## Real-time Features

The admin attendance dashboard receives live updates via Supabase Realtime:

```
Supabase DB (attendance_records)
        │
        │  INSERT / UPDATE / DELETE
        ▼
Supabase Realtime Channel
        │
        ▼
useAttendanceRealtime hook
        │
        ├── Invalidates React Query cache
        ├── Calls onInsert/onUpdate/onDelete callbacks
        └── UI re-renders with fresh data
```

**Setup:**
- Migration `008-enable-realtime-attendance.sql` enables realtime on the `attendance_records` table
- `src/lib/supabase/default.ts` provides a direct Supabase client (not SSR) for channel subscriptions
- `useAttendanceRealtime` hook manages subscription lifecycle and cleanup

---

## Styling & Theming

### Tailwind CSS v4

- CSS variables define the color palette and spacing
- Dark mode via `next-themes` with class strategy
- `cn()` utility (clsx + tailwind-merge) for conditional class composition

### shadcn/ui Configuration

```json
{
  "style": "new-york",
  "tailwind": { "baseColor": "neutral", "cssVariables": true }
}
```

### Fonts

- **Geist Sans** — primary UI font
- **Geist Mono** — code/monospace font
- Loaded via `next/font/google` from Vercel

---

## Environment Configuration

All environment variables are accessed through `src/configs/environment.ts` for type safety:

| Variable                           | Scope        | Purpose                    |
| ---------------------------------- | ------------ | -------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`         | Client + Server | Supabase project URL    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Client + Server | Supabase anonymous key  |
| `SUPABASE_SERVICE_ROLE_KEY`        | Server only  | Admin operations (bypass RLS) |
| `NEXT_PUBLIC_MIDTRANS_API_URL`     | Client + Server | Midtrans payment API URL |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`  | Client + Server | Midtrans client key      |
| `MIDTRANS_SERVER_KEY`              | Server only  | Midtrans server key        |

### Next.js Configuration

- **Turbopack** enabled for development
- **Server Actions** body size limit: `10mb` (for file uploads)
- **Image domains** configured for Supabase storage

---

## Constants & Localization

### Status Enums with UI Metadata

Attendance and leave statuses include color mappings for consistent badge rendering:

| Status       | Color   | Used In          |
| ------------ | ------- | ---------------- |
| `present`    | Green   | Attendance       |
| `late`       | Yellow  | Attendance       |
| `half_day`   | Orange  | Attendance       |
| `absent`     | Red     | Attendance       |
| `pending`    | Yellow  | Leave requests   |
| `approved`   | Green   | Leave requests   |
| `rejected`   | Red     | Leave requests   |

### Localization

- All validation error messages are in **Indonesian**
- Currency formatting uses **Indonesian Rupiah (IDR)** via `convertIDR()` utility
- Phone input defaults to **+62** (Indonesia country code)

### Sidebar Navigation

**Admin menu:** Dashboard, Users, Employees, Attendance, Leave, Leave Types, Leave Balance, Work Time

**Employee menu:** Dashboard, Attendance, Leave, Profile
