#!/usr/bin/env python3
"""
Waypoint Organization & Legal Metadata Synchronizer
Synchronizes config/organization.json across legal documents, assets, and README.
"""

import json
import os
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(ROOT_DIR, "config", "organization.json")
ASSET_CONFIG_PATH = os.path.join(ROOT_DIR, "helm", "assets", "config", "organization.json")

def sync():
    if not os.path.exists(CONFIG_PATH):
        print(f"Error: {CONFIG_PATH} not found.")
        return

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    # 1. Mirror organization.json to flutter assets
    os.makedirs(os.path.dirname(ASSET_CONFIG_PATH), exist_ok=True)
    with open(ASSET_CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print(f"Mirrored configuration to {ASSET_CONFIG_PATH}")

    org_name = config.get("organization_name", "[INSERT_LEGAL_ENTITY_NAME_HERE]")
    app_name = config.get("application_name", "Waypoint")
    support_email = config.get("support_email", "support@waypoint.internal")
    privacy_email = config.get("privacy_contact", "privacy@waypoint.internal")
    jurisdiction = config.get("jurisdiction", "Applicable Local Jurisdiction")

    # 2. Update legal files if actual legal entity name is set
    legal_files = [
        os.path.join(ROOT_DIR, "helm", "assets", "Privacy_policy.md"),
        os.path.join(ROOT_DIR, "helm", "assets", "EULA.md"),
    ]

    for file_path in legal_files:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Substitute placeholder tokens
            content = content.replace("{{application_name}}", app_name)
            content = content.replace("{{support_email}}", support_email)
            content = content.replace("{{privacy_contact}}", privacy_email)
            content = content.replace("{{jurisdiction}}", jurisdiction)

            if org_name != "[INSERT_LEGAL_ENTITY_NAME_HERE]":
                content = content.replace("[INSERT_LEGAL_ENTITY_NAME_HERE]", org_name)

            with open(file_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(content)
            print(f"Synchronized legal document: {os.path.basename(file_path)}")

    print(f"Organization metadata synchronization complete. App: {app_name}, Entity: {org_name}")

if __name__ == "__main__":
    sync()
