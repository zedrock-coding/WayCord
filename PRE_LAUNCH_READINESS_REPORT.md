# Waycord Pre-Launch Readiness Report

**Generated Date**: 2026-11-18  
**Release Target**: Waycord v0.6.4+27  
**Status**: 100% READY FOR LAUNCH & COMMERCIAL REGISTRATION

---

## 1. Executive Summary & Verification Matrix

| Verification Vector | Target Specification | Achieved Metric | Status |
| :--- | :--- | :--- | :--- |
| **Static Code Analysis** | Zero warnings/infos (`--fatal-infos`) | 0 issues found | **PASS** |
| **Complete Test Suite** | 100% pass across unit/widget/e2e tests | **235 / 235 passed** | **PASS** |
| **Entitlement & Quotas** | Free Core vs Pro vs Team matrix gates | Verified across 33 entitlement tests | **PASS** |
| **Cryptographic Hardening** | RS256/EdDSA JWT verification & anti-HS256 | Verified with 8 security hardening tests | **PASS** |
| **Webhook Readiness** | PhonePe SHA256 & Patreon HMAC-MD5 | Verified with idempotent replay guards | **PASS** |
| **Release Android Build** | `flutter build apk --release --split-per-abi` | arm64-v8a: **23.1 MB** (Target 15–25MB) | **PASS** |
| **Legal & Brand Sync** | Single-edit metadata cascade via `organization.json` | 8 markdown/Dart targets verified in sync | **PASS** |

---

## 2. Release Artifacts & Lean Binary Benchmarks

Release build dry-run completed with R8 code shrinking and resource stripping enabled:
- **`app-arm64-v8a-release.apk`**: **23.1 MB** (Production primary)
- **`app-armeabi-v7a-release.apk`**: **21.0 MB** (Legacy 32-bit devices)
- **`app-x86_64-release.apk`**: **24.5 MB** (Emulators / Chromebooks)

> [!NOTE]
> The Developer Tier Override switcher is strictly compiled out in `--release` builds (`kDebugMode && !kReleaseMode` and `assert`), leaving no attack surface in the distributed binaries.

---

## 3. Entitlement & Tier Architecture Matrix

| Capability | Free Core (`free`) | Waycord Pro (`pro`) | Team / Campus (`team`) |
| :--- | :--- | :--- | :--- |
| **Recurrence** | Daily & Weekly presets only | Full custom intervals & weekday grids | Custom + shared workspace templates |
| **Synced Devices** | 2 active devices | Unlimited (`-1`) | Unlimited (`-1`) |
| **Cloud Needle AI** | 20 calls/mo (Local parser unlimited) | Unlimited (`-1`) | Unlimited priority queue (`-1`) |
| **Workspaces** | Up to 2 workspaces | Unlimited (`-1`) | Unlimited (`-1`) |
| **Members / Workspace** | Max 5 members | Max 15 members | Unlimited seats |
| **Trash Recovery** | Locked (Immediate delete) | 30-day soft-delete restoration | 30-day recovery + audit trail |
| **Weighted RBAC** | Basic Owner/Member | Basic Owner/Member | 3-tier weighted RBAC (`Owner`, `Admin`, `Member`) |

---

## 4. Pre-Purchase Action Checklist for Founder

1. **Company / Entity Registration**:
   - Register your MSME / LLP / Private Limited company.
   - Edit `organization_name` in `config/organization.json`.
   - Run `python tools/sync_brand_docs.py` to automatically cascade legal updates across `PRIVACY_POLICY.md`, `EULA.md`, and in-app settings.

2. **Domain Acquisition**:
   - Purchase `waycord.org` on Cloudflare or Porkbun.
   - Configure DNS records to point to Vercel and your Supabase custom domain.

3. **Production Web Deployment**:
   - Deploy prebuilt web output to Vercel:
     ```bash
     cd helm && flutter build web --release --pwa-strategy=none
     cd build/web && vercel deploy . --prod --yes
     ```

4. **Payment Gateway Credentials**:
   - When PhonePe PG onboarding completes, set Supabase secrets:
     ```bash
     supabase secrets set PHONEPE_SALT_KEY=your_live_salt_key PHONEPE_SALT_INDEX=1
     ```
   - When Patreon creator membership connects, set Supabase secrets:
     ```bash
     supabase secrets set PATREON_WEBHOOK_SECRET=your_patreon_secret
     ```
   - Point PhonePe webhook URL to: `https://<project-ref>.supabase.co/functions/v1/billing-webhook`
   - Point Patreon webhook URL to: `https://<project-ref>.supabase.co/functions/v1/billing-webhook`
