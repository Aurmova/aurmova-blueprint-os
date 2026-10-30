#!/usr/bin/env python3
"""AURMOVA synthetic-only backup encryption verification; no network, D1, or real files.

This is a review harness, NOT a production backup, export, or restore program.
Requires cryptography. Run with --synthetic-self-test only.
"""
import argparse
import hashlib
import json
import os
import struct
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

ACCOUNT = "6b7eab5acb9dcc35ef11ddb0fdcd5a3b"
BRANCH = "fix/staging-p0-booking-customer-history-20261028"
DATABASES = {
    "aurmova-booking-staging": "68dcbf69-cb79-4dbb-94d1-4e9e33bfd036",
    "aurmova-private-staging": "0783ec25-8819-49df-b360-fe1ef87dda0c",
}
MAGIC = b"AURMOVA-SYNTHETIC-ENC-v1\x00"
PASSWORD = b"synthetic-only-password-never-use-with-real-data"

def scope(account, branch, name, dbid):
    if account != ACCOUNT or branch != BRANCH or DATABASES.get(name) != dbid:
        raise ValueError("Database scope rejected")

def seal(data, password, name, dbid):
    scope(ACCOUNT, BRANCH, name, dbid)
    if len(password) < 16:
        raise ValueError("Short test password")
    salt, nonce = os.urandom(16), os.urandom(12)
    metadata = json.dumps({"name": name, "id": dbid, "account": ACCOUNT, "branch": BRANCH}, sort_keys=True).encode()
    header = MAGIC + struct.pack(">H", len(metadata)) + metadata + salt + nonce
    key = hashlib.pbkdf2_hmac("sha256", password, salt, 600000, dklen=32)
    return header + AESGCM(key).encrypt(nonce, data, header)

def unseal(payload, password, name, dbid):
    scope(ACCOUNT, BRANCH, name, dbid)
    if not payload.startswith(MAGIC):
        raise ValueError("Invalid format")
    pos = len(MAGIC)
    if len(payload) < pos + 2:
        raise ValueError("Truncated header")
    length = struct.unpack(">H", payload[pos:pos+2])[0]
    pos += 2
    if length > 4096 or len(payload) < pos + length + 44:
        raise ValueError("Truncated payload")
    metadata = json.loads(payload[pos:pos+length])
    if metadata != {"name": name, "id": dbid, "account": ACCOUNT, "branch": BRANCH}:
        raise ValueError("Wrong database metadata")
    pos += length
    salt, nonce = payload[pos:pos+16], payload[pos+16:pos+28]
    pos += 28
    key = hashlib.pbkdf2_hmac("sha256", password, salt, 600000, dklen=32)
    return AESGCM(key).decrypt(nonce, payload[pos:], payload[:pos])

def test():
    for name, dbid in DATABASES.items():
        data = ("-- SYNTHETIC ONLY: " + name + "\nCREATE TABLE demo (id INTEGER);\n").encode()
        encrypted = seal(data, PASSWORD, name, dbid)
        assert unseal(encrypted, PASSWORD, name, dbid) == data
        assert encrypted != seal(data, PASSWORD, name, dbid)
        for modified in (encrypted[:-1] + bytes([encrypted[-1] ^ 1]), encrypted[:-3]):
            try:
                unseal(modified, PASSWORD, name, dbid)
            except (InvalidTag, ValueError):
                pass
            else:
                raise AssertionError("Corruption accepted")
        try:
            unseal(encrypted, b"incorrect-synthetic-password", name, dbid)
        except InvalidTag:
            pass
        else:
            raise AssertionError("Wrong password accepted")
        try:
            unseal(encrypted, PASSWORD, "production", dbid)
        except ValueError:
            pass
        else:
            raise AssertionError("Production accepted")
        print("PASS synthetic-only", name)
    print("No Cloudflare contact, export, restore, deployment or backup occurred.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--synthetic-self-test", required=True, action="store_true")
    parser.parse_args()
    test()
