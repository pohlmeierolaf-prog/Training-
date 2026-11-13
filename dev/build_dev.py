#!/usr/bin/env python3
"""Erzeugt dev/app-dev.html: die Seite mit lokalem Mock von window.claude und den exportierten Daten.
Starten:  python3 dev/build_dev.py && python3 -m http.server 8000   ->  http://localhost:8000/dev/app-dev.html"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "src" / "kraftplan.html").read_text(encoding="utf-8")
mock = (root / "dev" / "mock-claude.js").read_text(encoding="utf-8")
data = (root / "data" / "sessions-export.json").read_text(encoding="utf-8")
inject = f"<script>\n{mock}\nif (!localStorage.getItem('mockdb:data/users/local-user')) window.mockImport({data});\n</script>\n"
marker = "<script>"  # erstes Script der App
i = html.index(marker)
(root / "dev" / "app-dev.html").write_text(html[:i] + inject + html[i:], encoding="utf-8")
print("dev/app-dev.html geschrieben")
