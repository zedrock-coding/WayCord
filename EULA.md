# Waycord End User License Agreement (EULA)

**Effective Date:** August 15, 2026  
**Last Updated:** November 18, 2026

---

## 1. Agreement & Acceptance

This End User License Agreement ("EULA") is a binding legal contract between you (either an individual or a legal entity, "User", "You", or "Your") and **[INSERT_LEGAL_ENTITY_NAME_HERE]** ("Organization", "Licensor", "We", "Us", or "Our") governing your access to and use of the **Waycord** task execution and workspace management application (https://waycord.org, "Application", "Software", or "Service").

BY DOWNLOADING, INSTALLING, REGISTERING AN ACCOUNT, OR USING Waycord, YOU AGREE TO BE BOUND BY THE TERMS OF THIS EULA. IF YOU DO NOT AGREE, DO NOT INSTALL OR USE THE APPLICATION.

---

## 2. License Grant & Service Tiers

Subject to compliance with this Agreement, Licensor grants you a non-exclusive, non-transferable, revocable, limited license to install and use Waycord across authorized platforms according to your service tier:

1. **Free Core Tier (Local-First):** Personal task execution utilizing on-device local storage (Hive). Includes natural language processing, priority organization, and local notifications.
2. **Pro Tier:** Multi-device synchronization, cloud encrypted backups, advanced recurrence intervals, and extended AI task breakdown capabilities.
3. **Institutional & Team Tier:** Multi-seat organizational governance, collaborative shared workspaces, community task boards, and administrative audit logging.

---

## 3. Local Data Architecture & Data Residency Transparency

1. **Local-First Paradigm:** Core task data resides locally on-device in encrypted Hive storage (`tasks`, `categories`, `sync_queue`).
2. **Data Residency:** Cloud-synced data is hosted in Supabase Mumbai (**ap-south-1 (Mumbai)**) in compliance with India's Digital Personal Data Protection (DPDP) Act.
3. **Sub-Processors & Payment Gateways:** Authorized third-party sub-processors include Supabase Inc. (database/auth), Vercel Inc. (web hosting), Google LLC (transient Gemini AI task parsing), PhonePe Payment Gateway (INR payment processing), and Patreon (membership support).
4. **User Backup Responsibility:** You are responsible for maintaining device security and connectivity. Licensor is not liable for data loss arising from operating system cache purges, unrooted device formatting, hardware malfunction, or unflushed offline queues resulting from extended disconnection.
5. **Optimistic Synchronization:** Offline actions are committed locally first and synchronized asynchronously upon connection restoration. In the event of competing edits from multiple offline sessions, last-write-wins (LWW) resolution based on UTC timestamps applies.

---

## 4. Institutional Terms & Role-Based Governance

For users participating in an Institutional or Team deployment, access and editing permissions are governed by Weighted Role-Based Access Control (RBAC):

1. **Owner (Weight 3):** Full organization administration, billing, workspace creation, and member role assignment. Cannot be demoted or removed by lower-tier roles.
2. **Admin (Weight 2):** Workspace management, member invites, and task delegation. Cannot demote or alter Owner accounts.
3. **Member (Weight 1):** Workspace collaboration, task creation, assignment execution, and commenting (subject to task update comment quotas).
4. **Guest / Viewer:** Scoped, read-only visibility into specified tasks without modification rights.
5. **Administrative Audit Logging:** Institutional administrators may review organizational task metrics, velocity scores, and workspace activity feeds.

---

## 5. Prohibited Conduct

You agree not to:
1. Decompile, reverse engineer, disassemble, or derive the source code of Waycord, except to the extent permitted by applicable open-source licenses.
2. Circumvent, modify, or defeat Row-Level Security (RLS) policies, authentication mechanisms, or AI rate-limit quotas.
3. Deploy automated scripts, bots, or scrapers to extract data from Waycord servers or services.
4. Transmit illegal, harmful, harassing, or infringing content through shared task descriptions, comments, or workspaces.

---

## 6. Intellectual Property

Waycord, including its logos, UI design system (Obsidian Dark `#111417` / Mint Green `#88C0A4`), documentation, and proprietary heuristic engines, is the intellectual property of **[INSERT_LEGAL_ENTITY_NAME_HERE]** and its licensors. All rights not expressly granted herein are reserved.

---

## 7. Disclaimer of Warranties & Limitation of Liability

1. **"As-Is" Provision:** TO THE MAXIMUM EXTENT PERMITTED BY LAW, Waycord IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
2. **Liability Cap:** TO THE EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OF OR INABILITY TO USE Waycord. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE SERVICE IN THE PRECEDING TWELVE (12) MONTHS, OR USD $10.00, WHICHEVER IS GREATER.

---

## 8. Governing Law & Jurisdiction

This EULA shall be governed by, and construed in accordance with, the laws of **India**. Any legal dispute arising under or relating to this Agreement shall be subject to the exclusive jurisdiction of the competent courts within that territory.

---

## 9. Contact & Inquiries

For legal notices or questions regarding this EULA:
- **Licensor:** [INSERT_LEGAL_ENTITY_NAME_HERE]
- **Website:** https://waycord.org
- **Support & Notices:** support@waycord.org
- **Legal Inquiries:** legal@waycord.org
- **Privacy Officer:** privacy@waycord.org
