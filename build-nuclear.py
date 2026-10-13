#!/usr/bin/env python3
"""
Build a single-file, zero-dependency version of SnowAnsher.

Inlines CSS, every JS module, three.js and the favicon into ONE html file so it
works with a double-click (file://) with no server and no network access.

Usage:  python3 build-nuclear.py
Output: index-nuclear.html
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "index.html")
OUT = os.path.join(ROOT, "index-nuclear.html")


def read(rel):
    with open(os.path.join(ROOT, rel), "r", encoding="utf-8") as f:
        return f.read()


def build():
    with open(SRC, "r", encoding="utf-8") as f:
        html = f.read()

    missing = []

    # 1. Inline stylesheet
    css = read("style.css")
    html = html.replace(
        '<link rel="stylesheet" href="./style.css">',
        "<style>\n" + css + "\n</style>",
    )

    # 2. Inline favicon as a data URI (keeps file:// completely self-contained)
    favicon = read("favicon.svg")
    data_uri = "data:image/svg+xml;base64," + __import__("base64").b64encode(
        favicon.encode("utf-8")
    ).decode("ascii")
    html = html.replace('href="./favicon.svg"', 'href="' + data_uri + '"')

    # 3. Inline every <script src="..."> tag, in document order
    script_tags = re.findall(r'<script src="([^"]+)"></script>', html)

    def repl(match):
        src = match.group(1)
        try:
            code = read(src)
        except FileNotFoundError:
            missing.append(src)
            return match.group(0)
        return "<script>\n" + code + "\n</script>"

    html = re.sub(r'<script src="([^"]+)"></script>', repl, html)

    if missing:
        print("WARNING: missing files, left external:", missing)
        return None

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    count = len(script_tags)
    size = os.path.getsize(OUT)
    print(f"Written: {OUT} ({size // 1024} KB, {count} scripts inlined)")
    return OUT


if __name__ == "__main__":
    if not build():
        sys.exit(1)
