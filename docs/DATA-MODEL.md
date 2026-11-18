# Datenmodell und Rechenregeln

## Datenbank (`window.claude.use("db")`)
- Collection `data/users/<uid>` (uid aus `window.claude.use("user").id()`; für den Besitzer reicht `data/users/me` beim Lesen über das Artifact-Tool).
- Dokument-ID: `YYYY-MM-DD_<tag>` mit `<tag>` ∈ `mo|di|mi|do|fr|sa` (eine Einheit pro Datum und Tag).
- Dokument:
```json
{ "id": "2026-11-12_do", "date": "2026-11-12", "day": "do", "savedAt": "2026-11-12T05:15:18Z",
  "entries": { "frontsquat": [ {"w": 25, "r": 6}, ... ], "kneeelbow": [ {"w": null, "r": 10}, ... ] } }
```
- Satz-Objekt: `w` (Zahl|null) und `r` (Wiederholungen bzw. Sekunden|null), optional `j: true` (Klimmzug mit Absprung), `t` (Liegestütz mit Haltezeit 3 s runter / 1–2 s halten; bei Tempo-Übungen seit 11/2026 immer gespeichert, `true` oder `false`; ältere Einheiten haben nur `t: true` oder kein Feld), `b: 10|20|30|40` (Band-**Nennwert**; Klimmzug-Hilfe bzw. Pallof-Widerstand; die tatsächlichen kg stehen in den Einstellungen). Zwei Bänder kombiniert (seit 18.11.2026): `bs: [10, 30]` (aufsteigend, dann ohne `b`); Last = Summe der Band-kg × Band-Faktor. In der App: Hauptband wie bisher, darunter „+ Zusatzband“.
- Optionale Felder der Einheit (seit 11/2026): `bw` (Körpergewicht beim Speichern; fehlt bei älteren Einheiten → 90 kg), `note` (Notiz).
- Erneutes Speichern behält Einträge von Übungen, die nicht (mehr) im Plan stehen (z. B. `militarypress`, `abwheel`).
- Einstellungen: Dokument `_settings` in derselben Collection `{bodyweight, bandFactor, bandKg:{10,20,30,40}, sound, wakeLock, deloads:[Montage]}`; die App filtert Sitzungen über das ID-Muster, `_settings` erscheint nie als Einheit. Kopie in `localStorage["kraftplan-settings"]`.
- `w` bedeutet je nach Übung: kg **Scheiben ohne Stange** (`bar`), kg Kurzhantel, Zusatzgewicht (`kg+`), Fußhöhe in cm (`cm`) oder `null`.
- Modi: `connecting` → `db`; bricht der Snapshot ab: `offline` (Daten bleiben im Speicher, neu verbinden mit 2 s … 60 s Abstand); ohne DB: `local` mit `localStorage["kraftplan-sessions"]`.
- Offline/vor dem Verbinden gespeicherte Einheiten: `localStorage["kraftplan-pending"]` (`id → doc`), werden nach dem nächsten Snapshot (und alle 30 s) übertragen; Header zeigt „N warten auf Übertragung“.
- Entwürfe in `localStorage["kraftplan-drafts"]` (Schlüssel `date_day` → `{exId: [{w,r,j,t,b,done}]}`), Notiz-Entwürfe in `kraftplan-notes`, Zoom in `kraftplan-zoom`.
- Konventionen der DB-API, wie die App sie nutzt: `db.collection(p).orderBy("date","desc").limit(1000).onSnapshot(cb, errCb)`, `.doc(id).set/get/delete`, `get()` liefert `{exists}`. Siehe `reference/db.d.ts`.

## Plan (`PLAN`, Stand Export) – Felder pro Übung
`id, name, sets, min, max, rest(s), unit ("kg"|"kg+"|"cm"|null), step, tip?, ss?` plus optionale Schalter:
`bar` (Stangengewicht wird addiert), `bw` ("pull"|"push": Körpergewicht-Übung), `assist` (Auswahl Ohne Hilfe/Absprung/Band), `tempo` (Haltezeit-Schalter), `bandOnly` (nur Bandauswahl, z. B. Pallof), `repUnit` ("s": Wiederholungsfeld = Sekunden), `start` (Startgewicht-Vorschlag).

