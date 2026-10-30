#!/usr/bin/env python3
"""AURMOVA staging backup ENCRYPTION REVIEW PROTOTYPE.

OFFLINE SYNTHETIC DATA ONLY. NOT A DATABASE BACKUP OR EXPORT TOOL.
This script does not connect to Cloudflare, GitHub, D1, or the network.
It does not read environment secrets, customer records, or existing files.
Not wired into any workflow, build, deployment, or scheduler.

Dependency for eventual offline review: cryptography (AESGCM).
DO NOT RUN until reviewed and separately approved.
"""
from __future__ import annotations

import hashlib
import os

# Fixed synthetic data, never read from a real file or database.
SAMPLE = b"-- synthetic example, not customer data\nCREATE TABLE demo (id INTEGER);\n"
AAD = b"AURMOVA:staging:synthetic-test:v1"
MAGIC = b"AURMOVA-TEST-AESGCM-v1\x00"


def seal_synthetic(plaintext: bytes, password: bytes) -> bytes:
    """Password-based authenticated encryption for offline test data only."""
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    if not password or len(password) < 16:
        raise ValueError("Synthetic test password must be at least 16 bytes")
    salt = os.urandom(16)
    nonce = os.urandom(12)
    key = hashlib.pbkdf2_hmac("sha256", password, salt, 600_000, dklen=32)
    ciphertext = AESGCM(key).encrypt(nonce, plaintext, AAD)
    return MAGIC + salt + nonce + ciphertext


def open_synthetic(payload: bytes, password: bytes) -> bytes:
    """Reject wrong password, modified ciphertext, or altered metadata."""
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    if not payload.startswith(MAGIC):
        raise ValueError("Invalid synthetic test format")
    offset = len(MAGIC)
    salt = payload[offset:offset + 16]
    nonce = payload[offset + 16:offset + 28]
    ciphertext = payload[offset + 28:]
    if len(salt) != 16 or len(nonce) != 12 or len(ciphertext) < 16:
        raise ValueError("Incomplete synthetic test payload")
    key = hashlib.pbkdf2_hmac("sha256", password, salt, 600_000, dklen=32)
    return AESGCM(key).decrypt(nonce, ciphertext, AAD)


def offline_self_test() -> None:
    """In-memory only; never creates files or touches databases."""
    from cryptography.exceptions import InvalidTag

    password = b"ONLY-A-SYNTHETIC-TEST-PASSWORD-NEVER-USE-IN-PRODUCTION"
    encrypted = seal_synthetic(SAMPLE, password)
    assert encrypted != SAMPLE
    assert open_synthetic(encrypted, password) == SAMPLE
    assert encrypted != seal_synthetic(SAMPLE, password)  # random salt/nonce

    tampered = bytearray(encrypted)
    tampered[-1] ^= 1
    try:
        open_synthetic(bytes(tampered), password)
    except InvalidTag:
        pass
    else:
        raise AssertionError("Tampering was not detected")

    try:
        open_synthetic(encrypted, b"INCORRECT-SYNTHETIC-PASSWORD")
    except InvalidTag:
        pass
    else:
        raise AssertionError("Incorrect password was accepted")

    print("Synthetic offline AES-GCM checks passed; NO DATABASE BACKUP PERFORMED.")


if __name__ == "__main__":
    offline_self_test()
