# Waypoint / Waycord v0.7.1 — Unified Web Portal, Admin Console & Security Hardening 🛡️

[![Version](https://img.shields.io/badge/version-0.7.1--build.29-88C0A4?style=for-the-badge&labelColor=111417)](https://github.com/zedrock-coding/Waypoint-App/releases/tag/v0.7.1)
[![Engine](https://img.shields.io/badge/Flutter-3.x_Material_3-111417?style=for-the-badge&logo=flutter&logoColor=88C0A4)](https://flutter.dev)
[![Web Portal](https://img.shields.io/badge/TanStack-React_19_SSR-111417?style=for-the-badge&logo=react&logoColor=88C0A4)](https://tanstack.com/start)
[![Backend](https://img.shields.io/badge/Supabase-Auth_%26_Postgres_RLS-111417?style=for-the-badge&logo=supabase&logoColor=88C0A4)](https://supabase.com)
[![Offline](https://img.shields.io/badge/Storage-Hive_NoSQL_Local--First-111417?style=for-the-badge&logo=hive&logoColor=88C0A4)](https://pub.dev/packages/hive)
[![AI Orchestrator](https://img.shields.io/badge/Orchestrator-gemini--3.5--flash--lite-111417?style=for-the-badge&logo=google&logoColor=88C0A4)](https://ai.google.dev)

> **v0.7.0** unifies the high-performance TanStack Start marketing & billing portal (`/`) with the offline-first Flutter Web workspace (`/app/`), introduces a built-in Operator/Admin console (`/admin`), implements route-specific prehydration skeleton loaders, and hardens application security across authentication, webhooks, and secrets.

---

## 📦 Release Artifacts & Targets

| Platform | Distribution Target | Details / File | Status |
|---|---|---|---|
| **Web (Unified)** | Single-Domain Vercel Portal | `https://helm-omega-blue.vercel.app/` | `Verified & Live` |
| **Workspace SPA** | Flutter Web Workspace | `https://helm-omega-blue.vercel.app/app/` | `Verified (--base-href /app/)` |
| **Android** | `waycord-v0.7.0.apk` | `build/app/outputs/flutter-apk/waycord-v0.7.0.apk` | `Built via build.ps1` |
| **Windows Desktop** | `Waycord-v0.7.0-Setup.exe` | `build/windows/installer/Waycord-v0.7.0-Setup.exe` | `Built via package_windows.ps1` |

---

## 🌟 Key Engineering Enhancements & Fixes

### 1. 🌐 Unified Single-Domain Deployment Architecture
* **Single Vercel Edge Domain**:
  * Root path `/` serves TanStack Start SSR marketing, billing (`/billing`), upgrade (`/upgrade`), and authentication (`/login`).
  * Subpath `/app/` cleanly routes to the Flutter SPA workspace with local Hive storage and sync.
  * Serverless function entrypoint in `waycord-web/api/index.js` proxies SSR and payment webhook handlers cleanly without Nitro conflicts.

### 2. ⚡ Route-Aware Prehydration Skeleton Loaders
* **Zero Layout Shift Loading Experience**:
  * Handcrafted CSS/SVG route-aware skeletons load immediately in under 300ms while the Flutter engine initialises.
  * Distinct skeleton layouts matching Today view, Calendar view, and Settings view.
  * Smooth fade-out transition upon `flutter-first-frame` emission.

### 3. 🛡️ Operator & Admin Portal (`/admin`)
* **Built-in Operations Management**:
  * Protected via server-side session checks and admin email verification (`adminGuard.ts`).
  * Real-time metrics: active subscribers, MRR overview, feedback inbox, payment transaction audit log, and user tier management.
  * Service-role operations isolated strictly to server functions, never exposed to client bundles.

### 4. 🔒 Comprehensive Security Hardening
* **Fail-Closed Secrets Management**:
  * Removed all fallback mock keys from `supabase.ts`, `offlineLicense.ts`, `patreon.ts`, `phonepe.ts`, and Supabase Edge Functions.
  * Server functions and webhooks strictly require environment secrets and fail closed with descriptive 500 responses if unset.
* **Timing-Safe Crypto Comparisons**:
  * Replaced string comparison with `crypto.timingSafeEqual` across Patreon and PhonePe webhook signature verifications.
* **Unconditional Webhook Verification**:
  * Removed non-production signature bypasses so invalid signatures are rejected across all environments.

### 5. 🧩 Robust Error Handling & 404 Pages
* Added Material 3 Obsidian Precision error views: `NotFoundPage` (404), `ServiceErrorPage` (500), and `AppErrorBoundary`.
* Added static `404.html` fallback for CDN-level route misses.
