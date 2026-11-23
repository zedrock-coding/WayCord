# Waycord 0.8.1 - Production Release 🚀

**Waycord** (https://waycord.org) is an AI-orchestrated task management workspace. Optimized for **Android**, **Windows**, and **Web**, Waycord provides a professional, reactive experience for real-time team collaboration and personal productivity. Operated by **Lakshya Jadhav**.

![Aesthetic](https://img.shields.io/badge/Aesthetic-Obsidian%20%26%20Mint-88C0A4)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Windows%20%7C%20Web-blue)
![Version](https://img.shields.io/badge/Version-0.8.1-green)
![License](https://img.shields.io/badge/License-Source--Available-orange)

---

## 📥 Download & Live Access

Get the latest build for your platform directly from the [Waycord Releases](https://github.com/zedrock-coding/WayCord/releases) page:

| Platform | Type | Direct Download Link |
| :--- | :--- | :--- |
| **Android** | APK (`release`) | [📲 Download Android APK](https://github.com/zedrock-coding/WayCord/releases/download/v0.7.1/waycord-v0.7.1.apk) |
| **Windows** | Setup Installer (`release`) | [💻 Download Windows App](https://github.com/zedrock-coding/WayCord/releases/download/v0.7.1/Waycord-v0.7.1+29-Setup.exe) |
| **Web** | Live Production PWA | [🌐 Launch Web App](https://waycord.org) |

*Alternative release mirrors: [Waycord GitHub Releases Archive](https://github.com/zedrock-coding/WayCord/releases)*

---

## 🌟 What's New in 0.8.1

### 🎨 Adaptive Light Theme Contrast
*   **Context-Adaptive Colors**: Eliminated washed-out, invisible text and dark container artifacts in light theme.
*   **Refined App Shell**: Adaptive navigation sidebar, sync pill, and appearance settings panels dynamically adapt to the active theme.

### 📥 Direct Binary Downloads on Marketing Site
*   **One-Click Installation**: Landing page now directly initiates Windows (.exe) and Android (.apk) binary downloads without detour.
*   **Release Archive Fallback**: Added direct links to older release versions.

---

## 🌟 What's New in 0.8.0

### 🌐 Modern SaaS Landing Page (Lapa Ninja Developer-Tool Pattern)
*   **High-Fidelity Obsidian Design**: Redesigned marketing portal using deep slate obsidian backgrounds (`#1E2124`), gradient text, and atmospheric radial glow.
*   **Interactive Desktop Mockup Window**: Realistic macOS-framed app preview with live task checkoffs, priority chips, category badges, and animated voice prompt input.
*   **Live Telemetry Metrics**: Highlights real metrics including `< 10ms` local-first writes, `100%` offline autonomy, `AES-256` encryption, and native 4-platform support.
*   **Bento Architecture Grid**: Visually demonstrates offline-first Hive queues, Gemini 3.5 Flash-Lite subtask decomposition, weighted RBAC hierarchy, and asymmetric offline JWT licensing.
*   **Flexible Pricing & Payments**: Monthly/Annual pricing switch with 20% discount badge, integrated PhonePe UPI / RuPay checkout for India, and Patreon for international users.
*   **Interactive FAQ Accordion**: Instant answers covering privacy, cloud encryption, cancellation, and the 5-day money-back guarantee.

### 💀 Zero-Layout-Shift Skeleton Loader
*   **Layout-Aligned Preload UI**: Full skeleton loader mirroring hero mockup, telemetry strip, bento cards, and pricing tables to prevent layout shift during SSR hydration.

### 🔒 Non-URL Operator Console & Security Hardening
*   **Hidden Admin Modal**: Replaced exposed URL paths with an in-memory, portal-rendered operator console triggered only via shortcut (`Ctrl/Cmd+Shift+A`).
*   **Strict Access Control**: Server-side session verification matching the operator whitelist (`lakshyajadhav15@gmail.com`).

### 🛑 Custom 404 & Service Disruption Pages
*   **Resilience & Routing**: Added dedicated `NotFoundPage` with route pill, `ServiceErrorPage` with expandable stack diagnostics, and `AppErrorWidget` replacing Flutter's default crash views.

### 📐 Proportional REM Spacing Engine
*   **CSS-Style `rem` Units for Flutter**: Dynamic spacing engine tied to ambient text scaler. Gaps, paddings, margins, and icons scale proportionally to prevent UI compression or sparse layouts across mobile and desktop.
*   **Safety Scale Bounds**: Clamped scaling bounds (0.8x to 1.35x) to eliminate screen boundary overflow on aggressive accessibility multipliers.

### 🧩 Discrete Controller & Presentation Decoupling
*   **Clean Architecture**: Isolated business logic, RBAC permissions, and AI synthesis out of UI widgets into pure ChangeNotifier controllers (`TodayViewController`, `TaskDetailController`).
*   **Passive UI**: Widgets now act strictly as rendering surfaces receiving view-state streams and delegating user intents.

### ⚡ Client Performance & Startup Time Optimization
*   **Deferred Service Bootstrap**: Web notifications and non-critical services are deferred until after the first frame (`addPostFrameCallback`), significantly improving First Contentful Paint (FCP) and Total Blocking Time (TBT).
*   **On-Demand Voice Staging**: Sherpa ONNX and TTS models are loaded on first voice interaction rather than during initial app launch.
*   **Mobile-Gated HomeWidgets**: HomeWidget bridge invocations are strictly gated to Android native devices, removing 18+ failing method channel calls on web and desktop.

### 🛡️ Responsive Header Layout Fix
*   **Header Overflow Protection**: Flexible constraints and responsive search inputs in `AppShell` header eliminating layout clipping and RenderFlex horizontal overflows on compact windows.

---

## [0.7.0] - 2026-11-18

### 🏢 Centralized Legal & Brand Architecture
*   **Centralized Organization Config**: Single source-of-truth metadata binding `config/organization.json` to legal agreements (EULA, Privacy Policy) and runtime brand constants (`BrandConfig`).
*   **India DPDP Compliance & Data Residency**: Transparent data governance documenting local-first encrypted Hive storage and cloud hosting in Supabase Mumbai (`ap-south-1 (Mumbai)`).
*   **Sub-Processor & Payment Transparency**: Full disclosure of audited sub-processors (Supabase, Vercel, Google Gemini) and upcoming payment gateways (PhonePe, Patreon).

### 🏢 Workspaces & Groups Management
*   **Workspace Header Context**: Displays selected workspace name prominently on top header across mobile and desktop with exit and member actions.
*   **Team Directory & Role Management**: Obsidian Precision member directory with explicit role badges (`OWNER`, `ADMIN`, `MEMBER`), interactive role changes, and member removal.

### 🔄 Recurring Tasks & Routines Visibility
*   **Cadence Engine Matching**: Automatic recognition of recurring routines via metadata and natural language cadence keywords (`daily`, `weekly`, `routine`).
*   **Persistent Worklist Visibility**: Recurring routines remain clearly visible regardless of completion status or future rollover date.

### ☀️ Dynamic Light Theme
*   **Theme-Adaptive Color System**: Instant, crisp transition between Obsidian Dark and Clean Light modes with adaptive surface, background, and typography tokens.

### 🎨 Precision Obsidian UI Overhaul & Header Polishing
*   **Branded Header**: Restored official Waycord diamond logo with rounded clipping, Geist typography, and adaptive flexible title wrapping.
*   **Zero Mobile Button Collisions**: Optimized mobile action bar eliminating overlapping text and buttons.
*   **Frosted Glass Command Center**: 12px blur BackdropFilter with translucent styling, displayed strictly on Today and Inbox views to prevent covering content.
*   **Obsidian About Screen**: Modernized About Waycord page with Obsidian design tokens and updated attribution to creator Lakshya Jadhav.

---

## 🌟 Architecture & Features

### 🎨 Obsidian Precision UI Overhaul & Typography
*   **Obsidian Dark Palette**: Modernized UI aesthetic with `#111417` base/surface, `#191C1F` low surface, `#1D2023` standard surface, `#272A2D` elevated surface, and `#88C0A4` mint accent.
*   **Geist & JetBrains Mono Fonts**: Typography powered by `google_fonts` pairing Geist for readable body and JetBrains Mono for monospace timestamps, task tags (`#TASK-XXXX`), and priority indicators.
*   **Waycord Diamond Vector Monogram**: Custom vector-painted geometric diamond emblem integrated throughout the navigation shell.

### 📱 Adaptive Responsive Navigation Architecture
*   **Desktop Shell (≥768px)**: Persistent 256px left sidebar with brand identity, keyboard shortcuts (`⌘N` Add Task, `⌘K` Search), views switcher, workspace directory, and sync badge. Bottom dock is omitted.
*   **Mobile Shell (<768px)**: Compact 56px bottom navigation bar with central `+` quick-action button and one-tap view switches. Sidebar is omitted.
*   **Omni Action Header**: Search input with keyboard triggering, instant Add Task CTA, AI Voice assistant button, notifications center, and user profile avatar.

### 📝 Slide-Over Task Creation Drawer with AI Decompose
*   **Slide-Over Presentation**: Smooth right slide-over drawer on desktop (`480px`) and responsive bottom sheet on mobile.
*   **AI Milestone Synthesis**: Preserved **"✨ AI Decompose"** feature utilizing `AiService.generateSubtasks()` to convert complex prompts into step-by-step checklists.
*   **Granular Scheduling**: Priority pills, calendar date & time pickers, recurring cadence rules (Daily, Weekly, Bi-Weekly, Monthly), and dynamic checklist management.

### 🗂️ Curated Filtered Views & Communities Hub
*   **Today's Focus**: Filterable feed (All Active, Recurring, High Priority, Completed) with progress counters and collapsible completed section.
*   **Inbox**: Shared team feed displaying tasks assigned by others across communities.
*   **Recurring**: Dedicated management of repeating cadence routines.
*   **Schedule Calendar**: Integrated `TableCalendar` with Obsidian styling and day-by-day task lists.
*   **Communities Hub**: Overview of team workspaces with one-tap Create and Join via Code dialogs.

---

## 🌟 Needle AI Task Reconciliation Engine
*   **Deterministic Cross-Verification**: Reconciles raw spoken speech transcripts against preliminary Gemini model extractions to eliminate hallucinations and retain core intent.
*   **Imperative Meta-Framing Sanitization**: Automatically strips conversational meta-framing (`"create a task saying"`, `"remind me to"`, `"please schedule"`) to produce concise canonical task titles.
*   **Relative Date & Temporal Anchoring**: Resolves relative phrases (`"tonight"`, `"tomorrow morning"`, `"today evening"`, `"in 2 hours"`) into normalized ISO-8601 timestamps against client time context.
*   **Sequential Subtask Milestone Extraction**: Decomposes multi-step spoken instructions (`first... then... also... finally...`) into discrete, trackable subtask checklists.
*   **Dual-Write Offline & Cloud Persistence**: Dual-writes verified tasks and subtask checklists directly to local Hive storage and Supabase cloud tables.
*   **Conversational Voice Disambiguation**: Engaging hands-free clarification turns via Sherpa-ONNX TTS playback when required details are ambiguous.

---

## 🚀 Getting Started

### Prerequisites
*   **Flutter SDK**: ^3.41 (Dart ^3.11)
*   **Supabase project**: backend authentication and database sync.
*   **Gemini API key**: deployed exclusively as Supabase function secret (`GEMINI_API_KEY`).

### Steps
1.  **Clone & Install**:
    ```bash
    git clone https://github.com/zedrock-coding/Waycord-App.git
    cd helm
    flutter pub get
    ```
2.  **Public configuration**:
    Edit `helm/web/config.js` and set the Supabase URL and publishable key (`sb_publishable_…`).
3.  **AI backend setup**:
    ```bash
    supabase functions deploy ai
    supabase secrets set GEMINI_API_KEY=your_key_here
    ```
4.  **Launch**:
    ```bash
    flutter run -d chrome
    ```

---

## 🔐 Security & Integrity
Waycord utilizes PostgreSQL Security Definer functions and Row Level Security (RLS) ensuring strict workspace isolation and tamper-proof multi-tenant security.

---

## 📄 License & Organization

Waycord is **source-available, not open source**. Operated by **[INSERT_LEGAL_ENTITY_NAME_HERE]**.

- **Source code**: proprietary, all rights reserved.
- **Compiled builds**: free to download, install, and use for personal or commercial purposes.

See [`LICENSE`](LICENSE) for complete terms. Contact **legal@waycord.org** or **support@waycord.org** for inquiries.
