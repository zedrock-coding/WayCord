# Waypoint End User License Agreement (EULA)

**Effective Date:** August 15, 2026  
**Last Updated:** November 15, 2026

---

## 1. Agreement & Acceptance

This End User License Agreement ("EULA") is a binding legal contract between you (either an individual or a legal entity, "User", "You", or "Your") and **[INSERT_LEGAL_ENTITY_NAME_HERE]** ("Organization", "Licensor", "We", "Us", or "Our") governing your access to and use of the **Waypoint** task execution and workspace management application ("Application", "Software", or "Service").

BY DOWNLOADING, INSTALLING, REGISTERING AN ACCOUNT, OR USING WAYPOINT, YOU AGREE TO BE BOUND BY THE TERMS OF THIS EULA. IF YOU DO NOT AGREE, DO NOT INSTALL OR USE THE APPLICATION.

---

## 2. License Grant & Service Tiers

Subject to compliance with this Agreement, Licensor grants you a non-exclusive, non-transferable, revocable, limited license to install and use Waypoint across authorized platforms according to your service tier:

1. **Free Core Tier (Local-First):** Personal, single-user task execution utilizing on-device local storage (Hive). Includes natural language processing, priority organization, and local notifications.
2. **Pro Tier:** Multi-device synchronization, cloud encrypted backups, advanced recurrence intervals, and extended AI task breakdown capabilities.
3. **Institutional & Team Tier:** Multi-seat organizational governance, collaborative shared workspaces, community task boards, and administrative audit logging.

---

## 3. Local Data Architecture & Backup Liability

1. **Local-First Paradigm:** Waypoint stores tasks, categories, subtasks, and offline mutation queues directly on your local device. 
2. **User Backup Responsibility:** You acknowledge that you are responsible for maintaining device integrity and connectivity. Licensor is not liable for data loss arising from operating system cache purges, unrooted device formatting, hardware malfunction, or unflushed offline queues resulting from extended disconnection.
3. **Optimistic Synchronization:** Offline actions are committed locally first and synchronized asynchronously upon connection restoration. In the event of competing edits from multiple offline sessions, last-write-wins (LWW) resolution based on UTC timestamps applies.

---

## 4. Institutional Terms & Role-Based Governance

For users participating in an Institutional or Team deployment, access and editing permissions are governed by Weighted Role-Based Access Control (RBAC):

1. **Owner (Weight 3):** Full organization administration, billing, workspace creation, and member role assignment. Cannot be demoted or removed by lower-tier roles.
2. **Admin (Weight 2):** Workspace management, member invites, and task delegation. Cannot demote or alter Owner accounts.
3. **Member (Weight 1):** Workspace collaboration, task creation, assignment execution, and commenting (subject to task update comment quotas).
4. **Guest / Viewer:** Scoped, read-only visibility into specified tasks without modification rights.
5. **Administrative Audit Logging:** Institutional administrators may review organizational task metrics, velocity scores, and workspace activity feeds for compliance and resource allocation.

---

## 5. Prohibited Conduct

You agree not to:
1. Decompile, reverse engineer, disassemble, or derive the source code of Waypoint, except to the extent permitted by applicable open-source licenses.
2. Circumvent, modify, or defeat Row-Level Security (RLS) policies, authentication mechanisms, or AI rate-limit quotas.
3. Deploy automated scripts, bots, or scrapers to extract data from Waypoint servers or services.
4. Transmit illegal, harmful, harassing, or infringing content through shared task descriptions, comments, or workspaces.

---

## 6. Intellectual Property

Waypoint, including its logos, UI design system (Dark Slate `#1E2124` / Mint Green `#88C0A4`), documentation, and proprietary heuristic engines, is the intellectual property of **[INSERT_LEGAL_ENTITY_NAME_HERE]** and its licensors. All rights not expressly granted herein are reserved.

---

## 7. Disclaimer of Warranties & Limitation of Liability

1. **"As-Is" Provision:** TO THE MAXIMUM EXTENT PERMITTED BY LAW, WAYPOINT IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
2. **Liability Cap:** TO THE EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OF OR INABILITY TO USE WAYPOINT. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE SERVICE IN THE PRECEDING TWELVE (12) MONTHS, OR USD $10.00, WHICHEVER IS GREATER.

---

## 8. Governing Law & Jurisdiction

This EULA shall be governed by, and construed in accordance with, the laws of **Applicable Local Jurisdiction**. Any legal dispute arising under or relating to this Agreement shall be subject to the exclusive jurisdiction of the competent courts within that territory.

---

## 9. Contact & Inquiries

For legal notices or questions regarding this EULA:
- **Licensor:** [INSERT_LEGAL_ENTITY_NAME_HERE]
- **Support & Notices:** support@waypoint.internal
- **Privacy Contact:** privacy@waypoint.internal
