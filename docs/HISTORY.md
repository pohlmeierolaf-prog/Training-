# Chronik (Auszug der wichtigsten Entscheidungen und Fehlerursachen)

## Start
- Ausgangsdatei `kraftplan-2.html` (localStorage-App) wurde als Artifact mit `db` + `user` veröffentlicht. Der Server verlangte `<!DOCTYPE html>` am Dateianfang.
- Später wurde eine Fassung von Opus 5.5 aus einem zweiten Account übernommen (`kraftplan-3`): Wiederholversuche beim Speichern, `draftDiffers`, `dateForDay`, Vibration am Timer-Ende, längere Fehlertoasts.

## Behobene Fehler (Ursache → Lösung)
1. **Werte verschwanden nach „Speichern“ / leere Ansicht beim Öffnen**: Die Seite baut zuerst leere Entwürfe, die DB-Daten kommen später; Entwürfe überschrieben die Anzeige. → Beim Snapshot werden unberührte/identische Entwürfe verworfen. (Regression in `kraftplan-3`, wo „weicht vom Gespeicherten ab“ leere Entwürfe behielt, behoben mit `draftTouched`.)
2. **Speichern „ohne Wirkung“**: Fehler wurden verschluckt. → Kontrolllesen nach `set()`, Fehlertoasts, `window.onerror`-Toast, Ansicht bleibt nach Speichern auf „Training“.
3. **Pausen-Timer dauerhaft sichtbar** (`display:grid` überschrieb `hidden`) → verdeckte Felder/Speichern-Button → `.timer[hidden]{display:none}`, Timer lässt Tipps durch, verschwindet beim Tippen.
4. **Eingaben/Haken reagierten nicht**: Handler griffen auf gelöschte Entwürfe zu (TypeError) → `draftFor()` legt bei Bedarf neu an; Eingabefelder 44 px hoch; Textmarkierung (Chrome „Tippen, um Suchergebnisse zu sehen“) per `user-select:none` verhindert (Inputs ausgenommen); asynchrone Neuaufbauten warten, solange der Nutzer tippt.
5. **Sprung in den Tab „Verlauf“ nach Tipp auf Speichern**: Ursache nicht sicher geklärt (siehe OPEN-ISSUES). Maßnahmen: Tab-Tipp nur nach `pointerdown` auf dem Tab, nicht kurz nach anderem Tipp, Sperre beim Speichern, Warnung bei ungespeicherten Änderungen.
6. **Statistik unplausibel**: Haltezeit-/Absprung-Markierungen gingen beim erneuten Speichern aus einem alten Entwurf verloren; Kraft-Zahl aus Sprung-Sätzen widersprach dem Volumen → Kraft nur aus bewegtem Gewicht.

## Funktionen (Reihenfolge der Entstehung)
Statistik-Popup (Volumen) → Plateau-Warnung → zwei Prozentwerte (gesamt/Vorwoche) statt Diagramm → Stange 20 kg automatisch addiert (`bar`) → Körpergewicht-Volumen für Klimmzüge/Liegestütze (Absprung 0,6, Fußhöhe) → Haltezeit-Schalter → Wochenzähler → Bandauswahl Klimmzüge (später Pallof) → Kraft-Kennzahl (Epley) → neue Rückenübungen.

## Planänderungen
Chin-ups an Ringen → neutral, Ziel 3×8–12 (Absprung, später Band) · Hammer-Curls 3 Sätze · Liegestütze mit 3 s runter/1–2 s halten, kein Rucksack · Rückenstabilität verteilt (Suitcase Carry Mo, Pallof Mi statt Bird-Dog, Seitstütz Sa) · Military Press (Langhantel stehend) → einarmiges KH-Drücken halbknien (Start 16 kg) wegen Rückenrisiko · Ab-Wheel → Knee to Elbow.
Gespräch zu Equipment/Erholung: Deload-Woche alle ~6 Wochen, Mini-Scheiben und Bänder sinnvoll, Ring-Dips vorerst nicht (Schulter/Sehne), Squat-Rack/Bank wegen Platz nicht.

