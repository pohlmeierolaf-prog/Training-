# Offene Punkte

## Fehler, nicht sicher behoben
1. **Eingabefelder „frieren manchmal ein“** (Tipp ins Feld reagiert nicht). Vermutet: ungewollter Neuaufbau des DOM während des Tippens bzw. Chrome-Textmarkierung. Maßnahmen sind drin (siehe HISTORY 4), Wirkung unbestätigt. Idee: echtes Gerät mit Remote-Debugging oder Playwright/Chromium-Emulation (Touch) testen, Neuaufbau ganz vermeiden (Teil-Updates statt `innerHTML`), Speichern-Button als feste Leiste.
2. **Seltener Wechsel in „Verlauf“ nach Speichern** (Einheit war trotzdem gespeichert). Im Code gibt es keinen automatischen Wechsel; vermutlich fehlgeleiteter Tipp. Maßnahmen siehe HISTORY 5.

## Daten prüfen (Stand 13.11.2026)
- **Liegestütze am 13.11. ohne Haltezeit gespeichert** (`t` fehlt), davor am 30.10. und 6.11. mit `t:true`. Die Statistik zeigt deshalb −31 % zur Vorwoche (Volumen). Ob die Einheit wirklich ohne Haltezeit lief, ist offen (beim Nutzer nachfragen, nicht ungefragt ändern). Mögliche technische Ursache: ein älterer Entwurf im `localStorage` mit `t:false`, der den neuen Standard „Haltezeit an“ überstimmt.
- Duplikat `2026-10-13_mo` (Power Cleans) ist noch gespeichert.

## Kalibrieren (Annahmen)
- `BAND_FACTOR = 0.3` (Band nimmt 30 % seines Werts ab): Mit Lila schaffte Olaf 7/6/6 statt 5/4/4 ohne Hilfe. Besser: im selben Training erst einen Satz ohne Hilfe bis nahe Versagen, dann Band-Sätze, Faktor daraus berechnen.
- Welche Band-Farbe wie viel kg hat, ist nicht verifiziert (laut Decathlon: gelb 20, grün 10; lila 30 und rot 40 nach Aussage des Nutzers/Vermutung).
- `JUMP_FACTOR = 0.6`, `TEMPO_FACTOR = 1.5`, Liegestütz `0,64 + 0,002·cm`: Schätzungen.
- `BODYWEIGHT = 90` ist fest im Code; bei Änderung des Gewichts anpassen (ggf. als Eingabe in der App).

## Ideen / Backlog
- Export/Import der Daten (JSON) in der App, damit Wechsel zwischen Accounts möglich ist.
- Körpergewicht und Band-Zuordnung einstellbar machen.
- Deload-Hinweis (alle ~6 Wochen oder bei mehreren Plateau-Warnungen).
- Face Pulls an Seilrolle (hintere Schulter), falls Seilrolle angeschafft wird.
- Falsch datierte Einheit `2026-10-13_mo` (Duplikat der Power Cleans vom 12.10.) im Verlauf löschen lassen.
- Prüfen, ob Zeitübungen (Suitcase Carry, Seitstütz) in der Statistik besser als „Zeit unter Spannung“ dargestellt werden sollen.
