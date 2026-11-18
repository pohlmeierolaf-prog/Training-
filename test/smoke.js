// Smoke-Test ohne Browser: lädt src/kraftplan.html, stubbt das DOM minimal und prüft die Kernpfade.
// Start:  node test/smoke.js      (Exit-Code 0 = alles ok)
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "src", "kraftplan.html"), "utf8");
const sessions = JSON.parse(fs.readFileSync(path.join(root, "data", "sessions-export.json"), "utf8"));
let code = html.match(/<script>([\s\S]*)<\/script>/)[1];

const els = global.els = {}, docH = global.docH = {}, store = {};
const mk = (id) => els[id] || (els[id] = { id, innerHTML: "", textContent: "", hidden: false, style: { setProperty() {} },
  classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }, handlers: {}, dataset: {},
  addEventListener(t, f) { (this.handlers[t] = this.handlers[t] || []).push(f); } });
global.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } };
global.document = { querySelector: s => mk(s), addEventListener(t, f) { (docH[t] = docH[t] || []).push(f); }, activeElement: null,
  documentElement: { style: { setProperty() {} } }, body: { style: {}, classList: { add() {}, remove() {} } }, visibilityState: "visible" };
global.window = { innerWidth: 400, addEventListener() {}, scrollTo() {}, visualViewport: null };

global.failCount = 0;
global.check = (name, ok) => { console.log((ok ? "PASS " : "FAIL ") + name); if (!ok) global.failCount++; };
global.__sessions = sessions;

