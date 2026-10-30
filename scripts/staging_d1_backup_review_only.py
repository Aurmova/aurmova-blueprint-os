#!/usr/bin/env python3
"""Staging D1 backup preflight and command planner. REVIEW ONLY.

No network, subprocess, Cloudflare calls, credentials, export, or filesystem writes.
Does NOT run a backup. Do not wire into Actions until separately approved.
"""
from __future__ import annotations
import argparse
import json
import re

ACCOUNT_ID = "6b7eab5acb9dcc35ef11ddb0fdcd5a3b"
DATABASES = {
    "aurmova-booking-staging": "68dcbf69-cb79-4dbb-94d1-4e9e33bfd036",
    "aurmova-private-staging": "0783ec25-8819-49df-b360-fe1ef87dda0c",
}
REPAIR_BRANCH = "fix/staging-p0-booking-customer-history-20261028"
SECRET_NAMES = ("CLOUDFLARE_D1_BACKUP_TOKEN", "AURMOVA_BACKUP_ENCRYPTION_KEY")


def verify_scope(account_id: str, branch: str, databases: dict[str, str]) -> None:
    if account_id != ACCOUNT_ID:
        raise ValueError("Unexpected Cloudflare account")
    if branch != REPAIR_BRANCH:
        raise ValueError("Not the isolated staging repair branch")
    if databases != DATABASES:
        raise ValueError("Unexpected database allowlist")
    if any(not name.endswith("-staging") for name in databases):
        raise ValueError("Non-staging database name")
    if any(not re.fullmatch(r"[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}", dbid) for dbid in databases.values()):
        raise ValueError("Malformed database ID")


def plan() -> dict:
    verify_scope(ACCOUNT_ID, REPAIR_BRANCH, DATABASES)
    return {
        "mode": "review_only",
        "execution_allowed": False,
        "network_allowed": False,
        "cloudflare_account_id": ACCOUNT_ID,
        "git_branch": REPAIR_BRANCH,
        "databases": DATABASES,
        "secret_names_only": list(SECRET_NAMES),
        "blocked_pending_review": [
            "Confirm read-only token can export D1 without modifying data",
            "Choose approved Cloudflare export API and handle async export safely",
            "Use authenticated encryption with protected key handling",
            "Verify restore/decrypt with synthetic test data",
            "Design branch-isolated trigger and artifact retention",
            "Obtain separate explicit approval for real database export",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--review-only", action="store_true", required=True)
    args = parser.parse_args()
    if not args.review_only:
        raise SystemExit("Review-only mode required")
    print(json.dumps(plan(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
