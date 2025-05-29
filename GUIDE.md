
# Track-My-Bills App: Comprehensive Guide

## 1. Introduction

**Track-My-Bills** is a web application designed to help users efficiently manage their monthly bills, track due dates, amounts, payment statuses, and recurrence.

**Core Technologies:**
*   **Frontend Framework:** Next.js (with App Router)
*   **UI Library:** React
*   **Component Library:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript
*   **Authentication & Hosting:** Firebase (Authentication, App Hosting)
*   **PWA:** `@ducanh2912/next-pwa` for service worker and offline capabilities.

## 2. Core Features

### 2.1. Bill Management

Users can perform full CRUD (Create, Read, Update, Delete) operations on their bills.

*   **Adding New Bills:**
    *   Navigate to `/add-bill`.
    *   The form (`src/components/BillForm.tsx`) allows input for bill name, amount, due date, category, recurrence type, and recurrence start date.
    *   New bills are initially marked as unpaid.
*   **Viewing Bill Details:**
    *   Accessible by clicking the "View" (eye) icon on a bill item in the dashboard.
    *   Navigates to `/bill/[id]` (e.g., `src/app/bill/[id]/page.tsx`).
    *   Displays all information for a specific bill, including paid status and recurrence details.
*   **Editing Existing Bills:**
    *   Accessible from the bill details page (`/bill/[id]`).
    *   Navigates to `/edit-bill/[id]` (e.g., `src/app/edit-bill/[id]/page.tsx`).
    *   Uses the same `src/components/BillForm.tsx`, pre-filled with the bill's current data.
*   **Deleting Bills:**
    *   Available on the bill item in the dashboard.
    *   Includes a confirmation dialog before permanent deletion.
*   **Marking Bills as Paid/Unpaid:**
    *   Checkboxes on each bill item in the dashboard allow users to toggle the paid status.
*   **Monthly View & Navigation:**
    *   The main dashboard (`src/app/page.tsx`) displays bills for the currently selected month.
    *   Users can navigate to previous or next months.
    *   Bill data is managed by the `src/hooks/useBills.ts` hook, currently using `localStorage`.

### 2.2. Recurring Bills

*   When adding or editing a bill, users can specify if it repeats:
    *   **Recurrence Types:** None, Weekly, Bi-Weekly, Monthly, Quarterly, Yearly (`src/lib/types.ts`).
    *   **Recurrence Start Date:** Users can pick a start date for the recurrence.
*   This information is stored with the bill and displayed in the bill details and item view. (Note: Automatic generation of future bill instances based on recurrence is not yet implemented).

## 3. User Interface & Experience

*   **Responsive Design:** The application is built with Tailwind CSS and ShadCN UI components, ensuring it adapts to various screen sizes (desktop, tablet, mobile).
*   **Theme Customization (`src/components/ThemeProvider.tsx`, `src/app/globals.css`):**
    *   Located in the `AppHeader` (`src/components/AppHeader.tsx`).
    *   **Color Schemes:** Users can choose between Teal, Blue (Default), and Orange.
    *   **Appearance Modes:** Light (Default) and Dark modes are available, overriding system preference if selected.
*   **Upcoming Bills Snapshot (`src/components/UpcomingBillsWidget.tsx`):**
    *   Displayed on the main dashboard.
    *   Shows a summary for the current month: Total Due, Unpaid Bills count, Paid Bills count.
    *   Highlights the next bill(s) due, especially if multiple share the same earliest due date. This section is scrollable on mobile if many bills are due.
    *   Designed to be compact on mobile views.

## 4. Authentication

*   **Firebase Authentication (`src/lib/firebase.ts`, `src/contexts/AuthContext.tsx`):**
    *   **Email/Password:** Users can sign up and log in using their email and password.
    *   (Social Logins - Google/Apple: Temporarily disabled in UI pending OAuth configuration resolution).
*   **Route Protection:**
    *   Core application pages (dashboard, add/edit/view bill) require user authentication.
    *   Unauthenticated users attempting to access protected routes are redirected to `/login`.
    *   Logged-in users attempting to access `/login` or `/signup` are redirected to the dashboard.
*   **User Session Management:** Firebase handles user session persistence.
*   **UI:** Login (`/login`) and Signup (`/signup`) pages, and user status/logout in `AppHeader`.

## 5. Progressive Web App (PWA) Features

The application is enhanced to function as a PWA.

*   **Installable ("Add to Home Screen"):**
    *   A `public/manifest.json` file describes the app to the browser.
    *   Meta tags in `src/app/layout.tsx` enable PWA behavior.
    *   Users on supported mobile browsers can add the app to their home screen for an app-like experience.
*   **App Icons (`public/icons/`):**
    *   A set of icons is provided for different device requirements and home screen appearance.
*   **Offline Capabilities (Service Worker):**
    *   Uses `@ducanh2912/next-pwa` to generate and manage a service worker (`public/sw.js`).
    *   The service worker caches app assets (HTML, CSS, JS, images), allowing the basic app shell to load even when offline (after the first visit). Full offline data functionality depends on data storage strategy.

## 6. Deployment

*   **Firebase Hosting:** The application is configured for deployment to Firebase Hosting.
    *   `firebase.json`: Configures Firebase Hosting to use an App Hosting backend.
    *   `apphosting.yaml`: Provides configuration for the App Hosting (Cloud Run) environment.
    *   Deployment is done via the Firebase CLI (`firebase deploy --only hosting`).

## 7. Development & Build Process

*   **Environment Variables:** Firebase configuration is managed via `.env.local`.
*   **Build:** `npm run build` creates a production-ready Next.js application.
*   **Error Handling:** Build process includes TypeScript type checking and ESLint to catch errors early.

## 8. Future Considerations & Potential Next Steps (Discussed)

*   **Cloud Data Storage with Firebase Firestore:**
    *   Migrate bill data from `localStorage` to Firestore for authenticated users.
    *   This would enable data synchronization across devices.
    *   Could be offered as a premium feature tied to a subscription.
*   **Subscription Management:** Integrate a payment provider (e.g., Stripe) to manage subscriptions for premium features like cloud storage.
*   **Re-enabling Google/Apple Sign-In:** Resolve OAuth configuration issues to allow users to sign in with their Google or Apple accounts.
*   **Advanced PWA Features:** Implement more sophisticated caching strategies for dynamic data or background sync.
*   **Native App Store Presence:** Explore options like Trusted Web Activities (for Google Play Store) or other wrappers if a traditional app store listing becomes a high priority (this might require different technologies or approaches beyond the current Next.js PWA).
*   **Automated Generation of Recurring Bills:** Implement logic to automatically create future instances of recurring bills.

This guide provides a snapshot of the Track-My-Bills application's current state and the journey of its development.
