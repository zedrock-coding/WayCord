# {{app_name}} 0.6.4 - Production Release 🚀

**{{app_name}}** (https://{{app_domain}}) is an AI-orchestrated task management workspace. Optimized for **Android**, **Windows**, and **Web**, {{app_name}} provides a professional, reactive experience for real-time team collaboration and personal productivity. Operated by **{{organization_name}}**.

![Aesthetic](https://img.shields.io/badge/Aesthetic-Obsidian%20%26%20Mint-88C0A4)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Windows%20%7C%20Web-blue)
![Version](https://img.shields.io/badge/Version-0.6.4-green)
![License](https://img.shields.io/badge/License-Source--Available-orange)

---

## 📥 Download & Live Access

Get the latest build for your platform directly from the [{{app_name}} Releases](https://github.com/zedrock-coding/Waycord-App/releases/latest) page:

| Platform | Type | Direct Download Link |
| :--- | :--- | :--- |
| **Android** | APK (`v0.6.4`) | [📲 Download Android APK](https://github.com/zedrock-coding/Waycord-App/releases/latest/download/waycord-v0.6.4.apk) |
| **Windows** | Executable (`v0.6.4`) | [💻 Download Windows App](https://github.com/zedrock-coding/Waycord-App/releases/latest/download/Waycord-v0.6.4-Setup.exe) |
| **Web** | Live Production PWA | [🌐 Launch Web App](https://{{app_domain}}) |

*Alternative release mirrors: [{{app_name}} GitHub Releases](https://github.com/zedrock-coding/Waycord-App/releases/latest)*

---

## 🌟 What's New in 0.6.4

### 🏢 Centralized Legal & Brand Architecture
*   **Centralized Organization Config**: Single source-of-truth metadata binding `config/organization.json` to legal agreements (EULA, Privacy Policy) and runtime brand constants (`BrandConfig`).
*   **India DPDP Compliance & Data Residency**: Transparent data governance documenting local-first encrypted Hive storage and cloud hosting in Supabase Mumbai (`{{data_region}}`).
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
*   **Branded Header**: Restored official {{app_name}} diamond logo with rounded clipping, Geist typography, and adaptive flexible title wrapping.
*   **Zero Mobile Button Collisions**: Optimized mobile action bar eliminating overlapping text and buttons.
*   **Frosted Glass Command Center**: 12px blur BackdropFilter with translucent styling, displayed strictly on Today and Inbox views to prevent covering content.
*   **Obsidian About Screen**: Modernized About {{app_name}} page with Obsidian design tokens and updated attribution to creator Lakshya Jadhav.

---

## 🌟 Architecture & Features

### 🎨 Obsidian Precision UI Overhaul & Typography
*   **Obsidian Dark Palette**: Modernized UI aesthetic with `#111417` base/surface, `#191C1F` low surface, `#1D2023` standard surface, `#272A2D` elevated surface, and `#88C0A4` mint accent.
*   **Geist & JetBrains Mono Fonts**: Typography powered by `google_fonts` pairing Geist for readable body and JetBrains Mono for monospace timestamps, task tags (`#TASK-XXXX`), and priority indicators.
*   **{{app_name}} Diamond Vector Monogram**: Custom vector-painted geometric diamond emblem integrated throughout the navigation shell.

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
{{app_name}} utilizes PostgreSQL Security Definer functions and Row Level Security (RLS) ensuring strict workspace isolation and tamper-proof multi-tenant security.

---

## 📄 License & Organization

{{app_name}} is **source-available, not open source**. Operated by **{{organization_name}}**.

- **Source code**: proprietary, all rights reserved.
- **Compiled builds**: free to download, install, and use for personal or commercial purposes.

See [`LICENSE`](LICENSE) for complete terms. Contact **{{legal_email}}** or **{{support_email}}** for inquiries.
