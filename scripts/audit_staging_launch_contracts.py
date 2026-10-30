#!/usr/bin/env python3
"""AURMOVA read-only static contract audit. NO network, database or deployment.

Run from repository root: python3 scripts/audit_staging_launch_contracts.py
This tool reads source text only; no secrets, customer records, or writes.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "workers/booking-staging/index.js"
PRIVATE = ROOT / "src/data.js"
EXPECTED = ("人生蓝图解析", "黄金流年蓝图解析", "关系蓝图解析", "亲子蓝图解析", "合作蓝图解析")
DEPOSIT = 68

def js_array(text, name):
    m = re.search(r"(?:const|export const)\s+" + re.escape(name) + r"\s*=\s*(?:Object\.freeze\()?\[([^\]]+)\]", text)
    if not m:
        raise ValueError(f"Missing {name}")
    return tuple(re.findall(r"['\"]([^'\"]+)['\"]", m.group(1)))

def main():
    public, private = PUBLIC.read_text(encoding="utf-8"), PRIVATE.read_text(encoding="utf-8")
    findings = []
    services = js_array(public, "SERVICES")
    types = js_array(private, "CONSULTATION_TYPES")
    if services != EXPECTED:
        findings.append(f"FAIL: public booking service contract differs from five approved services: {services!r}")
    if types != EXPECTED:
        findings.append(f"REVIEW: private consultation types differ from booking: {types!r}")
    m = re.search(r"const\s+DEPOSIT_PER_PROJECT\s*=\s*(\d+)", public)
    if not m or int(m.group(1)) != DEPOSIT:
        findings.append("FAIL: booking deposit is not RM68 per project")
    if "TNG_PAYMENT_LINK_URL" not in public and "TNG_PAYMENT_LINK_URL" not in (ROOT / "workers/booking-staging/wrangler.toml").read_text(encoding="utf-8"):
        findings.append("REVIEW: no visible payment link configuration")
    if "localStorage" in (ROOT / "README.md").read_text(encoding="utf-8"):
        findings.append("REVIEW: README still documents localStorage; verify actual private-backend persistence")
    print("AURMOVA staging launch contract audit — read-only")
    for item in findings:
        print(item)
    if not findings:
        print("PASS: checked static contracts match; this is NOT an end-to-end test.")
    else:
        print("WARNING: findings require human review before launch.")
    return 1 if any(x.startswith("FAIL") for x in findings) else 0

if __name__ == "__main__":
    sys.exit(main())