## Code-Review und Update (13.11.2026, Claude Code)
Behoben: (1) Alte Einheiten mit entfernten Übungen (`militarypress`, `abwheel`) galten immer als „ungespeichert“, und erneutes Speichern hätte diese Einträge gelöscht → Fremd-Einträge bleiben erhalten und zählen nicht als Abweichung. (2) Klimmzüge mit Band/Absprung bekamen „+2,5 kg“ statt „Hilfe abbauen“; Pallof „stärkeres Band“. (3) Neuer Tag mit offenem Entwurf aktualisierte „heute“ nicht. (4) Nach DB-Abbruch lief die App still im Browser-Speicher weiter → Modus „offline“ mit Vormerk-Warteschlange und Neuverbindung; Speichern vor dem Verbinden landet ebenfalls in der Warteschlange. (5) Doppeltipp auf Speichern → Sperre. (6) `limit(400)` → 1000. (7) `t` bei Tempo-Übungen immer gespeichert. Kleinkram: Heute-Punkt am Sonntag, Kommentar `dateForDay`, Guard im Haken-Handler, Escaping von DB-Werten im Verlauf, Zeitübungen „Ziel 40 s“ statt „40 Wdh.“.
Vereinfacht: totes `statChart` + CSS entfernt, Datums-Helfer (`addDays`, `weekStart`), `fmt(n, digits)`, eine Lastfunktion `setLoad` für Volumen und Kraft, Mini-Kurven aus `statSeries`, Dark-Mode per `light-dark()`, Tab-Handler zusammengefasst, Blätter (Statistik/Einstellungen) gemeinsam.
Neu: Einstellungen (Körpergewicht, Band-kg, Band-Faktor + Messen, Ton, Bildschirm an), Export/Import JSON, Deload-Hinweis, Wochenübersicht, Bestwerte, Notiz pro Einheit, Zeit unter Spannung, Supersatz-Ablauf, Teil-Updates statt Neuaufbau.
Zahlen der Statistik mit den Exportdaten alt/neu verglichen: identisch, außer Suitcase Carry (Hauptwert jetzt 80 s statt 1.280 kg·s, kg·s als Zusatzzeile) und den neuen Progressionstexten. Nutzerdaten nicht verändert.

## Manuelle Datenkorrekturen in der DB (auf Aussage des Nutzers)
- 2026-10-21_mi: Klimmzüge als `j:true` (mit Absprung) markiert.
- 2026-10-23_fr und 2026-10-30_fr: Liegestütze als `t:true` (Haltezeit) markiert (23.10. wurde einmal durch erneutes Speichern wieder überschrieben und neu gesetzt).
- 2026-11-04_mi: Klimmzüge und Pallof mit `b:30` (lila Band) markiert.
- 2026-11-12_do: `abwheel` → `kneeelbow` (2×10) umbenannt.
- 2026-11-18_mi (neue App): Pallof beide Sätze `b:30` → `bs:[10,30]` (lila + grün), Wiederholungen 8/12 unverändert. Nutzer hat grün in den Einstellungen auf 5 kg gesetzt.
- Früher: Einträge, die versehentlich falsch datiert waren (z. B. Power Cleans doppelt am 12./13.10.), sind laut Stand noch vorhanden (`2026-10-13_mo` ist die doppelte Einheit).

## Export-Stand
- Paket aktualisiert am 13.11.2026: 26 Einheiten (letzte: `2026-11-13_fr`), Statistik-Snapshot in `docs/STATS-SNAPSHOT.md`. Die App-Datei enthält seit dem Code-Review (siehe oben) Änderungen, die noch veröffentlicht werden müssen.

## Band-Kombination (18.11.2026)
Nutzer schaffte Pallof mit Rot nicht und nahm Lila + Grün zusammen. Neu: Zusatzband-Auswahl (Pallof und Klimmzüge), gespeichert als `bs`, Statistik rechnet die Summe der Band-kg. Alte Einträge (`b`) unverändert gültig.

## Umzug (13.11.2026)
- Neue App https://claude.ai/artifact/5PuWzbmHKTxpJM9W6xPr12 im Hauptkonto (Capabilities db, user, downloads). Die 26 Einheiten aus `data/sessions-export.json` wurden unverändert nach `data/users/<uid>` kopiert. Die alte App (anderes Konto) bleibt unverändert bestehen.
