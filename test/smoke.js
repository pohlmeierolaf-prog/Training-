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
  console.log(global.failCount ? "\\n" + global.failCount + " Test(s) fehlgeschlagen" : "\\nSMOKE OK"); process.exit(global.failCount ? 1 : 0);
});`;
try { new Function(code)(); } catch (e) { console.log("FEHLER", e.stack.split("\n").slice(0, 3).join("\n")); process.exit(1); }
