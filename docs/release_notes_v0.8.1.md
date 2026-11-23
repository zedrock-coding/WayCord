# Waycord v0.8.1 — Adaptive Light Theme, Direct Binary Releases & Auth Hardening 🛡️

[![Version](https://img.shields.io/badge/version-0.8.1--build.31-88C0A4?style=for-the-badge&labelColor=111417)](https://github.com/zedrock-coding/WayCord/releases/tag/v0.8.1)
[![Engine](https://img.shields.io/badge/Flutter-3.x_Material_3-111417?style=for-the-badge&logo=flutter&logoColor=88C0A4)](https://flutter.dev)
[![Web Portal](https://img.shields.io/badge/TanStack-React_19_SSR-111417?style=for-the-badge&logo=react&logoColor=88C0A4)](https://tanstack.com/start)
[![Backend](https://img.shields.io/badge/Supabase-Auth_%26_Postgres_RLS-111417?style=for-the-badge&logo=supabase&logoColor=88C0A4)](https://supabase.com)
[![Offline](https://img.shields.io/badge/Storage-Hive_NoSQL_Local--First-111417?style=for-the-badge&logo=hive&logoColor=88C0A4)](https://pub.dev/packages/hive)
[![AI Orchestrator](https://img.shields.io/badge/Orchestrator-gemini--3.5--flash--lite-111417?style=for-the-badge&logo=google&logoColor=88C0A4)](https://ai.google.dev)

> **v0.8.1** delivers adaptive light theme contrast rendering across the Flutter application shell and settings surfaces, provides direct binary download actions on the web marketing portal, and hardens OTP and cross-client session alignment.

---

## 📦 Release Artifacts & Distribution

| Platform | Distribution Target | File / Destination | Status |
|---|---|---|---|
| **Web Portal** | Vercel Edge Serverless | `https://waycord.org/` | `Verified & Deployed` |
| **Workspace App** | Flutter Web SPA (`/app`) | `https://waycord.org/app/` | `Built & Staged` |
| **Windows Desktop** | Setup Installer (`.exe`) | `Waycord-v0.7.1+29-Setup.exe` | `Direct Release Asset` |
| **Android Mobile** | APK Package (`.apk`) | `waycord-v0.7.1.apk` | `Direct Release Asset` |
| **Release Archive** | Historical Releases | `https://github.com/zedrock-coding/WayCord/releases` | `Linked on Portal` |

---

## 🌟 Key Fixes & Improvements

### 1. 🎨 Adaptive Light Theme Styling & Contrast
* **Dynamic Palette Inversion**:
  * Resolved low-contrast and washed-out text/icons where dark Obsidian theme tokens were statically applied to light mode.
  * Preserved compile-time `const` palette definitions in `lib/theme/app_theme.dart` while introducing context-adaptive color helpers.
  * Overhauled `AppShell` navigation sidebar, footer sync indicators, omni-search bar, notification trigger, and settings appearance box to react seamlessly to `ThemeMode.light`.

### 2. 📥 One-Click Direct Binary Downloads on Marketing Site
* **Streamlined User Acquisition**:
  * Direct file download links for Windows (`Waycord-v0.7.1+29-Setup.exe`) and Android (`waycord-v0.7.1.apk`) embedded directly on hero and footer call-to-actions.
  * Added fallback hypertext: *"If you want to download older versions, go here."* linking users directly to the GitHub release archive.

### 3. 🔐 Session & OTP Authentication Alignment
* **Cross-Application Auth Sync**:
  * Unified Supabase session handling between the marketing portal (`waycord-web`) and Flutter SPA workspace (`/app`).
  * Documented custom SMTP and OTP template configuration steps for direct numerical verification codes.

---

## 🧪 Verification Matrix

- `flutter analyze --fatal-infos`: 0 issues found across all Dart packages.
- `flutter test`: 242/242 unit and widget tests passing.
- `waycord-web`: Typecheck, Vite build, secret scanner, and sitemap/robots validation all passing cleanly.
