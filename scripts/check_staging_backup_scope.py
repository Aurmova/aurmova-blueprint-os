#!/usr/bin/env python3
"""Offline safety checks for the AURMOVA staging backup configuration.

This script does not use credentials, contact Cloudflare, or modify databases.
"""
import sys

ACCOUNT_ID = "6b7eab5acb9dcc35ef11ddb0fdcd5a3b"
ALLOWED_DATABASES = {
    "aurmova-booking-staging": "68dcbf69-cb79-4dbb-94d1-4e9e33bfd036",
    "aurmova-private-staging": "0783ec25-8819-49df-b360-fe1ef87dda0c",
}

def validate():
    assert len(ALLOWED_DATABASES) == 2
    assert len(set(ALLOWED_DATABASES.values())) == 2
    assert all("staging" in name for name in ALLOWED_DATABASES)
    assert all(len(identifier) == 36 for identifier in ALLOWED_DATABASES.values())
    assert len(ACCOUNT_ID) == 32
    return True

if __name__ == "__main__":
    if not validate():
        sys.exit(1)
    print("Staging-only allowlist checks passed. No backup was performed.")
