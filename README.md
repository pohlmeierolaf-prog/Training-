# Olafs Kraftplan – Projektübergabe an Claude Code

Trainings-Tracker (Einzeldatei, Vanilla-JS, iOS-ähnliche Oberfläche, Deutsch) für einen 6-Tage-Plan.
Läuft produktiv als **Artifact auf claude.ai** mit den Capabilities `db` und `user`; Link:
https://claude.ai/artifact/BU6mAtmeecxdMvYYcqz2ZT (privat, nur für Olaf).

## Inhalt
| Pfad | Zweck |
|---|---|
| `src/kraftplan.html` | **Die App** (aktueller Stand, ~55 KB, beginnt mit `<!DOCTYPE html>`). Einzige Produktivdatei. |
| `CLAUDE.md` | Arbeitsregeln für Claude Code (Sprache, Stil, Vorsicht bei Annahmen/Daten). |
| `docs/DATA-MODEL.md` | Datenbankformat, Plan-Felder, alle Rechenregeln und Konstanten. |
| `docs/HISTORY.md` | Chronik: Features, Entscheidungen, behobene Fehler samt Ursache, manuelle Datenkorrekturen. |
| `docs/OPEN-ISSUES.md` | Offene Probleme, Annahmen zum Kalibrieren, Ideen. |
| `data/sessions-export.json` | Alle 26 gespeicherten Einheiten, Stand 13.11.2026 – Testdaten und Backup. |
| `docs/STATS-SNAPSHOT.md` | Statistik von heute (13.11.2026) pro Übung, aus den Daten berechnet. |
| `dev/mock-claude.js`, `dev/build_dev.py` | Lokaler Mock von `window.claude` (db/user) zum Ausprobieren im Browser. |
| `test/smoke.js` | Smoke-Test ohne Browser (`node test/smoke.js`). |
| `reference/db.d.ts`, `reference/claude.d.ts` | Capability-Verträge von claude.ai (Referenz). |

## Schnellstart
```bash
node test/smoke.js                                   # muss "SMOKE OK" ausgeben
python3 dev/build_dev.py && python3 -m http.server 8000
# dann http://localhost:8000/dev/app-dev.html (läuft mit Mock-DB + exportierten Daten)
```

## Deployment (wichtig)
Claude Code kann **keine** Artifacts veröffentlichen. Ablauf nach Änderungen:
1. `src/kraftplan.html` ändern, `node test/smoke.js` ausführen.
2. Datei in einen claude.ai-Chat hochladen und schreiben: *„Veröffentliche diese Datei unverändert als neue Version von https://claude.ai/artifact/BU6mAtmeecxdMvYYcqz2ZT mit den Capabilities db und user.“* (Update desselben Artifacts, die Daten bleiben erhalten.)
3. Nutzer lädt die Seite neu und testet auf dem Handy.

Einschränkungen veröffentlichter Seiten: selbstenthalten (nur `cdnjs.cloudflare.com`, `cdn.jsdelivr.net/npm/`, `cdn.tailwindcss.com`, `code.jquery.com` als Script-Hosts; sonst keine Netzwerkzugriffe), < 16 MB, Datei muss mit `<!DOCTYPE html>` beginnen, `window.storage` und die Anthropic-API gibt es dort nicht. `localStorage` ist pro Betrachter vorhanden (immer in try/catch).