code += `
today = "2026-11-17";
state.sessions = __sessions.slice().sort((a, b) => b.date.localeCompare(a.date));
// 1) Alle Tage rendern
try { for (const d of DAYS) { state.day = d; state.tab = "train"; state.date = "2026-11-17"; render(); } check("alle Tage rendern", true); } catch (e) { check("alle Tage rendern: " + e.message, false); }
// 2) Verlauf + Statistik
try { state.tab = "hist"; render(); renderStats(); check("Verlauf und Statistik rendern", els["#statsBody"].innerHTML.includes("Wochen trainiert")); } catch (e) { check("Statistik: " + e.message, false); }
// 3) Eingabe, Haken und Speichern (lokaler Modus)
state.sessions = []; state.drafts = {}; state.day = "do"; state.date = "2026-11-19"; state.tab = "train"; render();
els["#app"].handlers.input[0]({ target: { dataset: { ex: "kneeelbow", i: "0", f: "r" }, value: "10" } });
els["#app"].handlers.input[0]({ target: { dataset: { ex: "kneeelbow", i: "1", f: "r" }, value: "10" } });
const sb = { id: "saveBtn", dataset: {}, closest() { return this; } };
els["#app"].handlers.click[0]({ target: sb }).then(() => {
  check("Speichern legt Einheit an", state.sessions.length === 1 && state.sessions[0].entries.kneeelbow.length === 2);
  check("Tab bleibt nach Speichern auf Training", state.tab === "train");
  // 4) Tab-Sperre: Tipp kurz nach anderem Tipp wird ignoriert
  docH.pointerdown.forEach(f => f({ target: { closest: () => null } }));
  state.tabLock = 0; tabDown = { id: "tabHist", t: Date.now() };
  els["#tabHist"].handlers.click[0]({ detail: 1 });
  check("Schnell-Tipp auf Verlauf wird ignoriert", state.tab === "train");
  state.lastOtherDown = 0; state.warnUntil = Date.now() + 5000;
  els["#tabHist"].handlers.click[0]({ detail: 1 });
  check("bewusster Tipp wechselt in den Verlauf", state.tab === "hist");
  // 5) Entwurf fehlt, Haken/Eingabe stürzen nicht ab
  state.tab = "train"; state.day = "di"; state.date = "2026-11-17"; render(); state.drafts = {};
  els["#app"].handlers.input[0]({ target: { dataset: { ex: "dbpress1", i: "0", f: "w" }, value: "16" } });
  check("Eingabe ohne vorhandenen Entwurf", state.drafts["2026-11-17_di"].dbpress1[0].w === 16);
  // 6) Statistik-Kennzahlen mit Beispielwerten
  state.sessions = [
    { id: "a", date: "2026-10-14", day: "mi", entries: { chinups: [{ r: 5, w: 0 }, { r: 4, w: 0 }, { r: 4, w: 0 }] } },
    { id: "b", date: "2026-10-21", day: "mi", entries: { chinups: [{ r: 11, w: 0, j: true }, { r: 10, w: 0, j: true }, { r: 8, w: 0, j: true }] } }];
  const cs = statSeries(PLAN.mi.ex[0]).pts;
  check("Klimmzug-Volumen strikt = 13 x 90", Math.abs(cs[0].v - 1170) < 1e-6);
  check("Kraft bei Absprung nicht berechnet", cs[1].e === null && cs[0].e > 0);
  return more();
}).then(() => {
  console.log(global.failCount ? "\\n" + global.failCount + " Test(s) fehlgeschlagen" : "\\nSMOKE OK"); process.exit(global.failCount ? 1 : 0);
}, (e) => { console.log("FEHLER", e && e.stack); process.exit(1); });

async function more() {
  const all = () => __sessions.slice().sort((a, b) => b.date.localeCompare(a.date));
  const click = (t) => els["#app"].handlers.click[0]({ target: Object.assign({ dataset: {}, closest() { return this; } }, t) });
  const input = (ex, i, f, value) => els["#app"].handlers.input[0]({ target: { dataset: { ex, i: String(i), f }, value: String(value) } });
  // 7) Entfernte Übungen: alte Einheit gilt nicht als ungespeichert, erneutes Speichern behält sie
  state.mode = "local"; localStorage.setItem(LS_SESS, JSON.stringify(__sessions)); loadLocal();
  state.drafts = {}; state.notes = {}; state.tab = "train"; state.day = "di"; state.date = "2026-11-03"; render();
  check("altes Di mit militarypress nicht 'ungespeichert'", !unsavedChanges());
  input("ohtriceps", 0, "r", 11);
  check("Änderung wird als ungespeichert erkannt", unsavedChanges());
  await save();
  const di = savedSession("2026-11-03_di");
  check("erneutes Speichern behält militarypress", !!(di && di.entries.militarypress && di.entries.militarypress.length) && di.entries.ohtriceps[0].r === 11);
  check("alte Einheit bekommt kein Körpergewicht nachträglich", di.bw === undefined);
  // 8) Progression mit Hilfe
  const chin = PLAN.mi.ex[0], pal = PLAN.mi.ex[2], top = (o) => ({ date: "x", sets: [0, 1, 2].map(() => Object.assign({ w: 0, r: 12 }, o)) });
  check("Band lila 12/12/12 → schwächeres Band", progression(chin, top({ b: 30 })).text.includes("schwächeres Band (gelb)"));
  check("Band grün → ohne Band", /ohne Band/.test(progression(chin, top({ b: 10 })).text));
  check("Absprung → Band", /Band statt Absprung/.test(progression(chin, top({ j: true })).text));
  check("ohne Hilfe → +2,5 kg", progression(chin, top({})).text === "Steigern: +2,5 kg");
  check("Pallof → stärkeres Band", progression(pal, { date: "x", sets: [{ w: null, r: 12, b: 30 }, { w: null, r: 12, b: 30 }] }).text.includes("stärkeres Band (rot)"));
  // 9) Haltezeit wird bei Tempo-Übungen immer gespeichert
  state.day = "fr"; state.date = "2026-11-20"; today = "2026-11-20"; render();
  input("declinepushup", 0, "r", 8); input("declinepushup", 0, "w", 40);
  click({ dataset: { tempo: "declinepushup" } });
  await save();
  const fr = savedSession("2026-11-20_fr");
  check("t:false ausdrücklich gespeichert", fr.entries.declinepushup[0].t === false);
  check("neue Einheit speichert Körpergewicht", fr.bw === settings.bodyweight);
  check("Text zeigt 'ohne Haltezeit'", /ohne Haltezeit/.test(setsText(PLAN.fr.ex[1], fr.entries.declinepushup)));
  // 10) Notiz
  state.day = "sa"; state.date = "2026-11-21"; today = "2026-11-21"; render();
  els["#app"].handlers.input[0]({ target: { id: "noteIn", dataset: {}, value: "Bizepssehne ok" } });
  check("Notiz allein zählt als ungespeichert", unsavedChanges());
  input("hammercurl", 0, "r", 10);
  await save();
  check("Notiz wird gespeichert", savedSession("2026-11-21_sa").note === "Bizepssehne ok" && !("2026-11-21_sa" in state.notes));
  // 11) Doppelt tippen speichert nur einmal
  let writes = 0; const ws0 = writeSession; writeSession = async (d) => { writes++; await new Promise(r => setTimeout(r, 20)); return ws0(d); };
  input("hammercurl", 1, "r", 10);
  await Promise.all([save(), save()]);
  writeSession = ws0;
  check("Doppeltipp auf Speichern = ein Schreibvorgang", writes === 1);
  // 12) Wochenübersicht
  today = "2026-11-21"; state.day = "sa"; state.date = today; render();
  check("Wochenübersicht markiert Fr und Sa", /data-day="fr" class="[^"]*done/.test(els["#app"].innerHTML) && /2 von 6/.test(els["#app"].innerHTML));
  // 13) Supersatz: A1 startet keine Pause, A2 schon
  state.day = "fr"; state.date = "2026-11-27"; today = "2026-11-27"; render(); $("#timer").hidden = true;
  await click({ dataset: { check: "bbrow", i: "0", phw: "20", phr: "8" } });
  check("Supersatz A1: keine Pause", $("#timer").hidden === true);
  await click({ dataset: { check: "declinepushup", i: "0", phw: "40", phr: "8" } });
  check("Supersatz A2: Pause startet", $("#timer").hidden === false);
  // 14) Offline: vormerken und nach Wiederverbindung übertragen
  const remote = {};
  col = { doc: (id) => ({ set: async (d) => { remote[id] = JSON.parse(JSON.stringify(d)); }, get: async () => ({ exists: id in remote, data: () => remote[id] }), delete: async () => { delete remote[id]; } }),
    orderBy: () => ({ limit: () => ({ onSnapshot: () => () => {} }) }) };
  state.mode = "offline"; state.drafts = {}; state.day = "mo"; state.date = "2026-11-23"; today = "2026-11-23"; render();
  input("powerclean", 0, "w", 20); input("powerclean", 0, "r", 3);
  await save();
  check("offline: Einheit vorgemerkt", !!pending["2026-11-23_mo"] && !remote["2026-11-23_mo"] && !!savedSession("2026-11-23_mo"));
  onSnap({ docs: [] });
  await new Promise(r => setTimeout(r, 30));
  check("nach Wiederverbindung übertragen", !!remote["2026-11-23_mo"] && !pendingCount());
  check("Snapshot ignoriert Einstellungs-Dokument", (onSnap({ docs: [{ id: "_settings", data: () => ({}) }] }), !state.sessions.some(s => s.id === "_settings")));
  // 15) Band-Faktor messen (Beispielwerte: 5 Wdh. ohne, 7 Wdh. mit lila 30 kg, 90 kg)
  check("Band-Faktor-Rechnung", Math.abs(calcBandFactor(90, 5, 7, 30) - 0.162) < 0.001);
  // 16) Import
  state.mode = "local"; localStorage.setItem(LS_SESS, "[]"); loadLocal();
  const plan = parseImport(JSON.stringify(__sessions.concat([{ id: "kaputt" }])));
  check("Import erkennt alle Einheiten", plan.add.length === __sessions.length && plan.skipped === 1);
  for (const d of plan.add) await writeSession(d);
  const again = parseImport(exportJson());
  check("Export → Import ohne Unterschiede", again.add.length === 0 && again.change.length === 0 && again.same === __sessions.length);
  // 17) Deload-Hinweis nach 6 Wochen am Stück
  state.sessions = [0, 1, 2, 3, 4, 5].map(i => ({ id: addDays("2026-10-05", 7 * i) + "_mo", date: addDays("2026-10-05", 7 * i), day: "mo", entries: {} }));
  today = "2026-11-16"; settings.deloads = [];
  check("Deload nach 6 Wochen empfohlen", deloadInfo().due === true);
  settings.deloads = ["2026-11-16"];
  check("Deload-Woche markiert", deloadInfo().active === true);
  settings.deloads = [];
  // 18) Bestwert-Erkennung
  state.sessions = [{ id: "2026-11-05_do", date: "2026-11-05", day: "do", entries: { frontsquat: [{ w: 30, r: 5 }] } }];
  check("neuer Bestwert erkannt", newRecords({ id: "2026-11-12_do", date: "2026-11-12", day: "do", entries: { frontsquat: [{ w: 32.5, r: 5 }] } }).length === 1);
  check("kein Bestwert bei weniger Last", newRecords({ id: "2026-11-12_do", date: "2026-11-12", day: "do", entries: { frontsquat: [{ w: 25, r: 5 }] } }).length === 0);
  // 19) Neuer Tag mit offenen Eingaben: "heute" wird trotzdem aktualisiert
  state.sessions = []; state.drafts = {}; today = "2026-11-24"; state.day = "di"; state.date = today; render(); input("dbpress1", 0, "r", 8);
  const RD = Date; Date = class extends RD { constructor(...a) { if (a.length) super(...a); else super("2026-11-25T08:00:00"); } static now() { return RD.now(); } };
  docH.visibilitychange.forEach(f => f()); Date = RD;
  check("neuer Tag aktualisiert 'heute', Eingabe bleibt", today === "2026-11-25" && state.date === "2026-11-24");
  // 20) Einstellungen und Statistik rendern
  openSheet("settings"); check("Einstellungen rendern", /Band-Faktor messen/.test(els["#setBody"].innerHTML)); closeSheet();
  state.sessions = all(); openSheet("stats"); check("Statistik zeigt Zeit unter Spannung", /Zeit unter Spannung/.test(els["#statsBody"].innerHTML)); closeSheet();
  // 21) Bänder kombinieren (Pallof lila + grün)
  state.mode = "local"; localStorage.setItem(LS_SESS, "[]"); loadLocal(); state.drafts = {}; state.saving = false;
  today = "2026-11-18"; state.tab = "train"; state.day = "mi"; state.date = today; render();
  await click({ dataset: { assist: "pallof", mode: "30" } });
  await click({ dataset: { assist: "pallof", mode: "30" } });
  check("erneuter Tipp aufs Hauptband lässt es gewählt", assistCur(draftFor("pallof", 2)).main === "30");
  await click({ dataset: { extra: "pallof", band: "10" } });
  check("Zusatzband: lila + grün gewählt", JSON.stringify(assistCur(draftFor("pallof", 2))) === JSON.stringify({ main: "30", extra: "10" }));
  input("pallof", 0, "r", 10); input("pallof", 1, "r", 10);
  await save();
  const pal2 = savedSession("2026-11-18_mi").entries.pallof;
  check("Kombination gespeichert als bs [10, 30]", JSON.stringify(pal2[0].bs) === "[10,30]" && pal2[0].b === undefined);
  check("Kombination: Last = (10 + 30) × Faktor", Math.abs(setLoad(PLAN.mi.ex[2], pal2[0], 90) - 40 * settings.bandFactor) < 1e-9);
  check("Text zeigt 'Bänder lila + grün'", setsText(PLAN.mi.ex[2], pal2).includes("Bänder lila + grün"));
  check("Gespeicherte Kombination gilt nicht als ungespeichert", (render(), !unsavedChanges()));
  check("nach dem Laden: stärkstes Band als Hauptband", JSON.stringify(assistCur(draftFor("pallof", 2))) === JSON.stringify({ main: "30", extra: "10" }));
  await click({ dataset: { extra: "pallof", band: "" } });
  check("Zusatzband 'keins' entfernt nur das Zusatzband", JSON.stringify(assistCur(draftFor("pallof", 2))) === JSON.stringify({ main: "30", extra: null }));
  await click({ dataset: { extra: "pallof", band: "10" } }); await click({ dataset: { assist: "pallof", mode: "40" } });
  check("Wechsel des Hauptbands ersetzt die Kombination", JSON.stringify(assistCur(draftFor("pallof", 2))) === JSON.stringify({ main: "40", extra: null }));
  await click({ dataset: { assist: "pallof", mode: "none" } });
  check("'Kein Band' löscht alle", assistCur(draftFor("pallof", 2)).main === "none");
  check("altes Format b:30 = Auswahl lila", setLoad(PLAN.mi.ex[2], { r: 10, b: 30 }, 90) === 30 * settings.bandFactor && normEntries({ p: [{ r: 1, b: 30 }] }) === normEntries({ p: [{ r: 1, bs: [30] }] }));
  check("Klimmzug mit Kombination → ein Band weglassen", progression(PLAN.mi.ex[0], { date: "x", sets: [0, 1, 2].map(() => ({ w: 0, r: 12, bs: [10, 30] })) }).text.includes("grün weglassen"));
}`;
try { new Function(code)(); } catch (e) { console.log("FEHLER", e.stack.split("\n").slice(0, 3).join("\n")); process.exit(1); }
