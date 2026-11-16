# Waypoint Privacy Policy

**Effective Date:** August 15, 2026  
**Last Updated:** November 15, 2026

---

## 1. Identity & Scope

This Privacy Policy describes how **Waypoint** ("the Application", "the Service"), operated by **[INSERT_LEGAL_ENTITY_NAME_HERE]** ("the Organization", "We", "Us", or "Our"), collects, uses, and safeguards information when you use our software across mobile, desktop, and web platforms.

For privacy-related questions or data subject access requests, contact our privacy officer at **privacy@waypoint.internal**. For technical support, reach us at **support@waypoint.internal**.

---

## 2. Local-First Architectural Principles

Waypoint is engineered as a **local-first** productivity and task orchestration system.

1. **On-Device Storage:** Your tasks, subtasks, categories, and settings are written immediately to local, sandboxed Hive storage on your physical device. 
2. **Offline-First Functionality:** You can create, organize, edit, and complete tasks without an active internet connection. Offline mutations are buffered securely in a local `sync_queue` and coalesced until connectivity is restored.
3. **Zero-RAM Audio Pipeline:** Spoken voice inputs and audio snippets captured for natural-language task creation are written to temporary system storage (`Directory.systemTemp`), processed strictly for transcription and semantic slot extraction, and cleared from storage upon processing completion. Raw audio streams are never permanently retained on our servers.

---

## 3. Cloud Synchronization & Third-Party Sub-Processors

When cloud synchronization, collaboration, or AI-assisted task extraction features are activated, Waypoint engages the following audited infrastructure sub-processors:

### A. Supabase Inc. (Backend, Database & Storage)
- **Role:** Cloud database (PostgreSQL), user authentication, encrypted file attachments, and Realtime WebSocket replication.
- **Security:** Protected by PostgreSQL Row-Level Security (RLS) policies enforcing multi-tenant isolation and strict user-level authorization. Data in transit is encrypted using TLS 1.3; data at rest is encrypted with AES-256.

### B. Vercel Inc. (Edge CDN & Web Hosting)
- **Role:** Global Edge Content Delivery Network (CDN) hosting the Waypoint Web client application and static assets.
- **Data Handled:** Standard web request metadata (IP address, browser user-agent, cache headers) for security, DDoS protection, and low-latency asset delivery.

### C. Google LLC / Gemini API (Generative AI Task Extraction)
- **Role:** Generative AI task breakdown, natural language deadline parsing, and subtask synthesis.
- **Model Mandate:** Waypoint routes all AI extraction requests through the dedicated `gemini-3.5-flash-lite` model.
- **Data Minimization:** Only the text or audio prompt required for task parsing is transmitted via an authenticated server-side Edge Function. Prompts are processed statelessly and are not used to train global generative AI foundation models.

---

## 4. Data Retention, Soft Deletion & Right to Erasure

1. **30-Day Soft Deletion Lifecycle:** When a task or community item is deleted, it is flagged with a `deleted_at` timestamp and moved to the Trash bin. Items remain restorable for **30 calendar days**, after which automated database purge triggers permanently erase the records.
2. **Account Deletion:** Users may delete their account at any time through **Settings > Account > Delete Account**. Initiating deletion executes a secure server-side procedure (`delete_user_account()`) that immediately purges user authentication credentials, owned workspaces, personal task records, and uploaded avatars.
3. **Local Cache Purge:** Uninstalling the application or selecting "Clear Local Cache" immediately wipes all local Hive boxes (`tasks`, `categories`, `sync_queue`) from the device.

---

## 5. Security & Governance

We implement industry-standard cryptographic practices:
- **Authentication:** Secure email OTP and passkey passwordless authentication. Private session tokens are stored in platform secure storage (Keychain on macOS/iOS, Keystore on Android, and secure browser cookies).
- **Access Control:** Multi-tenant Weighted Role-Based Access Control (RBAC) ensures organization and workspace data cannot be accessed, modified, or exported by unauthorized members.

---

## 6. Jurisdiction & Legal Compliance

This policy shall be governed by and construed in accordance with the laws of **Applicable Local Jurisdiction**, without giving effect to any principles of conflicts of law.

For inquiries, notices, or formal data requests, contact:
- **Organization:** [INSERT_LEGAL_ENTITY_NAME_HERE]
- **Privacy Contact:** privacy@waypoint.internal
- **General Inquiries:** support@waypoint.internal
