# Copilot instructions (easy-accounting-app)

## Big picture
- This is a **Vite + React + TypeScript** SPA.
- Routing is **react-router-dom** and is centralized in `src/App.tsx` (includes `ProtectedRoute` + page routes).
- Most “backend communication + client state” lives in a single **Zustand store**: `src/store/useAuthStore.ts`.
  - Pages/components call store actions (e.g. `fetchAccounts`, `createCompany`) instead of having per-page API clients.

## Dev workflows (repo-accurate)
- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build` (runs `tsc -b` then `vite build`)
- Lint: `npm run lint`
- Preview build: `npm run preview`

## Environment & API
- Backend base URL is `VITE_API_BASE_URL` (see `src/lib/config.ts`).
  - Defaults to `http://localhost:5003` when the env var is missing.
- Auth token storage:
  - Store writes `authToken` + `authUser` to `localStorage` on login (`useAuthStore.login`).
  - App bootstrap calls `useAuthStore.initialize()` from `src/App.tsx` to rehydrate auth state.
  - Requests use `Authorization: Bearer <token>` headers in the store.

## Project structure & patterns
- Pages live in `src/pages/*` and usually:
  - Wrap content in `DashboardLayout` (`src/components/layout/DashboardLayout.tsx`).
  - Call store actions in `useEffect` + manage local filter/pagination UI state (example: `src/pages/Accounts.tsx`).
  - Enforce role gating with `Navigate` when needed (example: `src/pages/Accounts.tsx`).
- Layout/nav:
  - `src/components/layout/Sidebar.tsx` filters nav items by `user.userRole`.
- UI components:
  - Tailwind + shadcn/Radix primitives in `src/components/ui/*`.
  - Use `cn()` helper from `src/lib/utils.ts` for class merging.

## Conventions to follow when editing
- Use the `@` path alias for imports (configured in `vite.config.ts` to point at `src`).
- Prefer adding new API calls/state to `src/store/useAuthStore.ts` (keep a consistent fetch + error handling style).
- For currency display, use `formatCurrency()` / `formatCurrencyForExport()` from `src/lib/utils.ts` (special-cases BDT).
- Toasts/notifications use `sonner` (`Toaster` is mounted in `src/App.tsx`; pages often call `toast.success`/`toast.error`).
