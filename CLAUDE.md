# Arbeitsregeln für dieses Projekt

## Zusammenarbeit
- Nutzer: Olaf. **Antworten auf Deutsch, knapp und direkt.** Er diktiert oft; Nachrichten können Tippfehler enthalten („Rolls“ = Roll-outs).
- Vor Änderungen an Rechenannahmen (Faktoren, Formeln) kurz die Konsequenz in Zahlen nennen; Beispielzahlen **klar als Beispiel kennzeichnen** (ein erfundenes Beispiel wurde einmal für echte Daten gehalten).
- **Nutzerdaten nie ungefragt ändern.** Manuelle Korrekturen (siehe `docs/HISTORY.md`) nur auf ausdrückliche Aussage des Nutzers und mit Hinweis, was geändert wurde.
- Nach jeder Änderung: `node test/smoke.js`. Neue Kernpfade um einen Check ergänzen.

## Code-Konventionen
- Eine Datei: `src/kraftplan.html`, Vanilla-JS, kein Build. Datei beginnt mit `<!DOCTYPE html>`.
- Neue Felder in Einheiten **optional** und abwärtskompatibel halten (alte Dokumente müssen weiter funktionieren).
- Übungen, die aus `PLAN` entfernt werden, verschwinden aus Anzeige und Statistik, ihre Daten bleiben in der DB.
- `hidden`-Attribut und CSS-`display` nicht vermischen (der Pausen-Timer war deshalb dauerhaft sichtbar: `.timer[hidden]{display:none}`).
- UI-Neuaufbau (`render()`) darf nie während Eingabe/Touch passieren (siehe `softRender`/`flushPending`).
- Texte, Zahlenformat `de-DE` (Dezimalkomma), Typografie-Anführungszeichen „…“.

## Hinweise zur Person (vom Nutzer selbst berichtet, relevant für Übungsvorschläge)
- Körpergewicht 90 kg. Ziel: sichtbare Muskeln, dazu Gesundheit.
- Beschwerden: Bizepssehne (bei Chin-ups, Liegestützen, Ring-Liegestützen), Kreuz blockiert gelegentlich, Entzündung in der Hand (deshalb Knee-to-Elbow statt Ab-Wheel). Übungen daher eher schonend wählen, Tiefe/Last vorsichtig steigern, im Zweifel Arzt/Physio empfehlen.
- Möchte **kurze Einheiten** (Freitag „unter 8 Min.“), wenig Platz, keine Bank, kein Rack.
- Equipment: Langhantel (Stange 20 kg) + Scheiben, Kurzhanteln, Ringe an einem Deckenanker (seit Jahren genutzt, Beton-Zwischendecke), Decathlon-Loop-Bänder (grün 10, gelb 20, lila 30?, rot 40 – Zuordnung nicht sicher), Fitnessbänder, Liegestütz-Griffe. Optional erwogen: Seilrolle (37 €).
- Smartphone vermutlich Android/Chrome; Nutzung hauptsächlich am Handy, früh morgens.
