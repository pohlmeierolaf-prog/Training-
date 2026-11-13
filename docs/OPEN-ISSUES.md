# Offene Punkte

## Fehler, nicht sicher behoben
1. **Eingabefelder „frieren manchmal ein“** (Tipp ins Feld reagiert nicht). Vermutet: ungewollter Neuaufbau des DOM während des Tippens bzw. Chrome-Textmarkierung. Maßnahmen sind drin (siehe HISTORY 4), Wirkung unbestätigt. Idee: echtes Gerät mit Remote-Debugging oder Playwright/Chromium-Emulation (Touch) testen, Neuaufbau ganz vermeiden (Teil-Updates statt `innerHTML`), Speichern-Button als feste Leiste.
2. **Seltener Wechsel in „Verlauf“ nach Speichern** (Einheit war trotzdem gespeichert). Im Code gibt es keinen automatischen Wechsel; vermutlich fehlgeleiteter Tipp. Maßnahmen siehe HISTORY 5.

## Daten prüfen (Stand 13.11.2026)
- **Liegestütze am 13.11. ohne Haltezeit gespeichert** (`t` fehlt), davor am 30.10. und 6.11. mit `t:true`. Die Statistik zeigt deshalb −31 % zur Vorwoche (Volumen). Ob die Einheit wirklich ohne Haltezeit lief, ist offen (beim Nutzer nachfragen, nicht ungefragt ändern). Mögliche technische Ursache: ein älterer Entwurf im `localStorage` mit `t:false` oder ein versehentlicher Tipp auf den Schalter. Seit 11/2026 wird `t` bei Tempo-Übungen immer gespeichert, und der Schalter zeigt „Ohne Haltezeit“ deutlich an.
- Duplikat `2026-10-13_mo` (Power Cleans) ist noch gespeichert.

## Kalibrieren (Annahmen)
- Band-Faktor 0,3: jetzt in den Einstellungen messbar („Band-Faktor messen“: ein Satz ohne Hilfe und ein Satz mit Band im selben Training). Noch nicht gemessen.
- Welche Band-Farbe wie viel kg hat, ist nicht verifiziert (laut Decathlon: gelb 20, grün 10; lila 30 und rot 40 nach Aussage des Nutzers/Vermutung).
- `JUMP_FACTOR = 0.6`, `TEMPO_FACTOR = 1.5`, Liegestütz `0,64 + 0,002·cm`: Schätzungen.
- Körpergewicht ist jetzt einstellbar und wird pro Einheit gespeichert; ältere Einheiten rechnen mit 90 kg.

## Ideen / Backlog
- Face Pulls an Seilrolle (hintere Schulter), falls Seilrolle angeschafft wird.
- Falsch datierte Einheit `2026-10-13_mo` (Duplikat der Power Cleans vom 12.10.) im Verlauf löschen lassen.

## Nach dem Update 11/2026 auf dem Handy prüfen
- Farben: `light-dark()` braucht Chrome ≥ 123 / Safari ≥ 17.5. Bei älterem Browser wären die Farben weg.
- Export „Datei“: braucht die Capability `downloads` beim Veröffentlichen; sonst „Kopieren“ nutzen.
- Ton und Wake Lock im claude.ai-Rahmen (iframe): funktionieren nur, wenn der Rahmen es erlaubt; sonst still ohne Wirkung.
- Ob die Teil-Updates das Einfrieren der Eingabefelder beheben.
