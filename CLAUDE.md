# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an HRIS (Human Resource Information System) application built with Next.js 15, React 19, TypeScript, and Supabase. The application manages employees, users, attendance tracking, and includes payment integration with Midtrans.

## Development Commands

```bash
# Start development server (uses Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The development server runs on http://localhost:3000 by default.

## Architecture

### Route Structure

The application uses Next.js App Router with route groups:

- `(auth)/` - Authentication routes (login)
- `(dashboard)/` - Protected dashboard routes with sidebar layout
  - `/admin/` - Admin-only routes (employee, user, attendance management)
  - `/attendance/` - Attendance tracking and order management
  - `/payment/` - Payment success/failed pages

### Data Layer

**Supabase Client Patterns:**
- `src/lib/supabase/client.ts` - Browser client for client-side operations
- `src/lib/supabase/server.ts` - Server client with cookie management
  - Use `createClient({ isAdmin: true })` to get service role client for admin operations
  - Default uses anon key for regular operations
- `src/lib/supabase/middleware.ts` - Session management in middleware

**Server Actions Pattern:**
Each feature module has an `actions.ts(x)` file containing server actions:
- Located colocated with route files (e.g., `src/app/(dashboard)/admin/employee/actions.tsx`)
- Follow the pattern: validation with Zod → Supabase operation → return FormState
- Return type follows `{ status: 'success' | 'error', errors?: {...} }` pattern

**Database:**
- SQL migrations in `src/migrations/`
- Tables: `profiles`, `employees`, and others
- Row Level Security enabled on tables

### State Management

- **Zustand** for global auth state (`src/stores/auth-store.ts`)
- **React Query** for server state and data fetching (wrapped in `ReactQueryProvider`)
- **React Hook Form** + **Zod** for form validation

### Component Architecture

**UI Components:**
- Based on shadcn/ui with "new-york" style
- Located in `src/components/ui/`
- Use Radix UI primitives and Tailwind CSS v4

**Common Components:**
- `src/components/common/` - Shared reusable components
  - `data-table.tsx` - Generic data table component
  - `form-*.tsx` - Form field components (input, select, image)
  - `dialog-delete.tsx` - Reusable delete confirmation dialog

**Feature Components:**
Each feature follows a consistent pattern with `_components/` directory:
- `dialog-create-*.tsx` - Create dialog
- `dialog-update-*.tsx` - Update dialog
- `dialog-delete-*.tsx` - Delete dialog
- `form-*.tsx` - Form component with validation
- Main display component (e.g., `employee.tsx`, `user.tsx`)

### Custom Hooks

- `use-data-table.tsx` - Pagination, search, filtering state management
- `use-debounce.tsx` - Debounce utility for search inputs
- `use-mobile.ts` - Responsive breakpoint detection
- `use-pricing.tsx` - Pricing calculations

### Type Safety

- Type definitions in `src/types/*.d.ts` and `src/types/*.ts`
- Validation schemas in `src/validations/*-validation.ts` using Zod
- FormState pattern for server actions with typed errors

### Configuration

- Path alias `@/*` maps to `src/*`
- Environment variables in `src/configs/environment.ts`:
  - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Midtrans: `NEXT_PUBLIC_MIDTRANS_API_URL`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_SERVER_KEY`

### Middleware

- Authentication middleware in `src/middleware.ts`
- Updates session on every request except static assets
- Matcher pattern excludes `_next/static`, images, and `favicon.ico`

### Styling

- Tailwind CSS v4 with CSS variables for theming
- Dark mode support via `next-themes`
- Geist fonts (sans and mono) from Vercel

## Key Patterns

1. **Server Actions** are marked with `'use server'` directive and handle all mutations
2. **Profile data** is stored in cookies and hydrated into Zustand store via `AuthStoreProvider`
3. **Admin operations** use service role key via `createClient({ isAdmin: true })`
4. **Form validation** happens both client-side (React Hook Form) and server-side (Zod in actions)
5. **Toasts** for user feedback via Sonner (`src/components/ui/sonner.tsx`)

## Database Schema Notes

- The `profiles` table has triggers for auto-creation/deletion on auth user changes
- The `employees` table references `auth.users` with cascade delete
- Check `src/migrations/` for full schema definitions when adding new tables or modifying existing ones
