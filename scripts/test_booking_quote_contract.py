#!/usr/bin/env python3
"""Synthetic-only AURMOVA booking pricing contract regression tests.

Offline: no Cloudflare, no GitHub API, no customer data, no database writes.
Mirrors the staging booking Worker's current pricing constants for review.
Run: python3 -m unittest scripts/test_booking_quote_contract.py
"""
import unittest

SERVICES = ("人生蓝图解析", "黄金流年蓝图解析", "关系蓝图解析", "亲子蓝图解析", "合作蓝图解析")
PRICES = {"人生蓝图解析": 168, "黄金流年蓝图解析": 188,
          "关系蓝图解析": 328, "亲子蓝图解析": 328, "合作蓝图解析": 388}
DEPOSIT = 68
COMBO_PRICE = 288

def quote(services):
    if not services or len(set(services)) != len(services) or any(s not in SERVICES for s in services):
        raise ValueError("Invalid services")
    total = sum(PRICES[s] for s in services)
    if "人生蓝图解析" in services and "黄金流年蓝图解析" in services:
        total -= PRICES["人生蓝图解析"] + PRICES["黄金流年蓝图解析"] - COMBO_PRICE
    deposit = len(services) * DEPOSIT
    return {"total": total, "deposit": deposit, "balance": total - deposit}

class BookingQuoteTests(unittest.TestCase):
    def test_each_deposit(self):
        for count in range(1, len(SERVICES) + 1):
            with self.subTest(count=count):
                self.assertEqual(quote(SERVICES[:count])["deposit"], count * 68)

    def test_combo(self):
        self.assertEqual(quote(SERVICES[:2]), {"total": 288, "deposit": 136, "balance": 152})

    def test_invalid(self):
        for selection in ([], ["儿童蓝图解析"], [SERVICES[0], SERVICES[0]]):
            with self.subTest(selection=selection), self.assertRaises(ValueError):
                quote(selection)

if __name__ == "__main__":
    unittest.main()
