# {{app_name}} Privacy Policy

**Effective Date:** August 15, 2026  
**Last Updated:** November 18, 2026

---

## 1. Identity & Scope

This Privacy Policy describes how **{{app_name}}** (https://{{app_domain}}, "the Application", "the Service"), operated by **{{organization_name}}** ("the Organization", "We", "Us", or "Our"), collects, uses, and safeguards information when you use our software across mobile, desktop, and web platforms.

For privacy-related questions, data subject access requests, or grievance redressal under applicable law, contact our data protection officer at **{{privacy_email}}**. For legal notices, contact **{{legal_email}}**. For general technical support, reach us at **{{support_email}}**.

---

## 2. Local-First Architecture & Data Residency Transparency

{{app_name}} is engineered around strict **local-first** and **privacy-by-design** principles:

1. **On-Device Sandboxed Storage:** Core personal task data—including tasks, subtasks, categories, routine cadences, and user preferences—resides locally on-device in encrypted Hive storage.
2. **Offline-First Functionality:** You can create, organize, edit, and complete tasks without an active internet connection. Offline mutations are buffered securely in a local `sync_queue` and coalesced until connectivity is restored.
3. **Data Residency & Compliance:** Cloud-synced data is hosted in Supabase data centers in **{{data_region}}**, fully complying with India's **Digital Personal Data Protection (DPDP) Act** and applicable data sovereignty mandates.
4. **Zero-RAM Audio Pipeline:** Spoken voice dictation and natural-language audio snippets captured for task creation are buffered only in temporary system storage (`Directory.systemTemp`), processed strictly for transcription and semantic slot extraction, and immediately purged upon completion. Raw audio streams are never permanently retained or stored on server infrastructure.

---

## 3. Sub-Processors & Service Providers

When cloud synchronization, collaboration, AI-assisted task extraction, or subscription features are activated, {{app_name}} engages the following audited third-party sub-processors:

### A. Supabase Inc. (Backend, Database & Storage)
- **Role:** Cloud database (PostgreSQL), user authentication, encrypted file attachments, and Realtime WebSocket state synchronization.
- **Data Residency:** Hosted in Mumbai, India (**{{data_region}}**).
- **Security:** Protected by PostgreSQL Row-Level Security (RLS) policies enforcing multi-tenant workspace isolation. Data in transit is encrypted using TLS 1.3; data at rest is encrypted with AES-256.

### B. Vercel Inc. (Edge CDN & Web Hosting)
- **Role:** Global Edge Content Delivery Network (CDN) hosting the {{app_name}} Web client application (https://{{app_domain}}) and static assets.
- **Data Handled:** Standard web request metadata (IP address, browser user-agent, cache headers) for security, DDoS protection, and low-latency asset delivery.

### C. Google LLC / Gemini API (Transient AI Task Extraction)
- **Role:** Natural language task parsing, milestone decomposition, and temporal deadline anchoring.
- **Model Mandate:** {{app_name}} routes extraction requests through dedicated `gemini-3.5-flash-lite` endpoints via authenticated server-side Edge Functions.
- **Data Minimization & Privacy:** Only the prompt text necessary for task synthesis is transmitted. Requests are processed statelessly and transiently; user inputs are never utilized to train foundation models.

### D. Payment Gateways & Membership Platforms (Upcoming / Integrations)
- **PhonePe Payment Gateway (PhonePe Private Limited):** For authorized billing, recurring subscriptions, and INR payment processing within India, processed in accordance with Reserve Bank of India (RBI) regulations and the DPDP Act.
- **Patreon (Patreon, Inc.):** For voluntary patron memberships, supporter tier verification, and community sponsorship perks.

---

## 4. Data Retention, Soft Deletion & Right to Erasure

1. **30-Day Soft Deletion Lifecycle:** Deleted tasks and workspace items are flagged with a `deleted_at` timestamp and retained in the Trash bin for **30 calendar days** for recovery, after which automated purge jobs permanently erase them.
2. **Account Deletion:** Users may delete their account at any time through **Settings > Account > Delete Account**. Initiating deletion triggers a secure server-side procedure (`delete_user_account()`) that immediately purges authentication credentials, owned workspaces, personal task records, and uploaded avatars.
3. **Local Cache Purge:** Uninstalling the application or selecting "Clear Local Cache" immediately wipes all local Hive boxes (`tasks`, `categories`, `sync_queue`) from physical device storage.

---

## 5. Security & Governance

- **Authentication:** Passwordless email OTP and passkey authentication. Session tokens are preserved in platform secure storage (Keychain on macOS/iOS, Keystore on Android, and secure browser cookies).
- **Access Control:** Multi-tenant Weighted Role-Based Access Control (RBAC: Owner = 3, Admin = 2, Member = 1) prevents unauthorized workspace modification or extraction.

---

## 6. Jurisdiction & Legal Compliance

This policy is governed by and construed in accordance with the laws of **{{jurisdiction}}**, in alignment with the Digital Personal Data Protection (DPDP) Act.

For inquiries, notices, or formal data requests, contact:
- **Organization:** {{organization_name}}
- **Website:** https://{{app_domain}}
- **Privacy Contact:** {{privacy_email}}
- **Legal Contact:** {{legal_email}}
- **General Inquiries:** {{support_email}}
