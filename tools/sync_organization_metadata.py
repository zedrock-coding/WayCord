#!/usr/bin/env python3
"""
Backward compatibility wrapper for tools/sync_brand_docs.py
"""

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
import sync_brand_docs

if __name__ == "__main__":
    sync_brand_docs.sync()