| Tag | Übungen |
|---|---|
| Mo „Power & Beine“ | Power Cleans (bar, 3×3, 120 s), Suitcase Carry (kg, 2×30–40 s pro Seite) |
| Di „Push & Trizeps“ | Einarmiges KH-Drücken halbknien (3×8–12, start 16 kg), Überkopf-Trizepsdrücken 1 KH (3×10–12) |
| Mi „Pull & Bizeps“ | Klimmzüge neutral an Ringen (bw pull, assist, 3×8–12), Schrägbank-Curls (2×10–12), Pallof Press (bandOnly, 2×10–12 pro Seite) |
| Do „Beine & Core“ | Front Squats (bar, 3×5), Knee to Elbow (2×8–12) |
| Fr „Quick-Push & Pull · unter 8 Min.“ | Langhantel-Rudern (bar, 3×6–8, Supersatz A1), Liegestütz mit Griffen, Füße erhöht (bw push, tempo, unit cm, 3×6–10, Supersatz A2) |
| Sa „Arm-Dicke & Schultern“ | KH-Hammer-Curls (3×10–12), KH-Seitheben (2×12–15), Seitstütz (2×20–40 s pro Seite) |

Entfernte Übungen (Daten bleiben in der DB, werden nicht angezeigt): `militarypress` (Langhantel-Schulterdrücken stehend, bar), `abwheel`, `birddog`.

## Konstanten und Einstellungen
Im Code: `LEGACY_BW = 90` (für Einheiten ohne `bw`), `JUMP_FACTOR = 0.6`, `TEMPO_FACTOR = 1.5`, `DELOAD_WEEKS = 6`, `DELOAD_PLATEAUS = 3`, `BAND_NAMES = {10:"grün",20:"gelb",30:"lila",40:"rot"}`. Stange = 20 kg (`bar`).
In den Einstellungen (Zahnrad): Körpergewicht (Standard 90), Band-kg je Nennwert (Standard = Nennwert), Band-Faktor (Standard 0,3), Ton, Bildschirm anlassen. Band-kg und Faktor wirken rückwirkend, das Körpergewicht nur auf neue Einheiten.
Band-Faktor messen: `f = (BW − BW·(1+r0/30)/(1+r1/30)) / Band-kg` (gleiche Epley-Maximalkraft ohne/mit Band). *Beispiel* (erfundene Zahlen): 90 kg, 5 Wdh. ohne, 7 Wdh. mit 30 kg → f ≈ 0,16.

## Last pro Wiederholung (`repLoad`)
- Klimmzug (`bw:"pull"`): `(BW + w)`; mit Absprung `× JUMP_FACTOR`; mit Band `− Band-kg × Band-Faktor`. (`BW` = `bw` der Einheit bzw. 90.)
- Liegestütz (`bw:"push"`): `BW × (0,64 + 0,002 × cm)`; mit Haltezeit `× TEMPO_FACTOR` (nur im Volumen, nicht in der Kraft).
- Pallof (`bandOnly`): `Band-kg × Band-Faktor`.
- Übungen mit Gewicht: `w + bar` (nur wenn `w` gesetzt).
- Zeitübungen (`repUnit`): Hauptwert = Zeit unter Spannung (Summe Sekunden); mit Gewicht zusätzlich „Last × Zeit“ (kg·s), das auch für die Plateau-Prüfung zählt.

