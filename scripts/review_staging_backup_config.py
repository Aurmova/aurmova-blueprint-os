#!/usr/bin/env python3
"""Offline-only review of AURMOVA staging backup settings.

No Cloudflare requests, no credentials, no SQL exports, no GitHub Actions triggers.
"""
from pathlib import Path
import ast
import uuid

EXPECTED = {
    "aurmova-booking-staging": "68dcbf69-cb79-4dbb-94d1-4e9e33bfd036",
    "aurmova-private-staging": "0783ec25-8819-49df-b360-fe1ef87dda0c",
}

def check(path: Path) -> None:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    assignments = {
        target.id: node.value
        for node in tree.body
        if isinstance(node, ast.Assign)
        for target in node.targets
        if isinstance(target, ast.Name)
    }
    actual = ast.literal_eval(assignments["ALLOWED_DATABASES"])
    if actual != EXPECTED:
        raise ValueError("Staging database allowlist mismatch")
    for database_id in actual.values():
        uuid.UUID(database_id)
    print("Staging database allowlist verified. No export performed.")

if __name__ == "__main__":
    check(Path(__file__).with_name("check_staging_backup_scope.py"))