## Statistik (`statSeries`, `renderStats`)
- **Volumen** pro Einheit = Σ (Last × Wiederholungen). Anzeige: letzte Einheit, „gesamt seit Start“ (letzte vs. erste Einheit) und „zur Vorwoche“ (letzte Einheit vs. letzte Einheit der **Kalenderwoche davor**, Mo–So).
- **Kraft** = geschätztes 1-Wdh-Maximum (Epley) des besten Satzes: `Last × (1 + r/30)`. Nur Übungen mit Gewicht/Körpergewicht sowie Pallof (Band-Last = Band-kg × Faktor, grober Richtwert, seit 18.11.2026), nicht bei `repUnit`. Sätze mit Absprung zählen nicht, Haltezeit zählt nicht (nur bewegtes Gewicht). Grund: Das Volumen kann sinken, wenn schwerer mit weniger Wiederholungen trainiert wird – die Kraft zeigt dann den Fortschritt.
- **Plateau-Warnung**: die letzten 3 Einheiten, Volumen ≤ +2 % gegenüber der ersten davon **und** (falls ≥ 3 Kraftwerte) Kraft ≤ +2 %.
- **Zähler**: „Wochen trainiert“ = Kalenderwochen mit ≥ 1 gespeicherter Einheit; „Wochen mit diesem Plan“ = Wochen seit der ersten Einheit inkl. laufender Woche (Start 12.10.2026).

## Progression (`progression`, Hinweis „Steigern / Last halten“)
Alle Sätze der letzten Einheit ≥ `max` → „Steigern“: Klimmzug mit Absprung → Band (rot), mit Band → nächst schwächeres Band, grün → ohne Band, ohne Hilfe → +`step` kg; Pallof → stärkeres Band; sonst +`step` kg bzw. cm, ohne Einheit „langsamer oder +2 Wdh.“, bei `repUnit` „länger halten“. Sonst „Last halten“. Vorschlagswerte in den Feldern = letzte Einheit (bzw. `start`).

## Weitere Funktionen
- **Bestwerte**: beim Speichern Vergleich mit allen anderen Einheiten (Kraft, sonst Hauptwert) → Toast „🏆 Bestwert“; in der Statistik „Bestwert“-Zeilen.
- **Deload**: Hinweis, wenn die 6 Wochen vor der laufenden Woche ohne Lücke trainiert wurden (Deload-Wochen unterbrechen) oder ≥ 3 Übungen im Plateau sind; „Diese Woche ist Deload“ speichert den Montag in `settings.deloads`.
- **Wochenübersicht**: grüner Punkt im Wochentag, wenn die Einheit der laufenden Kalenderwoche gespeichert ist; Zeile „Diese Woche: n von 6“.
- **Supersatz**: Haken bei A1 startet keine Pause, sondern scrollt zu A2; erst A2 startet die Pause.
- **Timer**: Ton (WebAudio, Einstellung), Bildschirm an (Wake Lock, bis 5 Min. nach der Pause bzw. bis zum Speichern).
- **Export/Import** (Einstellungen → Daten): JSON `{app, version, exportedAt, settings, sessions}`; Import akzeptiert das oder eine reine Liste (wie `data/sessions-export.json`), zeigt neu/abweichend/unverändert und überschreibt erst nach zweitem Tipp.

## Wichtige UI-Mechanik
- Teil-Updates: Haken, Hilfe- und Tempo-Schalter bauen nur ihre Übungskarte neu auf (`refreshEx`), Eingaben nur die Speichern-Leiste (`refreshSaveBar`). Voller Neuaufbau (`render`) bei Tag-/Datumswechsel, Speichern und Snapshots (verzögert, solange getippt wird).
- Entwürfe (`state.drafts`) überschreiben die Anzeige gespeicherter Einheiten. Beim Laden der DB werden **unberührte** oder **mit dem Gespeicherten identische** Entwürfe verworfen (`draftTouched`/`draftDiffers`), sonst bleibt eine leere Ansicht stehen.
- Unter dem Speichern-Button warnt „⚠ Noch nicht gespeichert“ bei Abweichung (`unsavedChanges`).
- Tab-Leiste: Tipp zählt nur, wenn `pointerdown` auf dem Tab begann und in den letzten 2,5 s kein anderer Tipp erfolgte; Sperre 5 s ab Speichern-Start; Warnung beim Wechsel mit ungespeicherten Änderungen.
- Tipp auf Wochentag setzt das Datum auf diesen Tag der Woche (liegt er in der Zukunft: Vorwoche), `dateForDay`.
- Timer: fixiert unten, `pointer-events:none` (nur Buttons klickbar), verschwindet während der Eingabe (`body.typing`).
